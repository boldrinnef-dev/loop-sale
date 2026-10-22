import Link from 'next/link';
import DeliveryCheckControl from '@/components/DeliveryCheck';

/** Everything a shopper sees. The Studio sits outside this on purpose. */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="header">
        <div className="wrap header-inner">
          <Link href="/" className="logo">
            <span className="logo-name">Nestloop</span>
            <span className="logo-tag">Shop</span>
          </Link>
          <div className="header-spacer" />
          <a className="header-link" href="https://nestloop.in">
            Rent instead
          </a>
          <DeliveryCheckControl />
        </div>
      </header>

      {children}

      <footer className="footer">
        <div className="wrap footer-inner">
          <span>Nestloop, Vennala, Kochi</span>
          <span>Every unit is one piece, photographed before it is listed.</span>
        </div>
      </footer>
    </>
  );
}
