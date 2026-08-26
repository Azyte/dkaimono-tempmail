import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';

export const metadata: Metadata = {
  title: 'TempMail Pro Max — Custom Domain & Realtime Temp Email',
  description:
    'Temporary Disposable Email with Custom Domain loginptn.xyz, Catch-All Routing, and Instant Realtime Inbox.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TempMail',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#060913',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#060913" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
