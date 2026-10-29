'use client';

import { useEffect, useRef, useState } from 'react';
import {
  FREE_RADIUS_KM,
  MAX_RADIUS_KM,
  PER_KM,
  quote,
  quoteLabel,
  quoteSentence,
  rupees,
  type DeliveryQuote
} from '@/lib/delivery';

import { announcePincode, STORAGE_KEY } from '@/lib/delivery-client';

export default function DeliveryCheckControl() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [result, setResult] = useState<DeliveryQuote>({ state: 'empty' });
  const box = useRef<HTMLDivElement>(null);

  /**
   * The panel used to close only by hitting the pill again, which is not where
   * anyone's hand goes. Three ways out now: tap anywhere else, press Escape,
   * or use the close button.
   */
  useEffect(() => {
    if (!open) return;

    function onPointer(e: MouseEvent | TouchEvent) {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setValue(saved);
        setResult(quote(saved));
      }
    } catch {
      /* private window or blocked storage: the default label is fine */
    }
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = quote(value);
    setResult(next);
    if (next.state !== 'empty' && next.state !== 'invalid') {
      try {
        localStorage.setItem(STORAGE_KEY, next.pincode);
      } catch {
        /* ignore */
      }
      announcePincode();
    }
    // A pincode we can price is answered by the pill itself, so there is
    // nothing left to read. Anything else keeps the panel open, because the
    // message is the answer.
    if (next.state === 'quoted') setOpen(false);
  }

  const settled = result.state === 'quoted';

  return (
    <div className="delivery" ref={box}>
      <button
        type="button"
        className="pill pill-button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <svg width="13" height="15" viewBox="0 0 14 16" aria-hidden="true">
          <path
            d="M7 1.2c2.3 0 4.1 1.8 4.1 4.1 0 3-4.1 9.2-4.1 9.2S2.9 8.3 2.9 5.3C2.9 3 4.7 1.2 7 1.2z"
            fill="none"
            stroke="#0F3B5C"
            strokeWidth="1.4"
          />
          <circle cx="7" cy="5.3" r="1.5" fill="#0F3B5C" />
        </svg>
        <span>{settled ? quoteLabel(result) : 'Check delivery'}</span>
        <span className="pill-action">{settled ? 'Change' : 'Pincode'}</span>
      </button>

      {open && (
        <div className="delivery-panel">
          <button
            type="button"
            className="panel-close"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden="true">
              <path
                d="M2 2l10 10M12 2L2 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <form onSubmit={submit} className="delivery-form">
            <label htmlFor="pin-check">Your pincode</label>
            <div className="delivery-row">
              <input
                id="pin-check"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
                placeholder="682019"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
              <button type="submit" className="btn btn-small">
                Check
              </button>
            </div>
          </form>

          {result.state !== 'empty' && (
            <p className={`delivery-msg ${toneOf(result)}`}>{quoteSentence(result)}</p>
          )}

          <p className="delivery-rates">
            Free within {FREE_RADIUS_KM} km of the Eroor godown. {rupees(PER_KM)} a km
            after that, up to {MAX_RADIUS_KM} km.
          </p>
        </div>
      )}
    </div>
  );
}

function toneOf(q: DeliveryQuote): string {
  if (q.state === 'quoted') return q.fee === 0 ? 'good' : 'warn';
  if (q.state === 'too-far' || q.state === 'invalid') return 'bad';
  return '';
}
