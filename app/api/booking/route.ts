import type { BookingRecord } from '@/lib/order';

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

  const endpoint = process.env.BOOKING_SHEET_URL;
  if (!endpoint) {
    console.warn('[booking] BOOKING_SHEET_URL is not set, nothing was stored');
    return Response.json({ ok: true, stored: false });
  }

  try {
    const answer = await postToSheet(endpoint, {
      ...record,
      secret: process.env.BOOKING_SHEET_SECRET ?? '',
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

/**
 * Post to an Apps Script web app, following its redirect by hand.
 *
 * This is the whole reason the first attempt wrote nothing. A POST to an
 * Apps Script /exec URL answers 302 pointing at script.googleusercontent.com,
 * and the fetch standard says a 302 turns a POST into a GET and throws the
 * body away. So the redirect was followed, doGet ran instead of doPost, the
 * script cheerfully answered {"ok":true,"service":...}, and nothing was ever
 * written to the sheet. A success that stores nothing is the worst kind.
 *
 * Following it manually and posting again keeps the method and the body.
 * Content-Type is text/plain because Apps Script reads e.postData.contents
 * whatever the type, and text/plain is the type Google's own examples use.
 */
async function postToSheet(
  endpoint: string,
  payload: unknown
): Promise<{ stored: boolean; detail: string }> {
  const body = JSON.stringify(payload);
  let url = endpoint;

  for (let hop = 0; hop < 4; hop += 1) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      redirect: 'manual',
      signal: AbortSignal.timeout(8000)
    });

    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get('location');
      if (!next) return { stored: false, detail: `redirect ${res.status}, no location` };
      url = next;
      continue;
    }

    const text = (await res.text()).slice(0, 300);

    if (!res.ok) return { stored: false, detail: `http ${res.status}: ${text}` };

    // doGet's answer carries "service". Seeing it here means the body was
    // dropped somewhere and the row was not written.
    if (text.includes('"service"')) {
      return { stored: false, detail: `reached doGet, not doPost: ${text}` };
    }
    if (text.includes('"ok":false')) {
      return { stored: false, detail: `script refused: ${text}` };
    }

    return { stored: text.includes('"ok":true'), detail: text };
  }

  return { stored: false, detail: 'too many redirects' };
}
