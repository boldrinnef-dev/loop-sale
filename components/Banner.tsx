/**
 * The banner has one job: tell someone arriving from an Instagram reel what
 * this is and why a stranger's used fridge is safe to buy, in the time it takes
 * to decide whether to scroll.
 *
 * So the four points below are the objections, answered in order: how do I know
 * what I am getting, what if it breaks, what does it cost me to get it here,
 * and am I paying everything up front.
 */

const POINTS = [
  {
    title: 'Photographed, not stock images',
    body: 'Six photos of the exact unit you receive, dents included.'
  },
  {
    title: 'Tested before it is listed',
    body: 'Run at the godown. Six month warranty available on every unit.'
  },
  {
    title: 'Free delivery within 15 km',
    body: 'From our Eroor godown. Rs 25 a km after that, up to 40 km.'
  },
  {
    title: 'Pay most of it on delivery',
    body: 'A small advance books the unit. The balance when it reaches you.'
  }
];

export default function Banner() {
  return (
    <section className="banner">
      <div className="wrap banner-inner">
        <div className="banner-copy">
          <span className="banner-eyebrow">Refurbished, Kochi</span>
          <h1>
            Appliances and furniture for a fraction of new, with nothing hidden
          </h1>
          <p>
            Every piece here is one physical unit, checked and photographed before it
            goes up. When it sells, it is gone.
          </p>
        </div>

        <ul className="banner-points">
          {POINTS.map((p) => (
            <li key={p.title}>
              <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M3.2 8.4l3.1 3.1 6.5-6.9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>
                <strong>{p.title}</strong>
                <span>{p.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
