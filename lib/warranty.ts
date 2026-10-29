/**
 * Extended Limited Warranty, six months, as priced in the Nestloop warranty
 * document. Two tiers, and the difference between them is parts.
 *
 * This is a repair plan, not an exchange plan. Worth being precise about on
 * the site, because "we will replace it" and "we will fix it and you pay for
 * the compressor" are very different promises and the gap between them is
 * where a dispute lives.
 */

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
