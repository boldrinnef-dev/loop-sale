/**
 * The objections someone has before paying a stranger for a used fridge,
 * answered plainly. Native details elements, so it works without JavaScript
 * and the answers are findable by search.
 *
 * Kept honest on purpose. "Grade B means visible wear and we photograph it"
 * does more for a sale than any reassurance, because the buyer has already
 * assumed the worst and is checking whether we admit it.
 */

const FAQS = [
  {
    q: 'Are the photos of the actual unit I get?',
    a: 'Yes. Every listing is one physical appliance with its own photographs, taken at our godown before it goes up. No stock images, no photos of a similar model. If a unit has a dent, there is a close-up of the dent.'
  },
  {
    q: 'What do Grade A and Grade B mean?',
    a: 'Grade A is cosmetically clean with no visible damage. Grade B works properly but has marks, scuffs or a dent somewhere. We will not list a Grade B unit without a close-up photo of what is wrong with it.'
  },
  {
    q: 'What if it stops working?',
    a: 'Every unit is run and tested at the godown before listing. You can add a six month warranty for Rs 499, which covers a check-in visit and an exchange if the unit fails in that time.'
  },
  {
    q: 'How much is delivery?',
    a: 'Free within 15 km of our godown in Eroor, which covers most of Kochi city. Beyond that it is Rs 25 per kilometre, and we deliver up to 40 km. Put your pincode into the delivery check at the top of any page to see the exact figure before you book.'
  },
  {
    q: 'How does payment work?',
    a: 'A small advance books the unit and takes it off the site so nobody else can buy it. You pay the balance when it reaches your door, by UPI or cash. The advance comes off the price, it is not charged on top.'
  },
  {
    q: 'Can I see it before I buy?',
    a: 'Yes. The godown is in Eroor and you are welcome to come and look at anything listed. Message us on WhatsApp and we will tell you when someone is there.'
  },
  {
    q: 'What if I change my mind?',
    a: 'The advance is refunded in full if we cannot deliver, or if the unit does not match its photographs when it reaches you. Our team powers it on and shows it working before they leave.'
  },
  {
    q: 'I am outside your delivery area. Can I still buy?',
    a: 'You can buy and collect from the godown yourself. We do not deliver beyond 40 km at the moment. Message us and we will arrange a time.'
  }
];

export default function Faq() {
  return (
    <section className="faq">
      <div className="wrap faq-inner">
        <h2>Questions people ask</h2>
        <div className="faq-list">
          {FAQS.map((f) => (
            <details key={f.q}>
              <summary>
                <span>{f.q}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M3 6l5 5 5-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
