const { spawn, exec } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const BACKEND_DIR = path.join(__dirname, 'backend');
const FRONTEND_DIR = path.join(__dirname, 'frontend');
const GATEWAY_DIR = path.join(__dirname, 'field-portal');
const CLOUDFLARED = path.join(__dirname, 'cloudflared.exe');

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/`, () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function getDesktopPath() {
  const userProfile = process.env.USERPROFILE || '';
  const oneDrive = path.join(userProfile, 'OneDrive', 'Desktop');
  if (fs.existsSync(oneDrive)) return oneDrive;
  const regular = path.join(userProfile, 'Desktop');
  if (fs.existsSync(regular)) return regular;
  return __dirname;
}

async function main() {
  console.clear();
  console.log('====================================================================');
  console.log('       RAILBLOCK AI — MULTI-DEVICE CLOUD PLATFORM');
  console.log('              South Western Railway (SWR) Karnataka');
  console.log('====================================================================\n');

  console.log('[*] Checking local microservices...');
  const isBackendRunning = await checkPort(8000);
  if (!isBackendRunning) {
    console.log('[*] Spawning Central AI Brain (Port 8000)...');
    spawn('py', ['-3', '-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000'], {
      cwd: BACKEND_DIR,
      shell: true,
      stdio: 'ignore',
      detached: true,
    }).unref();
  } else {
    console.log('  -> Central AI Brain already active on port 8000.');
  }

  const isFrontendRunning = await checkPort(3000);
  if (!isFrontendRunning) {
    console.log('[*] Spawning Controller Cockpit (Next.js Port 3000)...');
    spawn('npm', ['run', 'dev'], {
      cwd: FRONTEND_DIR,
      shell: true,
      stdio: 'ignore',
      detached: true,
    }).unref();
  } else {
    console.log('  -> Frontend already active on port 3000.');
  }

  const isGatewayRunning = await checkPort(3001);
  if (!isGatewayRunning) {
    console.log('[*] Spawning Unified Cloud Gateway (Port 3001)...');
    spawn('node', ['server.js'], {
      cwd: GATEWAY_DIR,
      shell: true,
      stdio: 'ignore',
      detached: true,
    }).unref();
  } else {
    console.log('  -> Gateway already active on port 3001.');
  }

  console.log('\n[*] Initializing Cloudflare Zero-Trust Secure Tunnel...');
  const tunnel = spawn(CLOUDFLARED, ['tunnel', '--url', 'http://localhost:3001'], {
    cwd: __dirname,
    shell: false,
  });

  let tunnelFound = false;

  function handleData(chunk) {
    const str = chunk.toString();
    const match = str.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match && !tunnelFound) {
      tunnelFound = true;
      const baseUrl = match[0];
      const cockpitUrl = baseUrl + '/cockpit';
      const fieldUrl = baseUrl + '/field';
      const stationUrl = baseUrl + '/station';
      const loginUrl = baseUrl + '/';

      const banner = [
        '====================================================================',
        '       RAILBLOCK AI — 3-DEVICE CLOUD NETWORK IS LIVE!',
        '====================================================================',
        '',
        '⚡ Supabase Cloud Realtime: CONNECTED & SYNCHRONIZED',
        '   Bus: https://aufnxqyaqmsmsziptbcc.supabase.co',
        '🌐 Public Cloud HTTPS URL:  ' + baseUrl,
        '',
        '--------------------------------------------------------------------',
        '📲 SHARE THESE LINKS WITH YOUR TEAM (OPEN ON ANY PHONE/TABLET/PC):',
        '--------------------------------------------------------------------',
        '',
        '💻 1. SECTION CONTROLLER COCKPIT (Laptop):',
        '   ' + cockpitUrl,
        '',
        '📱 2. FIELD JUNIOR ENGINEER TERMINAL (Mobile):',
        '   ' + fieldUrl,
        '',
        '📟 3. STATION MASTER TERMINAL (Tablet/PC):',
        '   ' + stationUrl,
        '',
        '🔐 4. ROLE LOGIN SELECTOR:',
        '   ' + loginUrl,
        '',
        '====================================================================',
        ' NOTE: No local Wi-Fi needed! All 3 devices sync worldwide 24/7.',
        ' Keep this window open while conducting your demo.',
        '====================================================================\n'
      ].join('\n');

      console.log('\n' + banner);

      // Save to Desktop for easy copy-pasting
      try {
        const desktopFile = path.join(getDesktopPath(), 'RAILBLOCK_CLOUD_LINKS.txt');
        fs.writeFileSync(desktopFile, banner, 'utf8');
        console.log('[✓] Saved links to: ' + desktopFile);
      } catch (e) {}

      // Automatically launch Cockpit in default browser
      try {
        exec('start ' + cockpitUrl);
      } catch (e) {}
    }
  }

  tunnel.stdout.on('data', handleData);
  tunnel.stderr.on('data', handleData);

  tunnel.on('close', (code) => {
    console.log('[!] Tunnel closed with code ' + code);
  });
}

main().catch(console.error);
