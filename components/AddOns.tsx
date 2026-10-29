import { rupees } from '@/lib/delivery';
import { INCLUDED_WARRANTY_MONTHS, WARRANTY_PLANS } from '@/lib/warranty';

/**
 * Shown on the unit page, not the checkout. Someone deciding whether to buy a
 * four year old fridge wants to know a warranty exists before they commit, not
 * after. The actual choosing still happens at checkout, so this says so rather
 * than adding a second place to pick.
 */
export default function AddOns() {
  return (
    <section className="addons">
      <div className="addons-head">
        <h2>Warranty</h2>
        <span>Extensions chosen at checkout</span>
      </div>

      <div className="addon included">
        <div className="addon-top">
          <strong>{INCLUDED_WARRANTY_MONTHS} month warranty</strong>
          <span className="addon-price free">Included</span>
        </div>
        <p>
          Every unit we sell carries this at no cost. If something goes wrong in
          the first month, we come and put it right.
        </p>
      </div>

      <div className="addons-list">
        {WARRANTY_PLANS.map((p) => (
          <div className="addon" key={p.id}>
            <div className="addon-top">
              <strong>{p.name}, extend to 6 months</strong>
              <span className="addon-price">{rupees(p.price)}</span>
            </div>
            <span className="addon-summary">{p.summary}</span>
            <p>{p.covers}</p>
          </div>
        ))}
      </div>

      <p className="addons-note">
        Counted from the delivery date. No warranty covers damage after delivery,
        or the cosmetic marks already shown in the photographs above.
      </p>
    </section>
  );
}
