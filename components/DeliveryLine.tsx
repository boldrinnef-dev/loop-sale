'use client';

import { useEffect, useState } from 'react';
import { PINCODE_EVENT, STORAGE_KEY } from '@/lib/delivery-client';
import { MAX_RADIUS_KM, quote, rupees, type DeliveryQuote } from '@/lib/delivery';

/**
 * Shows what delivery costs to the pincode this visitor already gave, right
 * under the price. Finding out about a Rs 250 fee on the last screen is the
 * pattern people resent, so it belongs here.
 */
export default function DeliveryLine({ salePrice }: { salePrice: number }) {
  const [q, setQ] = useState<DeliveryQuote>({ state: 'empty' });

  useEffect(() => {
    const read = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        setQ(saved ? quote(saved) : { state: 'empty' });
      } catch {
        setQ({ state: 'empty' });
      }
    };
    read();
    // Fires when the header check changes, so this updates without a reload.
    window.addEventListener(PINCODE_EVENT, read);
    return () => window.removeEventListener(PINCODE_EVENT, read);
  }, []);

  if (q.state === 'empty' || q.state === 'invalid') {
    return (
      <p className="delivery-line">
        Delivery is free within 15 km of our Eroor godown, then Rs 25 a km. Check your
        pincode at the top to see the exact fee.
      </p>
    );
  }

  if (q.state === 'unknown') {
    return (
      <p className="delivery-line">
        We have not measured {q.pincode} yet. Book and we will confirm the delivery fee
        on WhatsApp before anything is charged.
      </p>
    );
  }

  if (q.state === 'too-far') {
    return (
      <p className="delivery-line bad">
        {q.area} is about {q.km} km out and we deliver up to {MAX_RADIUS_KM} km. You can
        still collect this unit from the godown in Eroor.
      </p>
    );
  }

  if (q.fee === 0) {
    return (
      <p className="delivery-line good">
        <Tick /> Free delivery to {q.area}, about {q.km} km from the godown.
      </p>
    );
  }

  return (
    <p className="delivery-line warn">
      Plus {rupees(q.fee)} delivery to {q.area}, {q.km} km out.{' '}
      <span className="delivery-line-total">
        {rupees(salePrice + q.fee)} all in.
      </span>
    </p>
  );
}

function Tick() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3.2 8.4l3.1 3.1 6.5-6.9"
        fill="none"
        stroke="#15653F"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
