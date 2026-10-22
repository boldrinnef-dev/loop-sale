import { sanityFetch } from './sanity';

export type UnitStatus = 'draft' | 'available' | 'reserved' | 'sold' | 'withdrawn';

export type SanityImage = {
  ref: string | null;
  alt: string | null;
  shotType: string | null;
};

export type Unit = {
  slug: string;
  productCode: string;
  title: string;
  category: string | null;
  brand: string | null;
  model: string | null;
  capacity: string | null;
  approxAgeYears: number | null;
  grade: 'A' | 'B' | null;
  conditionNote: string | null;
  included: string[] | null;
  salePrice: number;
  strikePrice: number | null;
  advanceAmount: number | null;
  warrantyEligible: boolean | null;
  status: UnitStatus;
  soldAt: string | null;
  images: SanityImage[] | null;
  defectImage: string | null;
};

const FIELDS = `
  "slug": slug.current,
  productCode,
  title,
  category,
  brand,
  model,
  capacity,
  approxAgeYears,
  grade,
  conditionNote,
  included,
  salePrice,
  strikePrice,
  advanceAmount,
  warrantyEligible,
  status,
  soldAt,
  "images": images[]{ "ref": asset._ref, alt, shotType },
  "defectImage": defectImage.asset._ref
`;

const SOLD_VISIBLE_DAYS = 3;

/**
 * Everything a shopper may see: live stock, plus units sold or reserved in the
 * last few days so the catalog visibly moves. Draft and withdrawn never leave
 * the Studio.
 */
export async function getCatalog(): Promise<Unit[]> {
  const units = await sanityFetch<Unit[]>(
    `*[_type == "resaleUnit" && status in ["available", "reserved", "sold"]]
      | order(listedAt desc) { ${FIELDS} }`
  );
  if (!units) return [];

  const cutoff = Date.now() - SOLD_VISIBLE_DAYS * 24 * 60 * 60 * 1000;

  return units
    .filter((unit) => {
      if (unit.status === 'available') return true;
      if (!unit.soldAt) return true;
      return new Date(unit.soldAt).getTime() > cutoff;
    })
    .sort((a, b) => Number(a.status !== 'available') - Number(b.status !== 'available'));
}

export async function getUnit(slug: string): Promise<Unit | null> {
  const units = await sanityFetch<Unit[]>(
    `*[_type == "resaleUnit" && slug.current == $slug][0...1] { ${FIELDS} }`,
    { slug }
  );
  return units?.[0] ?? null;
}

export const CATEGORIES: { value: string; label: string }[] = [
  { value: 'refrigerator', label: 'Refrigerators' },
  { value: 'washing-machine', label: 'Washing machines' },
  { value: 'wardrobe', label: 'Wardrobes' },
  { value: 'cot', label: 'Cots' },
  { value: 'mattress', label: 'Mattresses' },
  { value: 'sofa', label: 'Sofas' },
  { value: 'study-table', label: 'Study tables' },
  { value: 'dining-set', label: 'Dining sets' },
  { value: 'air-conditioner', label: 'Air conditioners' },
  { value: 'air-cooler', label: 'Air coolers' },
  { value: 'water-purifier', label: 'Water purifiers' },
  { value: 'gas-stove', label: 'Gas stoves' },
  { value: 'mixer-grinder', label: 'Mixer grinders' },
  { value: 'air-fryer', label: 'Air fryers' },
  { value: 'other', label: 'Other' }
];

export function categoryLabel(value: string | null): string {
  if (!value) return 'Other';
  return CATEGORIES.find((c) => c.value === value)?.label ?? 'Other';
}

export function rupees(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '';
  return 'Rs ' + amount.toLocaleString('en-IN');
}

export function discountPercent(unit: Unit): number | null {
  if (!unit.strikePrice || unit.strikePrice <= unit.salePrice) return null;
  return Math.round(((unit.strikePrice - unit.salePrice) / unit.strikePrice) * 100);
}

export function whatsappLink(unit: Unit): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
  const message = [
    `Hi Nestloop, I want to book this unit from the shop.`,
    ``,
    `${unit.title}`,
    `Code: ${unit.productCode}`,
    `Price: ${rupees(unit.salePrice)}`
  ].join('\n');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
