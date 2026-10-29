'use client';

import { useRef, useState } from 'react';
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

/** A swipe has to beat this many pixels to count, so a tap never moves the photo. */
const SWIPE_PX = 40;

/**
 * Clickable gallery. Six photos per unit is the whole trust argument for buying
 * a used appliance from a stranger, so they have to be openable, not decorative.
 *
 * Three ways through them: arrows, thumbnails, and a swipe on touch. Arrows wrap
 * around rather than disabling at the ends, because a dead button at photo six
 * reads as broken.
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
  const touchX = useRef<number | null>(null);

  const count = images.length;
  const main = imageUrl(images[active]?.ref, 1200, undefined, 'natural');

  const go = (delta: number) => {
    if (count < 2) return;
    setActive((i) => (i + delta + count) % count);
  };

  return (
    <div className="gallery">
      <div
        className="gallery-main"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {main ? (
          <img src={main} alt={images[active]?.alt || title} draggable={false} />
        ) : (
          <span className="mono photo-note">PHOTO PENDING</span>
        )}

        {sold && <span className="badge sold">{sold}</span>}

        {count > 1 && (
          <>
            <button
              type="button"
              className="gallery-arrow prev"
              aria-label="Previous photo"
              onClick={() => go(-1)}
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              className="gallery-arrow next"
              aria-label="Next photo"
              onClick={() => go(1)}
            >
              <Chevron dir="right" />
            </button>
            <span className="gallery-count">
              {active + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
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
                {src ? <img src={src} alt="" draggable={false} /> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M10 3L5 8l5 5' : 'M6 3l5 5-5 5'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
