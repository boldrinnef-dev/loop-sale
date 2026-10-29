import { FREE_RADIUS_KM, type DeliveryQuote } from './delivery';

/**
 * When we can realistically get there.
 *
 * Inside the free radius that is 48 hours. Further out it is a day more,
 * because the van carries four to six jobs a day across rentals, resale,
 * pickups and service, and a long run eats a bigger share of one day.
 *
 * These are the dates a customer may ASK for. The real slot is confirmed on
 * WhatsApp once we see the day's load, which is why the form says so rather
 * than promising a slot the van cannot keep.
 */

const LEAD_NEAR_DAYS = 2;
const LEAD_FAR_DAYS = 3;

/** How many days of choice to offer from the earliest. */
const WINDOW_DAYS = 7;

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export type DayOption = {
  /** yyyy-mm-dd, the value we store and send. */
  iso: string;
  day: string;
  date: string;
  /** "Fri 30 Oct", for the WhatsApp message. */
  long: string;
  /** True for the soonest date we offer. */
  soonest: boolean;
};

export function leadDays(q: DeliveryQuote): number {
  if (q.state === 'quoted') {
    return q.km <= FREE_RADIUS_KM ? LEAD_NEAR_DAYS : LEAD_FAR_DAYS;
  }
  // Unmeasured pincode: assume the longer run rather than promise the shorter.
  return LEAD_FAR_DAYS;
}

function toOption(d: Date, soonest: boolean): DayOption {
  const day = DAY_NAMES[d.getDay()];
  const date = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
  return {
    iso: isoOf(d),
    day,
    date,
    long: `${day} ${date}`,
    soonest
  };
}

export function isoOf(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** The soonest date we are willing to offer, given the distance. */
export function earliestDate(q: DeliveryQuote): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + leadDays(q));
  return d;
}

/**
 * A week of choices from the earliest. Seven days because the van runs seven
 * days a week, so there is no weekend to skip.
 */
export function dayOptions(q: DeliveryQuote): DayOption[] {
  const start = earliestDate(q);
  return Array.from({ length: WINDOW_DAYS }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toOption(d, i === 0);
  });
}

/** For the native picker's min, and its max a month out. */
export function pickerRange(q: DeliveryQuote): { min: string; max: string } {
  const min = earliestDate(q);
  const max = new Date(min);
  max.setDate(min.getDate() + 30);
  return { min: isoOf(min), max: isoOf(max) };
}

/** Turn a hand-picked yyyy-mm-dd back into something readable. */
export function describeIso(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d, 12);
  return `${DAY_NAMES[date.getDay()]} ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}
