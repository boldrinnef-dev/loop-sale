import Link from 'next/link';
import type { Unit } from '@/lib/units';

export type PriceBand = {
  value: string;
  label: string;
  min: number;
  max: number;
};

export const PRICE_BANDS: PriceBand[] = [
  { value: 'u4', label: 'Under Rs 4,000', min: 0, max: 3999 },
  { value: '4to7', label: 'Rs 4,000 to 7,000', min: 4000, max: 7000 },
  { value: '7to10', label: 'Rs 7,000 to 10,000', min: 7001, max: 10000 },
  { value: 'o10', label: 'Above Rs 10,000', min: 10001, max: Infinity }
];

export const GRADES = [
  { value: 'A', label: 'Grade A, cosmetically clean' },
  { value: 'B', label: 'Grade B, light visible wear' }
];

export type Active = { c: string | null; p: string | null; g: string | null };

/** Builds a href that toggles one facet and keeps the others. */
export function hrefFor(active: Active, key: keyof Active, value: string | null): string {
  const next: Active = { ...active, [key]: active[key] === value ? null : value };
  const params = new URLSearchParams();
  if (next.c) params.set('c', next.c);
  if (next.p) params.set('p', next.p);
  if (next.g) params.set('g', next.g);
  const q = params.toString();
  return q ? `/?${q}` : '/';
}

export default function Filters({
  active,
  categories,
  units
}: {
  active: Active;
  categories: { value: string; label: string }[];
  units: Unit[];
}) {
  const grades = GRADES.filter((g) => units.some((u) => u.grade === g.value));
  const bands = PRICE_BANDS.filter((b) =>
    units.some((u) => u.salePrice >= b.min && u.salePrice <= b.max)
  );

  return (
    <aside className="sidebar" aria-label="Filters">
      <Group title="Category">
        {categories.map((cat) => (
          <Row
            key={cat.value}
            href={hrefFor(active, 'c', cat.value)}
            label={cat.label}
            on={active.c === cat.value}
          />
        ))}
      </Group>

      {bands.length > 1 && (
        <Group title="Price">
          {bands.map((band) => (
            <Row
              key={band.value}
              href={hrefFor(active, 'p', band.value)}
              label={band.label}
              on={active.p === band.value}
            />
          ))}
        </Group>
      )}

      {grades.length > 1 && (
        <Group title="Condition">
          {grades.map((grade) => (
            <Row
              key={grade.value}
              href={hrefFor(active, 'g', grade.value)}
              label={grade.label}
              on={active.g === grade.value}
            />
          ))}
        </Group>
      )}

      {(active.c || active.p || active.g) && (
        <Link href="/" className="clear-filters">
          Clear all filters
        </Link>
      )}
    </aside>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="filter-group">
      <h2 className="filter-title">{title}</h2>
      {children}
    </div>
  );
}

function Row({ href, label, on }: { href: string; label: string; on: boolean }) {
  return (
    <Link href={href} className="filter-row" aria-current={on}>
      <span className="filter-box" aria-hidden="true">
        {on && (
          <svg width="11" height="11" viewBox="0 0 16 16">
            <path
              d="M3.2 8.4l3.1 3.1 6.5-6.9"
              fill="none"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span>{label}</span>
    </Link>
  );
}
