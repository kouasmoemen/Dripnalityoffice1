import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DRIPNALITY® — Designed with Purpose',
  description: 'A considered collection of heavyweight essentials.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
