import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import { imageUrl, sanityConfigured } from '@/lib/sanity';
import { SAMPLE_UNITS } from '@/lib/sample';
import { getUnit, rupees, type Unit } from '@/lib/units';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Reserve this unit, Nestloop Shop',
  robots: { index: false }
};

async function resolveUnit(slug: string): Promise<Unit | null> {
  if (sanityConfigured) return getUnit(slug);
  return SAMPLE_UNITS.find((u) => u.slug === slug) ?? null;
}

export default async function BookPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const unit = await resolveUnit(slug);
  if (!unit) notFound();

  // A unit someone else already took must not accept another booking.
  if (unit.status !== 'available') {
    return (
      <main className="wrap">
        <div className="empty">
          <h2>Someone got there first</h2>
          <p>
            {unit.title} is no longer available. Every listing here is a single physical
            unit, so once it goes it is gone.
          </p>
          <p>
            <Link href="/">See what is still in stock</Link>
          </p>
        </div>
      </main>
    );
  }

  const advance = unit.advanceAmount ?? 500;
  const thumb = imageUrl(unit.images?.[0]?.ref, 160, 160);

  return (
    <main className="wrap book-page">
      <Link href={`/unit/${unit.slug}`} className="back">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M10 3L5 8l5 5"
            fill="none"
            stroke="#0F3B5C"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back
      </Link>

      <h1 className="book-title">Reserve this unit</h1>

      <div className="book-summary">
        <div className="book-thumb">
          {thumb ? (
            <img src={thumb} alt={unit.title} />
          ) : (
            <span className="mono photo-note">PHOTO</span>
          )}
        </div>
        <div className="book-summary-text">
          <span className="book-summary-name">{unit.title}</span>
          <span className="mono code">
            {unit.productCode}
            {unit.grade ? ` · Grade ${unit.grade}` : ''}
          </span>
        </div>
        <span className="book-summary-price">{rupees(unit.salePrice)}</span>
      </div>

      <BookingForm
        productCode={unit.productCode}
        title={unit.title}
        salePrice={unit.salePrice}
        advance={advance}
        warrantyEligible={Boolean(unit.warrantyEligible)}
        whatsappNumber={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ''}
      />
    </main>
  );
}
