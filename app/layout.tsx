import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

// Loaded as a stylesheet rather than through next/font so the build never
// depends on reaching Google at build time.
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
      <body>
        <header className="header">
          <div className="wrap header-inner">
            <Link href="/" className="logo">
              <span className="logo-name">Nestloop</span>
              <span className="logo-tag">Shop</span>
            </Link>
            <div className="header-spacer" />
            <span className="pill">
              <svg width="13" height="15" viewBox="0 0 14 16" aria-hidden="true">
                <path
                  d="M7 1.2c2.3 0 4.1 1.8 4.1 4.1 0 3-4.1 9.2-4.1 9.2S2.9 8.3 2.9 5.3C2.9 3 4.7 1.2 7 1.2z"
                  fill="none"
                  stroke="#0F3B5C"
                  strokeWidth="1.4"
                />
                <circle cx="7" cy="5.3" r="1.5" fill="#0F3B5C" />
              </svg>
              Kochi, within 20 km
            </span>
          </div>
        </header>

        {children}

        <footer className="footer">
          <div className="wrap footer-inner">
            <span>Nestloop, Vennala, Kochi</span>
            <span>Every unit is one piece, photographed before it is listed.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
