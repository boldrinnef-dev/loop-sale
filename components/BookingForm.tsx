'use client';

import { useEffect, useState } from 'react';
import { areaLabel, checkPincode } from '@/lib/delivery';

const STORAGE_KEY = 'nestloop-pincode';
const WARRANTY_PRICE = 499;

type Props = {
  productCode: string;
  title: string;
  salePrice: number;
  advance: number;
  warrantyEligible: boolean;
  whatsappNumber: string;
};

/**
 * The booking form from the design. Until Razorpay keys exist the submit hands
 * everything to WhatsApp rather than taking money, because a reservation with
 * no payment behind it would let the same unit be promised twice.
 */
export default function BookingForm({
  productCode,
  title,
  salePrice,
  advance,
  warrantyEligible,
  whatsappNumber
}: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [warranty, setWarranty] = useState(false);
  const [slot, setSlot] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPincode(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const area = checkPincode(pincode);
  const slots = nextTwoDays();
  const total = salePrice + (warranty ? WARRANTY_PRICE : 0);
  const balance = total - advance;

  const ready =
    name.trim().length > 1 &&
    phone.replace(/\D/g, '').length >= 10 &&
    address.trim().length > 5 &&
    area.state === 'inside';

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!ready) return;

    const lines = [
      'Hi Nestloop, I want to book this unit from the shop.',
      '',
      title,
      `Code: ${productCode}`,
      `Price: Rs ${total.toLocaleString('en-IN')}${warranty ? ' (incl. Rs 499 warranty)' : ''}`,
      `Advance: Rs ${advance.toLocaleString('en-IN')}`,
      `Balance on delivery: Rs ${balance.toLocaleString('en-IN')}`,
      '',
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Address: ${address.trim()}`,
      `Pincode: ${pincode}`,
      `Preferred delivery: ${slots[slot].long}`
    ];

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`,
      '_blank',
      'noopener'
    );
  }

  return (
    <form className="booking" onSubmit={submit} noValidate>
      <Field
        id="bk-name"
        label="Full name"
        placeholder="As it should appear on the bill"
        value={name}
        onChange={setName}
        error={touched && name.trim().length < 2 ? 'Tell us your name' : null}
      />

      <Field
        id="bk-phone"
        label="WhatsApp number"
        placeholder="+91"
        type="tel"
        value={phone}
        onChange={setPhone}
        error={
          touched && phone.replace(/\D/g, '').length < 10
            ? 'A 10 digit number, so we can confirm the slot'
            : null
        }
      />

      <Field
        id="bk-address"
        label="Delivery address"
        placeholder="House or flat, street, landmark"
        value={address}
        onChange={setAddress}
        multiline
        error={touched && address.trim().length < 6 ? 'We need the full address' : null}
      />

      <div className="field">
        <label htmlFor="bk-pin">Pincode</label>
        <input
          id="bk-pin"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          placeholder="682019"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
        />
        {area.state === 'inside' && (
          <span className="field-note good">
            <Tick /> {areaLabel(area)} is inside our delivery area
          </span>
        )}
        {area.state === 'outside' && (
          <span className="field-note bad">
            {pincode} is outside the 20 km area. You can still collect from the godown
            in Vennala: message us and we will arrange it.
          </span>
        )}
        {touched && area.state !== 'inside' && area.state !== 'outside' && (
          <span className="field-note bad">A six digit pincode, please</span>
        )}
      </div>

      <div className="field">
        <span className="field-label">Preferred delivery day</span>
        <div className="slots">
          {slots.map((s, i) => (
            <button
              key={s.long}
              type="button"
              className="slot"
              aria-pressed={slot === i}
              onClick={() => setSlot(i)}
            >
              <span className="slot-day">{s.day}</span>
              <span className="slot-date">{s.date}</span>
            </button>
          ))}
        </div>
      </div>

      {warrantyEligible && (
        <label className="warranty">
          <input
            type="checkbox"
            checked={warranty}
            onChange={(e) => setWarranty(e.target.checked)}
          />
          <span>
            <strong>Add 6 month warranty, Rs 499</strong>
            <span>
              One check in visit and an exchange if the unit fails in the first six
              months.
            </span>
          </span>
        </label>
      )}

      <div className="totals">
        <Row k="Unit price" v={salePrice} />
        {warranty && <Row k="Warranty, 6 months" v={WARRANTY_PRICE} />}
        <Row k="Advance now" v={advance} />
        <Row k="Balance on delivery" v={balance} strong />
      </div>

      <button type="submit" className="btn btn-block" disabled={touched && !ready}>
        Book on WhatsApp
      </button>

      <p className="fineprint">
        The advance is adjusted against the price, not charged on top. It is refunded in
        full if we cannot deliver, or if the unit does not match its photos when it
        reaches you.
      </p>
    </form>
  );
}

function Row({ k, v, strong }: { k: string; v: number; strong?: boolean }) {
  return (
    <div className={strong ? 'total-row strong' : 'total-row'}>
      <span>{k}</span>
      <span>Rs {v.toLocaleString('en-IN')}</span>
    </div>
  );
}

function Field({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  multiline,
  type = 'text'
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          rows={3}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {error && <span className="field-note bad">{error}</span>}
    </div>
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

/** Tomorrow and the day after, which is the realistic delivery window. */
function nextTwoDays() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return [1, 2].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const date = `${d.getDate()} ${months[d.getMonth()]}`;
    return { day: days[d.getDay()], date, long: `${days[d.getDay()]} ${date}` };
  });
}
