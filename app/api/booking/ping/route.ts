import { postToSheet } from '@/lib/sheet';

/**
 * A diagnosis you can open in a browser.
 *
 * Temporary. It exists because the Vercel logs are not readable from where
 * this was being debugged, and guessing at a silent failure three times in a
 * row is worse than spending ten minutes building something that answers.
 *
 * It writes one row marked TEST so the whole path is exercised, not a
 * simulation of it. Delete this route once the sheet is confirmed working.
 *
 * It reveals no secret. Lengths, yes, because a secret that is two characters
 * longer than expected is a pasted quote mark or a trailing space, and that is
 * the single most common cause of a rejected request.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.BOOKING_SHEET_URL ?? '';
  const secret = process.env.BOOKING_SHEET_SECRET ?? '';

  const checks = {
    urlIsSet: Boolean(url),
    urlHost: url ? safeHost(url) : null,
    urlEndsWithExec: url.trim().endsWith('/exec'),
    urlHasWhitespace: url !== url.trim(),
    urlHasQuotes: /^['"]|['"]$/.test(url),
    secretIsSet: Boolean(secret),
    secretLength: secret.length,
    secretHasWhitespace: secret !== secret.trim(),
    secretHasQuotes: /^['"]|['"]$/.test(secret)
  };

  if (!url || !secret) {
    return Response.json({
      verdict: 'the environment variables are missing from this build',
      checks
    });
  }

  const answer = await postToSheet(url.trim(), {
    secret: secret.trim(),
    receivedAt: new Date().toISOString(),
    orderId: 'TEST-PING',
    unitCode: 'TEST',
    title: 'Connection test, delete this row',
    name: 'Test',
    phone: '',
    address: '',
    pincode: '',
    deliveryDate: '',
    deliveryFee: '',
    warranty: '',
    payChoice: '',
    dueNow: 0,
    total: 0,
    source: 'ping'
  });

  return Response.json({
    verdict: answer.stored
      ? 'the sheet accepted the row, look for TEST-PING'
      : 'the sheet did not accept the row, see sheetSaid',
    sheetSaid: answer.detail,
    checks
  });
}

function safeHost(value: string): string {
  try {
    return new URL(value.trim()).host;
  } catch {
    return 'not a valid URL';
  }
}
