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
import { newOrderId, type BookingRecord } from '@/lib/order';
import { prepayDiscount, type PayChoice } from '@/lib/pricing';
import {
  dayOptions,
  describeIso,
  leadDays,
  pickerRange,
  type DayOption
} from '@/lib/schedule';
import {
  INCLUDED_WARRANTY_MONTHS,
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
  const [day, setDay] = useState<string | null>(null);
  const [pickingOwn, setPickingOwn] = useState(false);
  const [pay, setPay] = useState<PayChoice>('advance');
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState<{ orderId: string; link: string } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPincode(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const q = quote(pincode);
  const days = dayOptions(q);

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

  const range = pickerRange(q);
  // The pincode can change after a date was picked, which moves the earliest
  // date. Fall back to the soonest rather than silently keeping an impossible
  // one.
  const chosen = day && day >= range.min ? day : days[0].iso;

  const servable = q.state === 'quoted' || q.state === 'unknown';

  /**
   * The id of the first field standing in the way, or null when nothing is.
   *
   * Ordered the way the form reads, so someone sent to a problem is sent to
   * the earliest one rather than the last one checked.
   */
  function firstProblem(): string | null {
    if (name.trim().length < 2) return 'bk-name';
    if (phone.replace(/\D/g, '').length < 10) return 'bk-phone';
    if (address.trim().length < 6) return 'bk-address';
    if (!servable) return 'bk-pin';
    return null;
  }

  const ready = firstProblem() === null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);

    const problem = firstProblem();
    if (problem) {
      // The button used to go grey here and the errors sat off the top of the
      // screen, so pressing Book looked like pressing a dead button. Send the
      // person to the field instead of leaving them to hunt for it.
      const el = document.getElementById(problem);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => (el as HTMLInputElement | null)?.focus({ preventScroll: true }), 260);
      return;
    }

    const orderId = newOrderId();
    const plan0 = planFor(warranty);

    const record: BookingRecord = {
      orderId,
      unitCode: productCode,
      title,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      pincode,
      deliveryDate: describeIso(chosen),
      deliveryFee: deliveryUnknown
        ? 'to be confirmed'
        : deliveryFee === 0
          ? 'free'
          : rupees(deliveryFee),
      warranty: plan0 ? `${plan0.name}, 6 months` : '1 month included',
      payChoice: pay === 'full' ? 'full' : 'advance',
      dueNow: payNow,
      total
    };

    // Fired, not awaited, and deliberately before the WhatsApp window opens.
    // Awaiting it would put window.open outside the click gesture and every
    // popup blocker would eat the booking. keepalive lets the request finish
    // after this tab has gone to WhatsApp.
    try {
      void fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
        keepalive: true
      }).catch(() => {
        /* the sale matters more than the row */
      });
    } catch {
      /* ignore */
    }

    const lines = [
      'Hi Nestloop, I want to book this unit from the shop.',
      '',
      `Booking: ${orderId}`,
      title,
      `Code: ${productCode}`,
      `Unit price: ${rupees(salePrice)}`
    ];
    if (warrantyEligible) {
      lines.push(`Warranty: ${INCLUDED_WARRANTY_MONTHS} month included`);
    }
    const plan = planFor(warranty);
    if (plan) {
      lines.push(`Extended to 6 months, ${plan.name}: ${rupees(plan.price)}`);
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
        ? `Wants to pay in full: ${rupees(payNow)}, send the payment link`
        : `Advance to collect: ${rupees(payNow)}`,
      balance > 0 || deliveryUnknown
        ? `Balance on delivery: ${rupees(balance)}${deliveryUnknown ? ' plus delivery' : ''}`
        : 'Balance on delivery: nothing',
      '',
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
      `Address: ${address.trim()}`,
      `Pincode: ${pincode}`,
      `Preferred delivery: ${describeIso(chosen)}`
    );

    const link = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      lines.join('\n')
    )}`;

    // A blocked popup used to leave the page looking like nothing happened.
    // The panel below says the booking is in either way, and carries the link
    // as a plain tap for the phones that refuse to open windows.
    setSent({ orderId, link });
    window.open(link, '_blank', 'noopener');
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
          {days.map((d: DayOption) => (
            <button
              key={d.iso}
              type="button"
              className="slot"
              aria-pressed={chosen === d.iso}
              onClick={() => {
                setDay(d.iso);
                setPickingOwn(false);
              }}
            >
              <span className="slot-day">{d.day}</span>
              <span className="slot-date">{d.date}</span>
              {d.soonest && <span className="slot-tag">Soonest</span>}
            </button>
          ))}
        </div>

        {pickingOwn ? (
          <input
            type="date"
            className="date-input"
            value={chosen}
            min={range.min}
            max={range.max}
            onChange={(e) => e.target.value && setDay(e.target.value)}
          />
        ) : (
          <button
            type="button"
            className="link-button"
            onClick={() => setPickingOwn(true)}
          >
            Pick a different date
          </button>
        )}

        <span className="field-help">
          {leadDays(q) === 2
            ? 'We can usually be there in 48 hours.'
            : 'Outside Kochi city it takes a day longer, so three days from booking.'}{' '}
          The exact time slot is confirmed on WhatsApp after you book, once we see
          that day{String.fromCharCode(39)}s load.
        </span>
      </div>

      {warrantyEligible && (
        <div className="field">
          <span className="field-label">Extended warranty, optional</span>

          {/* The included month is a fact about the unit, not a choice. Making
              it a radio option implied you could end up without it. */}
          <p className="field-stated">
            <Tick />
            <span>
              {INCLUDED_WARRANTY_MONTHS} month warranty comes with this unit at no
              cost. Add one of these to take it to six.
            </span>
          </p>

          <div className="pay-options">
            {WARRANTY_PLANS.map((p) => (
              <PayOption
                key={p.id}
                on={warranty === p.id}
                onPick={() => setWarranty(warranty === p.id ? 'none' : p.id)}
                shape="check"
                title={`${p.name}, ${rupees(p.price)}`}
                sub={p.covers}
              />
            ))}
          </div>

          {warranty !== 'none' && (
            <button
              type="button"
              className="link-button"
              onClick={() => setWarranty('none')}
            >
              Remove the extension
            </button>
          )}

          <span className="field-help">
            Counted from the delivery date. No warranty covers damage after
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
          <Row
            k={`${planFor(warranty)?.name}, extended to 6 months`}
            v={rupees(warrantyCost)}
          />
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

      {/* The button said "Pay in full on WhatsApp" while the site took no
          money at all. Until Razorpay is wired, it books and nothing more, so
          it says so. */}
      {/* Never disabled. A grey button that swallows a tap teaches people the
          site is broken; a live one that walks them to the missing field
          teaches them what to fix. */}
      <button type="submit" className="btn btn-block">
        Book on WhatsApp
      </button>

      {touched && !ready && (
        <p className="form-error">
          One field above still needs filling. We have jumped you to it.
        </p>
      )}

      {sent && (
        <div className="sent-note">
          <strong>Booking {sent.orderId} is with us.</strong>
          <span>
            WhatsApp should have opened with your details ready to send. If it did
            not,{' '}
            <a href={sent.link} target="_blank" rel="noopener noreferrer">
              tap here to open it
            </a>
            .
          </span>
        </div>
      )}

      <p className="fineprint">
        {pay === 'full'
          ? 'We confirm the unit on WhatsApp and send you the payment link there. Nothing is charged on this page.'
          : 'The advance is adjusted against the price, not charged on top.'}{' '}
        It is refunded in full if we cannot deliver, or if the unit does not match its
        photos when it reaches you.
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
  tag,
  shape = 'radio'
}: {
  on: boolean;
  onPick: () => void;
  title: string;
  sub: string;
  tag?: string;
  /** A check reads as "optional, and you can take it off again". */
  shape?: 'radio' | 'check';
}) {
  return (
    <button type="button" className="pay-option" aria-pressed={on} onClick={onPick}>
      <span
        className={shape === 'check' ? 'pay-radio pay-check' : 'pay-radio'}
        aria-hidden="true"
      />
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
