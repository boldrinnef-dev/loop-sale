/**
 * Paying in full online earns a discount.
 *
 * It is worth it because the driver stops carrying cash, the money arrives
 * before the van leaves, and nobody can change their mind at the door after a
 * delivery slot has been spent on them.
 *
 * It is a percentage rather than a flat figure because a flat Rs 200 is 8% of
 * a Rs 2,400 study table and under 2% of a Rs 12,000 fridge: too generous at
 * one end and invisible at the other. At the typical Rs 6,000 to 8,000 unit
 * this lands on Rs 200 anyway.
 *
 * The discount is not free. On a Rs 7,000 sale it costs the Rs 200 itself plus
 * roughly Rs 120 of extra gateway fee, because the balance would otherwise
 * have been collected directly on delivery. Against a margin of Rs 2,000 to
 * 2,500 that is real, so PREPAY_RATE is the number to argue about.
 */

const PREPAY_RATE = 0.03;
const PREPAY_MIN = 100;
const PREPAY_MAX = 500;

/** Rounded to the nearest 50, because an odd figure looks calculated at you. */
export function prepayDiscount(amount: number): number {
  const raw = amount * PREPAY_RATE;
  const rounded = Math.round(raw / 50) * 50;
  return Math.min(PREPAY_MAX, Math.max(PREPAY_MIN, rounded));
}

export type PayChoice = 'advance' | 'full';
