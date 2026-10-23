import Link from 'next/link';
import { imageUrl } from '@/lib/sanity';
import type { Unit } from '@/lib/units';

/**
 * Visual browse. A photo of real stock does more work than a label, and the
 * count tells someone whether it is worth tapping before they tap.
 *
 * Only categories with stock appear. An empty tile is a dead end.
 */
export default function CategoryTiles({
  units,
  categories,
  active
}: {
  units: Unit[];
  categories: { value: string; label: string }[];
  active: string | null;
}) {
  const tiles = categories
    .map((cat) => {
      const inCat = units.filter((u) => u.category === cat.value);
      return {
        ...cat,
        count: inCat.length,
        // Newest first from the query, so this is the freshest photo we have.
        cover: imageUrl(inCat[0]?.images?.[0]?.ref, 360, 360)
      };
    })
    .filter((t) => t.count > 0);

  if (tiles.length < 2) return null;

  return (
    <section className="tiles-wrap">
      <div className="wrap">
        <div className="tiles">
          <Link href="/" className="tile" aria-current={active === null}>
            <span className="tile-photo tile-all">
              <span className="tile-all-count">{units.length}</span>
            </span>
            <span className="tile-label">Everything</span>
          </Link>

          {tiles.map((t) => (
            <Link
              key={t.value}
              href={`/?c=${t.value}`}
              className="tile"
              aria-current={active === t.value}
            >
              <span className="tile-photo">
                {t.cover ? <img src={t.cover} alt="" loading="lazy" /> : null}
              </span>
              <span className="tile-label">
                {t.label}
                <span className="tile-count">{t.count}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
