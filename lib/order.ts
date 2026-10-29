/**
 * A booking reference the customer and the team can both say out loud.
 *
 * Generated in the browser rather than on the server, because the WhatsApp
 * message has to carry it and that message is built in the same instant the
 * button is pressed. Waiting on a round trip first would hand the popup
 * blocker a reason to kill the WhatsApp window.
 *
 * Collisions do not matter the way they would in a bank. Two orders a day
 * against a million combinations per date, and the row is checked by a human
 * against a unit code anyway.
 */

/** No I, O, 0 or 1. Someone will read this down a phone line. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function newOrderId(now: Date = new Date()): string {
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(2);

  let tail = '';
  for (let i = 0; i < 4; i += 1) {
    tail += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }

  return `NL-${dd}${mm}${yy}-${tail}`;
}

/** Everything one booking row holds. Keep in step with the Apps Script. */
export type BookingRecord = {
  orderId: string;
  unitCode: string;
  title: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  deliveryDate: string;
  deliveryFee: string;
  warranty: string;
  payChoice: string;
  dueNow: number;
  total: number;
};
