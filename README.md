# Nestloop Shop

Public catalog for Nestloop's refurbished appliance and furniture sales, Kochi.
Next.js App Router, reading from the existing nestloop.in Sanity project.

Intended to live at `nestloop.in/shop` once merged into the main site. Deployed
standalone first.

## The one idea

Every listing is one physical unit, quantity 1. There is no stock count anywhere
in this codebase. Availability is the `status` field on the Sanity document, and
Sanity is the single source of truth for it.

Statuses: `draft`, `available`, `reserved`, `sold`, `withdrawn`.
Only `available` is bookable. `reserved` and `sold` stay visible for three days
so the catalog visibly moves, then drop off. `draft` and `withdrawn` never leave
the Studio.

## Setup

1. Register the schema. Copy `sanity/resaleUnit.ts` into the Studio's schema
   folder and add it to `schemaTypes`. Nothing renders until documents of type
   `resaleUnit` exist.

2. Set environment variables. See `.env.example`. For local work copy it to
   `.env.local`:

   | Variable | Where it comes from |
   |---|---|
   | `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity Manage dashboard, existing nestloop.in project |
   | `NEXT_PUBLIC_SANITY_DATASET` | usually `production` |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | booking number, digits only with country code |

3. Run it.

   ```
   npm install
   npm run dev
   ```

Without a project ID the app still builds and deploys, and shows a setup notice
instead of the catalog.

## Structure

```
app/page.tsx              catalog, server rendered, category filter via ?c=
app/unit/[slug]/page.tsx  one unit
lib/sanity.ts             query fetch and image CDN URLs, no SDK
lib/units.ts              types, GROQ, formatting
components/               card and setup notice
sanity/resaleUnit.ts      the schema, for the Studio not for this app
```

There is no Sanity SDK dependency. The query API is a GET request and the image
CDN is a URL pattern, so the dependency list is Next and React only. Swap in
`next-sanity` if live preview is ever wanted.

## Phase 2, not built yet

Today the book button opens WhatsApp with the unit code prefilled. The paid
booking flow replaces it:

1. `POST /api/orders` creates a Razorpay order for the advance.
2. Razorpay webhook on `payment.captured` writes the order row, then sets the
   Sanity document to `reserved` with its `orderRef`.
3. WhatsApp Cloud API sends the confirmation.
4. The order lands in the dispatch flow as `NLD-YYMMDD-NN`.

Two rules for whoever builds it:

- Never mark a unit reserved from the browser success callback. People close the
  tab. The webhook is the only trustworthy signal, and it must be idempotent
  because Razorpay retries.
- Orders and customer details do not go in Sanity. The free plan's datasets are
  public read, and a catalog being public is fine while a customer's phone
  number is not.
