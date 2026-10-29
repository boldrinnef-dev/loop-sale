/**
 * Nestloop resale unit
 *
 * One document per physical unit. Quantity is always 1, so there is no
 * stock count anywhere: availability is the `status` field.
 *
 * Drop this into the Studio schema folder and register it in schemaTypes.
 * Status is written back by the Razorpay webhook on payment captured.
 * It stays editable in Studio so offline sales (WhatsApp, godown walk-in)
 * can be marked by hand.
 */

import { defineField, defineType } from 'sanity'

export const resaleUnit = defineType({
  name: 'resaleUnit',
  title: 'Resale Unit',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identity', default: true },
    { name: 'listing', title: 'Listing' },
    { name: 'pricing', title: 'Pricing' },
    { name: 'photos', title: 'Photos' },
    { name: 'status', title: 'Status' },
  ],
  fields: [
    // ---------- Identity ----------
    defineField({
      name: 'productCode',
      title: 'Product code',
      type: 'string',
      group: 'identity',
      description:
        'Resale codes run NL-SL-<type>-<number>. Example: NL-SL-WM-0035 for a washing machine, NL-SL-FD-0051 for a fridge. Use the next number in the sequence.',
      validation: (Rule) => Rule.required().min(6),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      group: 'identity',
      options: {
        source: 'productCode',
        maxLength: 96,
        slugify: (input) => input.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'batchId',
      title: 'Batch ID',
      type: 'string',
      group: 'identity',
      description: 'From the Batch Intake Register. Example: BAT-261010-SS.',
    }),
    defineField({
      name: 'owner',
      title: 'Owned by',
      type: 'string',
      group: 'identity',
      description:
        'Who owns the unit. Company stock today. Vendor and customer exist so the schema does not need rewriting when third party listings start.',
      options: {
        list: [
          { title: 'Nestloop (company stock)', value: 'company' },
          { title: 'Vendor listing', value: 'vendor' },
          { title: 'Customer listing (C2C)', value: 'customer' },
        ],
        layout: 'radio',
      },
      initialValue: 'company',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ownerName',
      title: 'Vendor or seller name',
      type: 'string',
      group: 'identity',
      hidden: ({ parent }) => parent?.owner === 'company',
    }),

    // ---------- Listing ----------
    defineField({
      name: 'condition',
      title: 'Refurbished or new',
      type: 'string',
      group: 'listing',
      description:
        'Appliances are refurbished, so they carry a grade and an honest condition note. Furniture is bought new from wholesale vendors and manufacturers, so it carries neither.',
      options: {
        list: [
          { title: 'Refurbished', value: 'refurbished' },
          { title: 'Brand new', value: 'new' },
        ],
        layout: 'radio',
      },
      initialValue: 'refurbished',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Display title',
      type: 'string',
      group: 'listing',
      description:
        'What the customer sees. Example: LG 6.5 kg Semi Automatic Washing Machine. Keep it the same across units of the same model.',
      validation: (Rule) => Rule.required().max(90),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'listing',
      options: {
        list: [
          { title: 'Washing machine', value: 'washing-machine' },
          { title: 'Refrigerator', value: 'refrigerator' },
          { title: 'Wardrobe', value: 'wardrobe' },
          { title: 'Cot', value: 'cot' },
          { title: 'Mattress', value: 'mattress' },
          { title: 'Sofa', value: 'sofa' },
          { title: 'Study table', value: 'study-table' },
          { title: 'Dining set', value: 'dining-set' },
          { title: 'Air conditioner', value: 'air-conditioner' },
          { title: 'Air cooler', value: 'air-cooler' },
          { title: 'Water purifier', value: 'water-purifier' },
          { title: 'Gas stove', value: 'gas-stove' },
          { title: 'Mixer grinder', value: 'mixer-grinder' },
          { title: 'Air fryer', value: 'air-fryer' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'string',
      group: 'listing',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'model',
      title: 'Model',
      type: 'string',
      group: 'listing',
      description: 'From the model plate. Leave blank if unreadable.',
    }),
    defineField({
      name: 'capacity',
      title: 'Capacity or size',
      type: 'string',
      group: 'listing',
      description: 'Example: 6.5 kg, 190 L, 3 door, 1.5 ton.',
    }),
    defineField({
      name: 'approxAgeYears',
      title: 'Approximate age (years)',
      type: 'number',
      group: 'listing',
      validation: (Rule) => Rule.min(0).max(25),
    }),
    defineField({
      name: 'grade',
      title: 'Grade',
      type: 'string',
      group: 'listing',
      description:
        'A is functional and cosmetically clean. B is functional with visible wear. Resale stock is mostly B. A Grade B unit must carry a defect photo.',
      options: {
        list: [
          { title: 'A', value: 'A' },
          { title: 'B', value: 'B' },
        ],
        layout: 'radio',
      },
      hidden: ({ document }) => document?.condition === 'new',
      validation: (Rule) =>
        Rule.custom((grade, context) => {
          const doc = context.document as any
          if (doc?.condition === 'new') return true
          return grade ? true : 'A refurbished unit needs a grade'
        }),
    }),
    defineField({
      name: 'conditionNote',
      title: 'Condition, in plain words',
      type: 'text',
      rows: 3,
      group: 'listing',
      description:
        'One or two honest sentences. Say what the marks are and where. This is what prevents an argument at the door.',
      hidden: ({ document }) => document?.condition === 'new',
      validation: (Rule) =>
        Rule.max(400).custom((note, context) => {
          const doc = context.document as any
          if (doc?.condition === 'new') return true
          if (!note || String(note).trim().length < 20) {
            return 'A refurbished unit needs an honest condition note, at least 20 characters'
          }
          return true
        }),
    }),
    defineField({
      name: 'included',
      title: 'What is included',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'listing',
      options: {
        list: [
          { title: 'Inlet pipe', value: 'inlet-pipe' },
          { title: 'Drain pipe', value: 'drain-pipe' },
          { title: 'Shelves', value: 'shelves' },
          { title: 'Trays', value: 'trays' },
          { title: 'Remote', value: 'remote' },
          { title: 'Keys', value: 'keys' },
          { title: 'Stabiliser', value: 'stabiliser' },
        ],
      },
    }),

    // ---------- Pricing ----------
    defineField({
      name: 'salePrice',
      title: 'Sale price (Rs)',
      type: 'number',
      group: 'pricing',
      description: 'Total sale price. Advance plus balance, not the balance alone.',
      validation: (Rule) => Rule.required().positive().integer(),
    }),
    defineField({
      name: 'strikePrice',
      title: 'Strike price (Rs)',
      type: 'number',
      group: 'pricing',
      description:
        'Shown struck through to display the discount. Leave blank for no discount badge. Must be higher than the sale price.',
      validation: (Rule) =>
        Rule.positive()
          .integer()
          .custom((strike, context) => {
            const sale = (context.document as any)?.salePrice
            if (!strike || !sale) return true
            return strike > sale ? true : 'Strike price must be higher than the sale price'
          }),
    }),
    defineField({
      name: 'advanceAmount',
      title: 'Advance to book (Rs)',
      type: 'number',
      group: 'pricing',
      description: 'Token collected online. Balance is collected on delivery.',
      initialValue: 500,
      validation: (Rule) => Rule.required().positive().integer(),
    }),
    defineField({
      name: 'warrantyEligible',
      title: 'Eligible for the Rs 499 warranty add-on',
      type: 'boolean',
      group: 'pricing',
      description:
        'Six month check in warranty with exchange. Priced and reported separately from the sale.',
      initialValue: true,
    }),

    // ---------- Photos ----------
    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      group: 'photos',
      description:
        'The intake shots for this code: front, controls, interior, rear, model plate. First image is the catalog thumbnail.',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'shotType',
              title: 'Shot',
              type: 'string',
              options: {
                list: [
                  { title: 'Front', value: 'front' },
                  { title: 'Controls', value: 'controls' },
                  { title: 'Interior', value: 'interior' },
                  { title: 'Rear', value: 'rear' },
                  { title: 'Model plate', value: 'model-plate' },
                  { title: 'Other', value: 'other' },
                ],
              },
            },
            {
              name: 'alt',
              title: 'Alt text',
              type: 'string',
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(3).max(10),
    }),
    defineField({
      name: 'defectImage',
      title: 'Defect close up',
      type: 'image',
      group: 'photos',
      options: { hotspot: true },
      description:
        'Mandatory on Grade B. Shown on the product page, never hidden. An undisclosed dent comes back as a warranty claim.',
      hidden: ({ document }) => document?.condition === 'new',
      validation: (Rule) =>
        Rule.custom((image, context) => {
          const doc = context.document as any
          if (doc?.condition === 'new') return true
          if (doc?.grade === 'B' && !image) return 'A Grade B unit needs a defect photo'
          return true
        }),
    }),

    // ---------- Status ----------
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'status',
      description:
        'Available units show in the catalog. Reserved is set automatically when an advance is paid. Set Sold by hand for an offline sale.',
      options: {
        list: [
          { title: 'Draft, not listed', value: 'draft' },
          { title: 'Available', value: 'available' },
          { title: 'Reserved (advance paid)', value: 'reserved' },
          { title: 'Sold', value: 'sold' },
          { title: 'Withdrawn', value: 'withdrawn' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'orderRef',
      title: 'Order reference',
      type: 'string',
      group: 'status',
      description: 'Written by the payment webhook. Booking ID, format NLD-YYMMDD-NN.',
      readOnly: true,
    }),
    defineField({
      name: 'listedAt',
      title: 'Listed on',
      type: 'datetime',
      group: 'status',
    }),
    defineField({
      name: 'soldAt',
      title: 'Sold on',
      type: 'datetime',
      group: 'status',
    }),
  ],

  orderings: [
    {
      title: 'Newest listed',
      name: 'listedAtDesc',
      by: [{ field: 'listedAt', direction: 'desc' }],
    },
    {
      title: 'Price, low to high',
      name: 'priceAsc',
      by: [{ field: 'salePrice', direction: 'asc' }],
    },
    {
      title: 'Status',
      name: 'statusAsc',
      by: [
        { field: 'status', direction: 'asc' },
        { field: 'listedAt', direction: 'desc' },
      ],
    },
  ],

  preview: {
    select: {
      title: 'title',
      code: 'productCode',
      condition: 'condition',
      price: 'salePrice',
      status: 'status',
      media: 'images.0',
    },
    prepare({ title, code, condition, price, status, media }) {
      const badge: Record<string, string> = {
        draft: 'DRAFT',
        available: 'AVAILABLE',
        reserved: 'RESERVED',
        sold: 'SOLD',
        withdrawn: 'WITHDRAWN',
      }
      return {
        title: title || code,
        subtitle: `${code} | ${condition === 'new' ? 'NEW' : 'REFURB'} | Rs ${price ?? '?'} | ${badge[status] ?? status ?? 'no status'}`,
        media,
      }
    },
  },
})

export default resaleUnit
