import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'RailBlock AI — SWR Karnataka Field & Station Terminal',
  description: 'Mobile Field Portal & Station Master Terminal for South Western Railway (SWR)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080C14] text-slate-100 min-h-screen flex flex-col font-sans">
        {/* Top Header */}
        <header className="sticky top-0 z-50 bg-[#0F172A]/90 backdrop-blur border-b border-slate-800 px-4 py-3">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 text-sm">
                SWR
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm tracking-wide text-white">RailBlock AI</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700">
                    PORT 3001
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Karnataka Division • Field & Station Operating Terminal
                </p>
              </div>
            </div>

            <nav className="flex items-center space-x-2 text-xs font-medium">
              <Link
                href="/field/request"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                📱 Field JE Demand
              </Link>
              <Link
                href="/station"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                🚉 Station Terminal
              </Link>
              <a
                href="http://localhost:3000/cockpit"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 transition flex items-center space-x-1"
              >
                <span>🖥️ Cockpit (Port 3000)</span>
                <span>↗</span>
              </a>
            </nav>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-3 text-center text-slate-500 text-xs">
          South Western Railway • Karnataka Division • Real-Time Closed-Loop AI Platform
        </footer>
      </body>
    </html>
  );
}
