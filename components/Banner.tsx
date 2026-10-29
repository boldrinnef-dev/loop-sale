/**
 * The banner has one job: tell someone arriving from an Instagram reel what
 * this is, in the time it takes to decide whether to keep scrolling.
 *
 * The highlights are four words each on purpose. Nobody reads a paragraph on a
 * banner. The detail behind each one lives in the FAQ at the bottom of the
 * page, where someone who is actually weighing it up will go looking.
 *
 * The headline says "home essentials" rather than "refurbished appliances" so
 * that new furniture can join without a rewrite. The sub-line carries the
 * appliance detail, because appliances are what we are pushing now.
 */

const HIGHLIGHTS = [
  { icon: 'camera', label: 'Real photos', sub: 'Six per unit' },
  { icon: 'check', label: 'Tested', sub: '6 month warranty' },
  { icon: 'truck', label: 'Free delivery', sub: 'Within 15 km' },
  { icon: 'wallet', label: 'Pay on delivery', sub: 'Small advance books it' }
];

export default function Banner() {
  return (
    <section className="banner">
      <div className="wrap banner-inner">
        <div className="banner-copy">
          <span className="banner-eyebrow">Kochi</span>
          <h1>Home essentials for a fraction of retail</h1>
          <p>
            Refurbished fridges and washing machines, each one tested and photographed
            before it goes up. Every listing is a single unit. When it sells, it is
            gone.
          </p>
        </div>

        <ul className="highlights">
          {HIGHLIGHTS.map((h) => (
            <li key={h.label}>
              <Icon name={h.icon} />
              <strong>{h.label}</strong>
              <span>{h.sub}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Icon({ name }: { name: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true
  };

  if (name === 'camera') {
    return (
      <svg {...common}>
        <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.1-2h8.4l1.1 2h2.2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" />
        <circle cx="12" cy="13" r="3.4" />
      </svg>
    );
  }
  if (name === 'check') {
    return (
      <svg {...common}>
        <path d="M12 3l7 3v5.5c0 4.2-2.9 7.6-7 9.5-4.1-1.9-7-5.3-7-9.5V6z" />
        <path d="M9 12l2 2 4-4.5" />
      </svg>
    );
  }
  if (name === 'truck') {
    return (
      <svg {...common}>
        <path d="M3 7h10v9H3z" />
        <path d="M13 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="1.8" />
        <circle cx="17" cy="18" r="1.8" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 16.5z" />
      <path d="M3 8.5h18" />
      <circle cx="16.5" cy="13" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
