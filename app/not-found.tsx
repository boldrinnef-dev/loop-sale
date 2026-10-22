import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="wrap">
      <div className="empty">
        <h2>That unit is gone</h2>
        <p>
          It was either sold, or the link is wrong. Everything still in stock is on the
          shop page.
        </p>
        <p>
          <Link href="/">Back to the shop</Link>
        </p>
      </div>
    </main>
  );
}
