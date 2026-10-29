/**
 * Posting to the orders sheet, and saying plainly what came back.
 *
 * Shared by the booking route and the ping route so that a diagnosis is a
 * diagnosis of the real path, not of a second copy that might differ.
 */

export type SheetResult = { stored: boolean; detail: string };

/**
 * Post to an Apps Script web app, following its redirect by hand.
 *
 * A POST to an Apps Script /exec URL answers 302 pointing at
 * script.googleusercontent.com, and the fetch standard says a 302 turns a POST
 * into a GET and throws the body away. Followed automatically, doGet runs,
 * the script answers {"ok":true,"service":...} and nothing is written.
 *
 * Content-Type is text/plain because Apps Script reads e.postData.contents
 * whatever the type, and text/plain is what Google's own examples use.
 */
export async function postToSheet(
  endpoint: string,
  payload: unknown
): Promise<SheetResult> {
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

      // A redirect to a Google sign in page means the web app was deployed as
      // "Anyone with Google account". Our server has no Google account, so it
      // can never satisfy that, however correct the secret is.
      if (/accounts\.google\.com/.test(next)) {
        return {
          stored: false,
          detail:
            'the script asked us to sign in to Google, so the deployment is not set to "Anyone"'
        };
      }

      url = next;
      continue;
    }

    const text = (await res.text()).slice(0, 400);

    if (!res.ok) return { stored: false, detail: `http ${res.status}: ${text}` };

    if (/<html/i.test(text)) {
      return {
        stored: false,
        detail: `got an HTML page instead of JSON, usually a sign in page: ${text.slice(0, 120)}`
      };
    }
    if (text.includes('"service"')) {
      return { stored: false, detail: `reached doGet, not doPost: ${text}` };
    }
    if (text.includes('"ok":false')) {
      return { stored: false, detail: `the script refused it: ${text}` };
    }

    return { stored: text.includes('"ok":true'), detail: text };
  }

  return { stored: false, detail: 'too many redirects' };
}
