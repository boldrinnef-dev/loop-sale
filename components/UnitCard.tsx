import Link from 'next/link';
import { imageUrl } from '@/lib/sanity';
import { discountPercent, rupees, type Unit } from '@/lib/units';

export default function UnitCard({ unit }: { unit: Unit }) {
  const gone = unit.status !== 'available';
  const src = imageUrl(unit.images?.[0]?.ref, 600, 600, 'contain');
  const off = discountPercent(unit);

  const inner = (
    <>
      <div className="card-photo">
        {src ? (
          <img src={src} alt={unit.images?.[0]?.alt || unit.title} loading="lazy" />
        ) : (
          <span className="mono photo-note">PHOTO PENDING</span>
        )}

        {gone ? (
          <span className="badge sold">{unit.status === 'sold' ? 'SOLD' : 'RESERVED'}</span>
        ) : (
          unit.grade && <span className="badge">Grade {unit.grade}</span>
        )}

        {!gone && off !== null && <span className="badge save">{off}% off</span>}
      </div>

      <div className="card-body">
        <span className="card-title">{unit.title}</span>
        <span className="price-row">
          <span className="price">{rupees(unit.salePrice)}</span>
          {unit.strikePrice && unit.strikePrice > unit.salePrice && (
            <span className="strike">{rupees(unit.strikePrice)}</span>
          )}
        </span>
        <span className="mono code">{unit.productCode}</span>
      </div>
    </>
  );

  if (gone) {
    return <div className="card is-gone">{inner}</div>;
  }

  return (
    <Link href={`/unit/${unit.slug}`} className="card">
      {inner}
    </Link>
  );
}
