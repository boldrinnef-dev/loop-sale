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
 */
export function imageUrl(
  ref: string | null | undefined,
  width: number,
  height?: number
): string | null {
  if (!ref || !projectId) return null;

  const parts = ref.split('-');
  if (parts.length < 4 || parts[0] !== 'image') return null;

  const [, assetId, dimensions, ext] = parts;
  const query = new URLSearchParams({
    w: String(width),
    auto: 'format',
    fit: 'crop'
  });
  if (height) query.set('h', String(height));

  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}-${dimensions}.${ext}?${query.toString()}`;
}
