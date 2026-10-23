import Link from 'next/link';
import Filters, { PRICE_BANDS, type Active } from '@/components/Filters';
import SetupNotice from '@/components/SetupNotice';
import UnitCard from '@/components/UnitCard';
import { sanityConfigured } from '@/lib/sanity';
import { SAMPLE_UNITS } from '@/lib/sample';
import { CATEGORIES, getCatalog, type Unit } from '@/lib/units';

export const revalidate = 60;

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

export default async function CatalogPage({
  searchParams
}: {
  searchParams: Promise<{ c?: string; p?: string; g?: string }>;
}) {
  const sp = await searchParams;

  const catalog = sanityConfigured
    ? await getCatalog()
    : {
        available: SAMPLE_UNITS.filter((u) => u.status === 'available'),
        recentlySold: SAMPLE_UNITS.filter((u) => u.status !== 'available')
      };

  const everything = [...catalog.available, ...catalog.recentlySold];
  const present = CATEGORIES.filter((cat) =>
    everything.some((u) => u.category === cat.value)
  );
  const band = PRICE_BANDS.find((b) => b.value === sp.p) ?? null;

  const active: Active = {
    c: present.some((p) => p.value === sp.c) ? sp.c! : null,
    p: band ? band.value : null,
    g: sp.g === 'A' || sp.g === 'B' ? sp.g : null
  };

  const filtering = Boolean(active.c || active.p || active.g);
  const available = catalog.available.filter((u) => matches(u, active));
  const sold = catalog.recentlySold.filter((u) => matches(u, active));

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
          <Filters active={active} categories={present} units={everything} />
        )}

        <div className="catalog-main">
          <div className="count-row">
            <strong>
              {available.length}{' '}
              {available.length === 1 ? 'unit in stock' : 'units in stock'}
            </strong>
            {available.length > 0 && (
              <span>Every unit is one piece. Once it goes, it is gone.</span>
            )}
          </div>

          {available.length > 0 ? (
            <div className="grid">
              {available.map((unit) => (
                <UnitCard key={unit.productCode} unit={unit} />
              ))}
            </div>
          ) : (
            <SoldOut filtering={filtering} hasSold={sold.length > 0} />
          )}

          {sold.length > 0 && (
            <section className="sold-section">
              <div className="sold-head">
                <h2>Recently sold</h2>
                <span>
                  These have gone. New stock lands at the godown most weeks.
                </span>
              </div>
              <div className="grid">
                {sold.map((unit) => (
                  <UnitCard key={unit.productCode} unit={unit} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function SoldOut({ filtering, hasSold }: { filtering: boolean; hasSold: boolean }) {
  if (filtering) {
    return (
      <div className="empty">
        <h2>Nothing in stock matching that</h2>
        <p>
          Try clearing a filter. {hasSold && 'What sold recently is below.'} New stock
          lands at the godown most weeks.
        </p>
        <p>
          <Link href="/">Show everything</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="empty">
      <h2>Everything has sold</h2>
      <p>
        We buy and refurbish a fresh batch most weeks, so this does not stay empty for
        long. Tell us what you are looking for and we will message you the day something
        matching lands, before it goes on the site.
      </p>
      {WHATSAPP && (
        <p>
          <a
            className="btn btn-inline"
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
              'Hi Nestloop, nothing is in stock on the shop right now. Can you tell me when something turns up? I am looking for:'
            )}`}
            target="_blank"
            rel="noopener"
          >
            Tell us what you need
          </a>
        </p>
      )}
    </div>
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
