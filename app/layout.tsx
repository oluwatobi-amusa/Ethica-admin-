import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './provider';

export const metadata: Metadata = {
  title: 'Ethica | Bank operations',
  description: 'Mobile banking customer operations portal',
  icons: {
    icon: '/favicon.png'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
