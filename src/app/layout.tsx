import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'CA-VISIT | Personal UPSC Quiz & Mistake Revision',
  description:
    'A personal mistake-revision and target quiz app for UPSC and competitive exam preparation with AI bulk importing and memory heatmaps.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: '/logo.png',
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#800020',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="shortcut icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased selection:bg-primary-tint selection:text-primary">
        <Navigation />
        <main className="flex-1 pb-20 md:pb-8 pt-3 sm:pt-4 px-3 sm:px-6 md:px-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
