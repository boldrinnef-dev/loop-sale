/**
 * Warranty has two layers.
 *
 * Every unit carries one month, included, at no cost. That is the stronger
 * selling line of the two and belongs wherever someone is deciding, not
 * buried in terms.
 *
 * On top of that sits the Extended Limited Warranty, six months, in two paid
 * tiers. The difference between them is parts.
 *
 * The extension is a repair plan, not an exchange plan. Worth being precise
 * about, because "we will replace it" and "we will fix it and you pay for the
 * compressor" are very different promises, and the gap between them is where
 * a dispute lives.
 */

/** Free, on every refurbished unit. */
export const INCLUDED_WARRANTY_MONTHS = 1;

export type WarrantyPlan = {
  id: 'silver' | 'gold';
  name: string;
  price: number;
  /** One line, for the card. */
  summary: string;
  /** What the customer is actually buying. */
  covers: string;
};

export const WARRANTY_PLANS: WarrantyPlan[] = [
  {
    id: 'silver',
    name: 'Silver',
    price: 499,
    summary: 'Labour free, you pay for parts',
    covers:
      'Our technician visits and works on the unit at no charge for six months. If a part has to be replaced, you pay for the part itself.'
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 899,
    summary: 'Labour and parts both covered',
    covers:
      'Everything in Silver, plus any replacement parts at no extra cost. Nothing to pay for six months if something goes wrong.'
  }
];

export type WarrantyChoice = 'none' | 'silver' | 'gold';

export function planFor(choice: WarrantyChoice): WarrantyPlan | null {
  return WARRANTY_PLANS.find((p) => p.id === choice) ?? null;
}

export function warrantyPrice(choice: WarrantyChoice): number {
  return planFor(choice)?.price ?? 0;
}
