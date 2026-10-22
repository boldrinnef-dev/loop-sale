import Link from 'next/link';
import SetupNotice from '@/components/SetupNotice';
import UnitCard from '@/components/UnitCard';
import { sanityConfigured } from '@/lib/sanity';
import { CATEGORIES, getCatalog } from '@/lib/units';

export const revalidate = 60;

export default async function CatalogPage({
  searchParams
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;

  if (!sanityConfigured) {
    return (
      <main>
        <Hero />
        <SetupNotice />
      </main>
    );
  }

  const all = await getCatalog();
  const present = CATEGORIES.filter((cat) => all.some((u) => u.category === cat.value));
  const active = c && present.some((p) => p.value === c) ? c : null;
  const units = active ? all.filter((u) => u.category === active) : all;
  const inStock = units.filter((u) => u.status === 'available').length;

  return (
    <main>
      <Hero />

      {present.length > 0 && (
        <nav className="chips" aria-label="Filter by category">
          <Link href="/" className="chip" aria-current={active === null}>
            All
          </Link>
          {present.map((cat) => (
            <Link
              key={cat.value}
              href={`/?c=${cat.value}`}
              className="chip"
              aria-current={active === cat.value}
            >
              {cat.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="wrap">
        <div className="count-row">
          <strong>
            {inStock} {inStock === 1 ? 'unit' : 'units'} in stock
          </strong>
          <span>Sold units stay listed for three days, then drop off</span>
        </div>

        {units.length === 0 ? (
          <div className="empty">
            <h2>Nothing here right now</h2>
            <p>
              New stock lands at the godown most weeks. Message us on WhatsApp and we
              will tell you when something matching turns up.
            </p>
          </div>
        ) : (
          <div className="grid">
            {units.map((unit) => (
              <UnitCard key={unit.productCode} unit={unit} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
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
