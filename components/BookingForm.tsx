'use client';

import { useEffect, useState } from 'react';
import {
  FREE_RADIUS_KM,
  MAX_RADIUS_KM,
  PER_KM,
  quote,
  quoteSentence,
  rupees
} from '@/lib/delivery';

import { STORAGE_KEY } from '@/lib/delivery-client';
import { prepayDiscount, type PayChoice } from '@/lib/pricing';
import {
  WARRANTY_PLANS,
  planFor,
  warrantyPrice,
  type WarrantyChoice
} from '@/lib/warranty';

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
 * everything to WhatsApp rather than taking money: a reservation with no
 * payment behind it would let the same unit be promised twice.
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
  const [warranty, setWarranty] = useState<WarrantyChoice>('none');
  const [slot, setSlot] = useState(0);
  const [pay, setPay] = useState<PayChoice>('advance');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPincode(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const q = quote(pincode);
  const slots = nextTwoDays();

  const deliveryFee = q.state === 'quoted' ? q.fee : 0;
  const deliveryUnknown = q.state === 'unknown';
  const warrantyCost = warrantyPrice(warranty);
  const goods = salePrice + warrantyCost;
  const gross = goods + deliveryFee;

  // Discount applies to the goods, not the delivery fee. Delivery is a cost we
  // pay out, so discounting it would mean paying the customer to live further
  // away.
  const discount = pay === 'full' ? prepayDiscount(goods) : 0;
  const total = gross - discount;

  // A delivery fee we have not been able to quote cannot be charged up front,
  // so prepay collects the goods and the fee is settled on delivery.
  const payNow = pay === 'full' ? (deliveryUnknown ? goods - discount : total) : advance;
  const balance = total - payNow;

  const servable = q.state === 'quoted' || q.state === 'unknown';
  const ready =
    name.trim().length > 1 &&
    phone.replace(/\D/g, '').length >= 10 &&
    address.trim().length > 5 &&
    servable;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!ready) return;

    const lines = [
      'Hi Nestloop, I want to book this unit from the shop.',
      '',
      title,
      `Code: ${productCode}`,
      `Unit price: ${rupees(salePrice)}`
    ];
    const plan = planFor(warranty);
    if (plan) {
      lines.push(`${plan.name} warranty, 6 months: ${rupees(plan.price)}`);
    }
    lines.push(
      deliveryUnknown
        ? 'Delivery: to be confirmed'
        : deliveryFee === 0
          ? 'Delivery: free'
          : `Delivery: ${rupees(deliveryFee)}`
    );
    if (discount > 0) lines.push(`Paid in full discount: -${rupees(discount)}`);
    lines.push(
      `Total: ${rupees(total)}${deliveryUnknown ? ' plus delivery' : ''}`,
      pay === 'full'
        ? `Paying in full now: ${rupees(payNow)}`
        : `Advance now: ${rupees(payNow)}`,
      balance > 0 || deliveryUnknown
        ? `Balance on delivery: ${rupees(balance)}${deliveryUnknown ? ' plus delivery' : ''}`
        : 'Balance on delivery: nothing',
      '',
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Address: ${address.trim()}`,
      `Pincode: ${pincode}`,
      `Preferred delivery: ${slots[slot].long}`
    );

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
        {q.state !== 'empty' && (
          <span className={`field-note ${tone(q.state, deliveryFee)}`}>
            {q.state === 'quoted' && deliveryFee === 0 && <Tick />}
            {quoteSentence(q)}
          </span>
        )}
        {touched && q.state === 'empty' && (
          <span className="field-note bad">We need your pincode to price delivery</span>
        )}
        <span className="field-help">
          Free within {FREE_RADIUS_KM} km of the Eroor godown, then {rupees(PER_KM)} a
          km, up to {MAX_RADIUS_KM} km.
        </span>
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
        <div className="field">
          <span className="field-label">Six month warranty, optional</span>
          <div className="pay-options">
            <PayOption
              on={warranty === 'none'}
              onPick={() => setWarranty('none')}
              title="No warranty"
              sub="The unit is tested before it leaves us either way."
            />
            {WARRANTY_PLANS.map((p) => (
              <PayOption
                key={p.id}
                on={warranty === p.id}
                onPick={() => setWarranty(p.id)}
                title={`${p.name}, ${rupees(p.price)}`}
                sub={p.covers}
              />
            ))}
          </div>
          <span className="field-help">
            Six months from the delivery date. Neither plan covers damage after
            delivery, or the cosmetic marks already shown in the photographs.
          </span>
        </div>
      )}

      <div className="field">
        <span className="field-label">How you want to pay</span>
        <div className="pay-options">
          <PayOption
            on={pay === 'advance'}
            onPick={() => setPay('advance')}
            title={`${rupees(advance)} now`}
            sub={`Balance of ${rupees(gross - advance)} when it reaches you, UPI or cash.`}
          />
          <PayOption
            on={pay === 'full'}
            onPick={() => setPay('full')}
            title={`${rupees(gross - prepayDiscount(goods))} now`}
            sub="Pay in full and nothing is owed at the door."
            tag={`Save ${rupees(prepayDiscount(goods))}`}
          />
        </div>
      </div>

      <div className="totals">
        <Row k="Unit price" v={rupees(salePrice)} />
        {warrantyCost > 0 && (
          <Row k={`${planFor(warranty)?.name} warranty, 6 months`} v={rupees(warrantyCost)} />
        )}
        <Row
          k={q.state === 'quoted' && q.fee > 0 ? `Delivery, ${q.km} km` : 'Delivery'}
          v={
            deliveryUnknown
              ? 'Confirmed on WhatsApp'
              : deliveryFee === 0
                ? 'Free'
                : rupees(deliveryFee)
          }
        />
        {discount > 0 && <Row k="Paid in full discount" v={`-${rupees(discount)}`} good />}
        <Row k={pay === 'full' ? 'Paying now' : 'Advance now'} v={rupees(payNow)} />
        <Row
          k="Balance on delivery"
          v={
            deliveryUnknown
              ? `${rupees(balance)} plus delivery`
              : balance > 0
                ? rupees(balance)
                : 'Nothing'
          }
          strong
        />
      </div>

      <button type="submit" className="btn btn-block" disabled={touched && !ready}>
        {pay === 'full' ? 'Pay in full on WhatsApp' : 'Book on WhatsApp'}
      </button>

      <p className="fineprint">
        The advance is adjusted against the price, not charged on top. It is refunded in
        full if we cannot deliver, or if the unit does not match its photos when it
        reaches you.
      </p>
    </form>
  );
}

function tone(state: string, fee: number): string {
  if (state === 'quoted') return fee === 0 ? 'good' : 'warn';
  if (state === 'too-far' || state === 'invalid') return 'bad';
  return '';
}

function Row({
  k,
  v,
  strong,
  good
}: {
  k: string;
  v: string;
  strong?: boolean;
  good?: boolean;
}) {
  return (
    <div className={`total-row${strong ? ' strong' : ''}${good ? ' good' : ''}`}>
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}

function PayOption({
  on,
  onPick,
  title,
  sub,
  tag
}: {
  on: boolean;
  onPick: () => void;
  title: string;
  sub: string;
  tag?: string;
}) {
  return (
    <button type="button" className="pay-option" aria-pressed={on} onClick={onPick}>
      <span className="pay-radio" aria-hidden="true" />
      <span className="pay-text">
        <span className="pay-title">
          {title}
          {tag && <span className="pay-tag">{tag}</span>}
        </span>
        <span className="pay-sub">{sub}</span>
      </span>
    </button>
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

/** Tomorrow and the day after, the realistic delivery window. */
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
