import type { Metadata } from 'next';
import './globals.css';
import { ShellLayout } from '../components/layout/ShellLayout';

export const metadata: Metadata = {
  title: 'RailBlock AI — Multi-Agent Corridor Operating System',
  description:
    'National-grade autonomous corridor possession operating system for Indian Railways. Smart India Hackathon 2026.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-slate-900 antialiased font-sans">
        <ShellLayout>{children}</ShellLayout>
      </body>
    </html>
  );
}
