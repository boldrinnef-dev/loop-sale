import type { Unit } from './units';

/**
 * Stand-in stock, used only while NEXT_PUBLIC_SANITY_PROJECT_ID is unset, so a
 * fresh deploy shows the real layout instead of an empty grid. The moment the
 * Sanity project is connected this is never read again.
 */
const base = {
  condition: 'refurbished' as const,
  category: null,
  model: null,
  warrantyEligible: true,
  advanceAmount: 500,
  soldAt: null,
  images: null,
  defectImage: null
};

export const SAMPLE_UNITS: Unit[] = [
  {
    ...base,
    slug: 'sample-nlkocfd124',
    productCode: 'NLKOCFD124',
    title: 'Whirlpool 265 L Double Door Refrigerator',
    category: 'refrigerator',
    brand: 'Whirlpool',
    model: 'NEO IF278 ELT',
    capacity: '265 litres',
    approxAgeYears: 3,
    grade: 'A',
    conditionNote:
      'Cosmetically clean, no dents on either door. Cools correctly, both gaskets seal, all shelves and trays present. Tested overnight at the godown.',
    included: ['shelves', 'trays'],
    salePrice: 9500,
    strikePrice: 12000,
    status: 'available'
  },
  {
    ...base,
    slug: 'sample-nlkocwm032',
    productCode: 'NLKOCWM032',
    title: 'LG 6.5 kg Semi Automatic Washing Machine',
    category: 'washing-machine',
    brand: 'LG',
    model: 'P7555R3FA',
    capacity: '6.5 kg',
    approxAgeYears: 4,
    grade: 'B',
    conditionNote:
      'Scuffing along the top edge of the lid and a small chip on the right corner. Full cycle run with water, no leak after ten minutes standing, spin balanced. Both pipes included.',
    included: ['inlet-pipe', 'drain-pipe'],
    salePrice: 6800,
    strikePrice: 8500,
    status: 'available'
  },
  {
    ...base,
    slug: 'sample-nlkocfd118',
    productCode: 'NLKOCFD118',
    title: 'LG 190 L Single Door Refrigerator',
    category: 'refrigerator',
    brand: 'LG',
    model: 'GL-B199ORLC',
    capacity: '190 litres',
    approxAgeYears: 4,
    grade: 'B',
    conditionNote:
      'Dent on the lower right of the door, about 4 cm, and light scuffing along the top edge. Cools correctly, gasket seals, shelves and trays all present.',
    included: ['shelves', 'trays'],
    salePrice: 6300,
    strikePrice: 7900,
    status: 'available'
  },
  {
    ...base,
    slug: 'sample-nlkocwr009',
    productCode: 'NLKOCWR009',
    title: '3 Door Steel Wardrobe, grey',
    category: 'wardrobe',
    brand: 'Godrej',
    capacity: '3 door',
    approxAgeYears: 5,
    grade: 'B',
    conditionNote:
      'Surface rust on the base rail, not structural. All three doors align and lock, keys present, mirror intact, no board swelling.',
    included: ['keys'],
    salePrice: 5400,
    strikePrice: 6800,
    status: 'available'
  },
  {
    ...base,
    slug: 'sample-nlkocst003',
    productCode: 'NLKOCST003',
    title: 'Study Table with Drawer, walnut finish',
    category: 'study-table',
    brand: 'Nilkamal',
    capacity: '4 foot',
    approxAgeYears: 2,
    grade: 'A',
    conditionNote:
      'Clean top with no water rings, drawer runs smoothly, all fittings tight. Minor mark on the rear panel that faces the wall.',
    included: null,
    salePrice: 2400,
    strikePrice: 3200,
    status: 'available'
  },
  {
    ...base,
    slug: 'sample-nlkocwm041',
    productCode: 'NLKOCWM041',
    title: 'Samsung 7 kg Fully Automatic Top Load',
    category: 'washing-machine',
    brand: 'Samsung',
    model: 'WA70H4000HA',
    capacity: '7 kg',
    approxAgeYears: 3,
    grade: 'A',
    conditionNote:
      'Clean body, all programmes run, no bearing noise. Sold on 21 October, shown here until it drops off the catalog.',
    included: ['inlet-pipe', 'drain-pipe'],
    salePrice: 9200,
    strikePrice: 11500,
    status: 'sold'
  }
];
