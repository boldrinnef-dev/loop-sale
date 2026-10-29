import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeliveryLine from '@/components/DeliveryLine';
import AddOns from '@/components/AddOns';
import Gallery from '@/components/Gallery';
import { imageUrl, sanityConfigured } from '@/lib/sanity';
import { INCLUDED_WARRANTY_MONTHS } from '@/lib/warranty';
import { SAMPLE_UNITS } from '@/lib/sample';
import {
  categoryLabel,
  discountPercent,
  getUnit,
  rupees,
  whatsappLink,
  type Unit
} from '@/lib/units';

export const revalidate = 60;

const INCLUDED_LABELS: Record<string, string> = {
  'inlet-pipe': 'Inlet pipe',
  'drain-pipe': 'Drain pipe',
  shelves: 'Shelves',
  trays: 'Trays',
  remote: 'Remote',
  keys: 'Keys',
  stabiliser: 'Stabiliser'
};

async function resolveUnit(slug: string): Promise<Unit | null> {
  if (sanityConfigured) return getUnit(slug);
  return SAMPLE_UNITS.find((u) => u.slug === slug) ?? null;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const unit = await resolveUnit(slug);
  if (!unit) return { title: 'Unit not found, Nestloop Shop' };
  return {
    title: `${unit.title}, ${rupees(unit.salePrice)}, Nestloop Shop`,
    description: unit.conditionNote ?? undefined
  };
}

export default async function UnitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = await resolveUnit(slug);
  if (!unit || unit.status === 'draft' || unit.status === 'withdrawn') notFound();

  const available = unit.status === 'available';
  const off = discountPercent(unit);
  const advance = unit.advanceAmount ?? 500;
  const balance = unit.salePrice - advance;
  const defect = imageUrl(unit.defectImage, 320, 320, 'contain');

  return (
    <main className="wrap unit">
      <Link href="/" className="back">
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
        Shop
      </Link>

      <div className="unit-layout">
        <Gallery
          images={unit.images ?? []}
          video={unit.video}
          videoCaption={unit.videoCaption}
          title={unit.title}
          sold={available ? null : unit.status === 'sold' ? 'SOLD' : 'RESERVED'}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="unit-head">
            <h1>{unit.title}</h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 9,
                flexWrap: 'wrap'
              }}
            >
              <span className="unit-price">{rupees(unit.salePrice)}</span>
              {unit.strikePrice && unit.strikePrice > unit.salePrice && (
                <span className="strike" style={{ fontSize: 14 }}>
                  {rupees(unit.strikePrice)}
                </span>
              )}
              {off !== null && (
                <span className="save-tag">
                  SAVE {rupees((unit.strikePrice ?? 0) - unit.salePrice)}
                </span>
              )}
            </div>
            <DeliveryLine salePrice={unit.salePrice} />
          </div>

          {unit.condition !== 'new' && unit.conditionNote && (
            <section className="panel">
              <div className="panel-head">Condition of this exact unit</div>
              <div className="panel-body">
                <div className="defect-thumb">
                  {defect ? (
                    <img src={defect} alt="Close up of the marks on this unit" />
                  ) : (
                    <span className="mono photo-note">DEFECT<br />PHOTO</span>
                  )}
                </div>
                <p>{unit.conditionNote}</p>
              </div>
            </section>
          )}

          <Specs unit={unit} includedLabels={INCLUDED_LABELS} />

          <div className="notes">
            <Note
              text={`${rupees(advance)} books it. Balance of ${rupees(
                balance
              )} on delivery, UPI or cash.`}
            />
            <Note
              text={
                unit.condition === 'new'
                  ? 'Unpacked and set up at your place before our team leaves.'
                  : 'Powered on and shown working before our team leaves.'
              }
            />
            {/* The warranty is stated in the spec list and again in its own
                section below. A third mention here was noise. */}
          </div>

          {unit.warrantyEligible && <AddOns />}
        </div>
      </div>

      <div className="buybar">
        <div className="wrap buybar-inner">
          <div className="buybar-price">
            <span>{available ? 'Book for' : 'Price'}</span>
            <strong>{available ? rupees(advance) : rupees(unit.salePrice)}</strong>
          </div>
          {available ? (
            <Link className="btn" href={`/book/${unit.slug}`}>
              Reserve this unit
            </Link>
          ) : (
            <span className="btn is-disabled">No longer available</span>
          )}
        </div>
      </div>
    </main>
  );
}

function Specs({
  unit,
  includedLabels
}: {
  unit: Unit;
  includedLabels: Record<string, string>;
}) {
  const rows: [string, string][] = [];
  if (unit.brand) rows.push(['Brand', [unit.brand, unit.model].filter(Boolean).join(' ')]);
  if (unit.capacity) rows.push(['Capacity', unit.capacity]);
  if (unit.approxAgeYears !== null && unit.approxAgeYears !== undefined) {
    rows.push(['Approximate age', `${unit.approxAgeYears} years`]);
  }
  if (unit.condition === 'new') {
    rows.push(['Condition', 'Brand new, unused']);
  } else if (unit.grade) {
    rows.push([
      'Condition grade',
      unit.grade === 'A' ? 'A, cosmetically clean' : 'B, light visible wear'
    ]);
  }
  if (unit.warrantyEligible) {
    rows.push([
      'Warranty',
      `${INCLUDED_WARRANTY_MONTHS} month included, extendable to 6`
    ]);
  }
  rows.push(['Category', categoryLabel(unit.category)]);
  rows.push(['Unit code', unit.productCode]);
  if (unit.included && unit.included.length > 0) {
    rows.push([
      'Included',
      unit.included.map((i) => includedLabels[i] ?? i).join(', ')
    ]);
  }

  return (
    <dl className="specs">
      {rows.map(([k, v]) => (
        <div className="spec-row" key={k}>
          <dt>{k}</dt>
          <dd className={k === 'Unit code' ? 'mono' : undefined}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Note({ text }: { text: string }) {
  return (
    <div className="note">
      <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M3.2 8.4l3.1 3.1 6.5-6.9"
          fill="none"
          stroke="#15653F"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{text}</span>
    </div>
  );
}
