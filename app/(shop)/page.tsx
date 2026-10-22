import Link from 'next/link';
import Filters, { PRICE_BANDS, type Active } from '@/components/Filters';
import SetupNotice from '@/components/SetupNotice';
import UnitCard from '@/components/UnitCard';
import { sanityConfigured } from '@/lib/sanity';
import { SAMPLE_UNITS } from '@/lib/sample';
import { CATEGORIES, getCatalog, type Unit } from '@/lib/units';

export const revalidate = 60;

export default async function CatalogPage({
  searchParams
}: {
  searchParams: Promise<{ c?: string; p?: string; g?: string }>;
}) {
  const sp = await searchParams;
  const all = sanityConfigured ? await getCatalog() : SAMPLE_UNITS;

  const present = CATEGORIES.filter((cat) => all.some((u) => u.category === cat.value));
  const band = PRICE_BANDS.find((b) => b.value === sp.p) ?? null;

  const active: Active = {
    c: present.some((p) => p.value === sp.c) ? sp.c! : null,
    p: band ? band.value : null,
    g: sp.g === 'A' || sp.g === 'B' ? sp.g : null
  };

  const units = all.filter((u) => matches(u, active));
  const inStock = units.filter((u) => u.status === 'available').length;

  return (
    <main>
      <Hero />

      {!sanityConfigured && <SetupNotice />}

      {present.length > 0 && (
        <nav className="chips" aria-label="Filter by category">
          <Link href="/" className="chip" aria-current={active.c === null}>
            All
          </Link>
          {present.map((cat) => (
            <Link
              key={cat.value}
              href={`/?c=${cat.value}`}
              className="chip"
              aria-current={active.c === cat.value}
            >
              {cat.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="wrap catalog">
        {present.length > 0 && (
          <Filters active={active} categories={present} units={all} />
        )}

        <div className="catalog-main">
          <div className="count-row">
            <strong>
              {inStock} {inStock === 1 ? 'unit' : 'units'} in stock
            </strong>
            <span>Sold units stay listed for three days, then drop off</span>
          </div>

          {units.length === 0 ? (
            <div className="empty">
              <h2>Nothing matches that</h2>
              <p>
                {all.length > 0
                  ? 'Try clearing a filter. New stock lands at the godown most weeks.'
                  : 'New stock lands at the godown most weeks. Message us on WhatsApp and we will tell you when something matching turns up.'}
              </p>
              {all.length > 0 && <Link href="/">Show everything</Link>}
            </div>
          ) : (
            <div className="grid">
              {units.map((unit) => (
                <UnitCard key={unit.productCode} unit={unit} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function matches(unit: Unit, active: Active): boolean {
  if (active.c && unit.category !== active.c) return false;
  if (active.g && unit.grade !== active.g) return false;
  if (active.p) {
    const band = PRICE_BANDS.find((b) => b.value === active.p);
    if (band && (unit.salePrice < band.min || unit.salePrice > band.max)) return false;
  }
  return true;
}

function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-inner">
        <h1>Refurbished appliances and furniture, checked and photographed</h1>
        <p>
          Every piece here is one physical unit with its own photos, including the dents.
          Book it, pay the balance when it reaches your door. Delivered across Kochi
          within 20 km.
        </p>
      </div>
    </section>
  );
}
