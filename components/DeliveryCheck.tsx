'use client';

import { useEffect, useState } from 'react';
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

const STORAGE_KEY = 'nestloop-pincode';

export default function DeliveryCheckControl() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [result, setResult] = useState<DeliveryQuote>({ state: 'empty' });

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
    }
  }

  const settled = result.state === 'quoted';

  return (
    <div className="delivery">
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
