// Minimal Sanity client. No SDK on purpose: the query API is a GET request and
// the image CDN is a URL pattern, so this keeps the dependency list at Next and
// React only. Swap in next-sanity later if live preview is wanted.

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = '2024-10-01';

/** False until NEXT_PUBLIC_SANITY_PROJECT_ID is set. Pages show a setup card instead of crashing. */
export const sanityConfigured = Boolean(projectId);

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T | null> {
  if (!projectId) return null;

  const url = new URL(
    `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`
  );
  url.searchParams.set('query', query);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(`$${key}`, JSON.stringify(value));
  }

  const res = await fetch(url.toString(), {
    // Catalog changes when someone publishes a unit, so a short window is fine.
    next: { revalidate: 60 }
  });

  if (!res.ok) {
    throw new Error(`Sanity query failed with ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as { result: T };
  return json.result;
}

/**
 * Build a CDN URL from an asset _ref such as
 * image-abc123...-1600x1200-jpg
 *
 * `fit` matters more than it looks. Godown photos are shot portrait on a
 * phone, roughly 3:4, so cropping them into a square or a landscape box cuts
 * the top and bottom off a tall fridge and reads as zoomed in.
 *
 *   contain  the whole unit, padded to the box with the page background.
 *            Right for grid cards, where every tile must be the same shape.
 *   natural  no box at all, the image keeps its own proportions.
 *            Right for the main gallery photo.
 *   crop     fills the box, cuts the edges. Only for small thumbnails, where
 *            the shape matters more than the detail.
 */
type Fit = 'contain' | 'natural' | 'crop';

/** Matches --fill in globals.css, so padding is invisible against the page. */
const PAD = 'e7e5de';

export function imageUrl(
  ref: string | null | undefined,
  width: number,
  height?: number,
  fit: Fit = 'crop'
): string | null {
  if (!ref || !projectId) return null;

  const parts = ref.split('-');
  if (parts.length < 4 || parts[0] !== 'image') return null;

  const [, assetId, dimensions, ext] = parts;
  const query = new URLSearchParams({ w: String(width), auto: 'format' });

  if (fit === 'natural') {
    // Longest edge only. The image arrives at its own aspect ratio.
    query.set('fit', 'max');
  } else if (fit === 'contain') {
    query.set('fit', 'fill');
    query.set('bg', PAD);
    if (height) query.set('h', String(height));
  } else {
    query.set('fit', 'crop');
    if (height) query.set('h', String(height));
  }

  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}-${dimensions}.${ext}?${query.toString()}`;
}

/**
 * Same idea for an uploaded file, whose _ref looks like
 * file-abc123...-mp4
 *
 * Files carry no dimensions in the ref and get no transforms: the browser
 * receives the mp4 as it was uploaded. That is why the Studio asks for a short
 * clip under 20 MB, and why the player on the page never preloads it.
 */
export function fileUrl(ref: string | null | undefined): string | null {
  if (!ref || !projectId) return null;

  const parts = ref.split('-');
  if (parts.length < 3 || parts[0] !== 'file') return null;

  const [, assetId, ext] = parts;
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${assetId}.${ext}`;
}
