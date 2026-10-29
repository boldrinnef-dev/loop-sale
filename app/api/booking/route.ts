import type { BookingRecord } from '@/lib/order';
import { postToSheet } from '@/lib/sheet';

/**
 * Catches a booking before it goes to WhatsApp.
 *
 * The point of this route is the customer who fills in the whole form, gets
 * handed to WhatsApp, and never presses send. Without this they are invisible:
 * their number only exists inside a message they did not send. With it, they
 * are a row someone can call back.
 *
 * Two rules it never breaks:
 *
 *   It never fails the customer. If the sheet is unreachable, misconfigured or
 *   slow, this still answers ok and the booking still reaches WhatsApp. A
 *   logging failure must not cost a sale.
 *
 *   It never logs the customer. Names, numbers and home addresses stay out of
 *   the Vercel logs, which are a good deal easier to read than the sheet.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Long enough for anything real, short enough to stop someone pasting a book. */
const MAX_FIELD = 400;

function clean(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, MAX_FIELD);
}

function cleanNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function POST(request: Request) {
  let body: Partial<BookingRecord>;
  try {
    body = (await request.json()) as Partial<BookingRecord>;
  } catch {
    return Response.json({ ok: false, stored: false }, { status: 400 });
  }

  const record: BookingRecord = {
    orderId: clean(body.orderId),
    unitCode: clean(body.unitCode),
    title: clean(body.title),
    name: clean(body.name),
    phone: clean(body.phone),
    address: clean(body.address),
    pincode: clean(body.pincode),
    deliveryDate: clean(body.deliveryDate),
    deliveryFee: clean(body.deliveryFee),
    warranty: clean(body.warranty),
    payChoice: clean(body.payChoice),
    dueNow: cleanNumber(body.dueNow),
    total: cleanNumber(body.total)
  };

  // A row with no unit and no name is a probe, not a booking.
  if (!record.unitCode && !record.name) {
    return Response.json({ ok: false, stored: false }, { status: 400 });
  }

  const endpoint = process.env.BOOKING_SHEET_URL?.trim();
  if (!endpoint) {
    console.warn('[booking] BOOKING_SHEET_URL is not set, nothing was stored');
    return Response.json({ ok: true, stored: false });
  }

  try {
    const answer = await postToSheet(endpoint, {
      ...record,
      secret: (process.env.BOOKING_SHEET_SECRET ?? '').trim(),
      receivedAt: new Date().toISOString(),
      source: 'shop'
    });

    // The reply is the script's own JSON and holds no customer data, so it is
    // safe to log and it is the only way to tell a rejected secret from a
    // request that never reached doPost at all.
    console.log('[booking] sheet said:', answer.detail);

    return Response.json({ ok: true, stored: answer.stored, sheet: answer.detail });
  } catch (err) {
    console.error('[booking] could not reach the sheet:', (err as Error).name);
    return Response.json({ ok: true, stored: false, sheet: 'unreachable' });
  }
}
