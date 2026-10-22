import type { Metadata } from 'next';
import './globals.css';

// Bare root. The shop's header and footer live in app/(shop)/layout.tsx so that
// /studio renders on its own, full height, with none of the shop chrome.
const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600;700&display=swap';

export const metadata: Metadata = {
  title: 'Nestloop Shop, refurbished appliances and furniture in Kochi',
  description:
    'Refurbished refrigerators, washing machines and furniture, checked and photographed unit by unit. Delivered across Kochi within 20 km.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS_HREF} />
      </head>
      <body>{children}</body>
    </html>
  );
}
