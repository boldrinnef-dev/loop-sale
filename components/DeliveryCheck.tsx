'use client';

import { useEffect, useState } from 'react';
import { areaLabel, checkPincode, type DeliveryCheck } from '@/lib/delivery';

const STORAGE_KEY = 'nestloop-pincode';

export default function DeliveryCheckControl() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [result, setResult] = useState<DeliveryCheck>({ state: 'empty' });

  // Remembered per browser only. A miss here is cosmetic, never load bearing.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setValue(saved);
        setResult(checkPincode(saved));
      }
    } catch {
      /* private window, blocked storage: fall through to the default label */
    }
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = checkPincode(value);
    setResult(next);
    if (next.state === 'inside' || next.state === 'outside') {
      try {
        localStorage.setItem(STORAGE_KEY, next.pincode);
      } catch {
        /* ignore */
      }
      if (next.state === 'inside') setOpen(false);
    }
  }

  const settled = result.state === 'inside';

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
        <span>{settled ? `Delivering to ${areaLabel(result)}` : 'Check delivery'}</span>
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

          {result.state === 'invalid' && (
            <p className="delivery-msg">That is not a six digit pincode.</p>
          )}

          {result.state === 'inside' && (
            <p className="delivery-msg good">
              We deliver to {areaLabel(result)}. Two to three days from booking.
            </p>
          )}

          {result.state === 'outside' && (
            <div className="delivery-msg bad">
              <p>
                {result.pincode} is outside our 20 km delivery area, so we cannot bring
                a unit there yet.
              </p>
              <p>
                You can still buy and collect from the godown in Vennala, or message us
                and we will tell you when we reach your area.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
