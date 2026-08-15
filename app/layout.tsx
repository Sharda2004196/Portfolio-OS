import type {Metadata} from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'PortfolioOS v1.0 — Sharda Vatsal Bhat',
  description: 'Desktop-inspired personal portfolio website for Sharda Vatsal Bhat, Agentic AI Engineer.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      {/* San Francisco (SF Pro Display) — Apple's system font, loaded from CDN (not on Google Fonts) */}
      <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/sf-pro-display" precedence="default" />
      <body suppressHydrationWarning className="bg-[#0a0620] text-white antialiased font-sans overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
