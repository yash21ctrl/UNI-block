const http = require('http');

const PORT = 3001;
const TARGET_HOST = '127.0.0.1';
const TARGET_PORT = 3000;

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  const isApi = url.startsWith('/api');
  const targetPort = isApi ? 8000 : TARGET_PORT;

  const options = {
    hostname: TARGET_HOST,
    port: targetPort,
    path: url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${targetPort}`,
      'x-forwarded-host': req.headers.host || `localhost:${PORT}`,
      'x-forwarded-proto': req.headers['x-forwarded-proto'] || 'http',
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('RailBlock AI Proxy Error: Target server offline or unreachable.');
  });

  req.pipe(proxyReq, { end: true });
});

// Handle WebSocket upgrade proxying
server.on('upgrade', (req, socket, head) => {
  const isWsApi = req.url.startsWith('/api');
  const targetPort = isWsApi ? 8000 : TARGET_PORT;

  const proxyReq = http.request({
    hostname: TARGET_HOST,
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${targetPort}`,
    },
  });

  socket.on('error', () => {
    socket.destroy();
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    proxySocket.on('error', () => {
      proxySocket.destroy();
    });
    socket.on('error', () => {
      socket.destroy();
    });

    socket.write(
      `HTTP/1.1 101 Switching Protocols\r\n` +
      Object.entries(proxyRes.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\r\n') +
      '\r\n\r\n'
    );
    if (proxyHead && proxyHead.length) proxySocket.unshift(proxyHead);
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxyReq.on('error', () => {
    socket.destroy();
  });

  proxyReq.end();
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`RailBlock AI Field Portal Gateway listening on 0.0.0.0:${PORT}`);
});
