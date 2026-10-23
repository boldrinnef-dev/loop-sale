'use client';

import { useState } from 'react';
import { imageUrl } from '@/lib/sanity';
import type { SanityImage } from '@/lib/units';

const SHOT_LABELS: Record<string, string> = {
  front: 'Front',
  controls: 'Controls',
  interior: 'Inside',
  rear: 'Rear',
  'model-plate': 'Model plate',
  other: 'Other'
};

/**
 * Clickable gallery. Six photos per unit is the whole trust argument for buying
 * a used appliance from a stranger, so they have to be openable, not decorative.
 */
export default function Gallery({
  images,
  title,
  sold
}: {
  images: SanityImage[];
  title: string;
  sold: string | null;
}) {
  const [active, setActive] = useState(0);
  const main = imageUrl(images[active]?.ref, 1000, 750);

  return (
    <div className="gallery">
      <div className="gallery-main">
        {main ? (
          <img src={main} alt={images[active]?.alt || title} />
        ) : (
          <span className="mono photo-note">PHOTO PENDING</span>
        )}
        {sold && <span className="badge sold">{sold}</span>}
        {images.length > 1 && (
          <span className="gallery-count">
            {active + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="thumbs">
          {images.map((shot, i) => {
            const src = imageUrl(shot.ref, 200, 200);
            const label =
              shot.shotType && SHOT_LABELS[shot.shotType]
                ? SHOT_LABELS[shot.shotType]
                : `Photo ${i + 1}`;

            return (
              <button
                type="button"
                key={`${shot.ref}-${i}`}
                className="thumb"
                aria-label={`Show ${label}`}
                aria-current={i === active}
                onClick={() => setActive(i)}
              >
                {src ? <img src={src} alt="" /> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
