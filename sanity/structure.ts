import type { StructureResolver } from 'sanity/structure';

/**
 * Sidebar for the resale track.
 *
 * At 75 sales a month a flat list stops being useful fast, so the sections are
 * the states someone actually works in: what needs photographing and pricing,
 * what is live, what has been promised, what has gone.
 *
 * Rental appliances live in this same dataset but are not declared in this
 * Studio's schema, so they do not appear here. That is deliberate: editing a
 * document whose type this Studio only half understands can strip the fields it
 * does not know about.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Nestloop')
    .items([
      S.listItem()
        .title('Needs work')
        .child(
          S.documentList()
            .title('Draft, not listed')
            .filter('_type == "resaleUnit" && status == "draft"')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
        ),

      S.listItem()
        .title('Live on the shop')
        .child(
          S.documentList()
            .title('Available')
            .filter('_type == "resaleUnit" && status == "available"')
            .defaultOrdering([{ field: 'listedAt', direction: 'desc' }])
        ),

      S.listItem()
        .title('Reserved')
        .child(
          S.documentList()
            .title('Advance paid, not delivered')
            .filter('_type == "resaleUnit" && status == "reserved"')
            .defaultOrdering([{ field: 'listedAt', direction: 'desc' }])
        ),

      S.listItem()
        .title('Sold')
        .child(
          S.documentList()
            .title('Sold')
            .filter('_type == "resaleUnit" && status == "sold"')
            .defaultOrdering([{ field: 'soldAt', direction: 'desc' }])
        ),

      S.divider(),

      S.listItem()
        .title('By category')
        .child(
          S.list()
            .title('Category')
            .items([
              catItem(S, 'Refrigerators', 'refrigerator'),
              catItem(S, 'Washing machines', 'washing-machine'),
              catItem(S, 'Air conditioners', 'air-conditioner'),
              catItem(S, 'Wardrobes', 'wardrobe'),
              catItem(S, 'Cots', 'cot'),
              catItem(S, 'Sofas', 'sofa'),
              catItem(S, 'Study tables', 'study-table'),
              catItem(S, 'Dining sets', 'dining-set'),
              catItem(S, 'Everything else', null)
            ])
        ),

      S.listItem()
        .title('By batch')
        .child(
          S.documentTypeList('resaleUnit')
            .title('All units, newest first')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
        ),

      S.divider(),

      S.listItem()
        .title('Withdrawn')
        .child(
          S.documentList()
            .title('Pulled from sale')
            .filter('_type == "resaleUnit" && status == "withdrawn"')
        ),

      S.listItem()
        .title('All resale units')
        .child(S.documentTypeList('resaleUnit').title('All resale units'))
    ]);

const KNOWN = [
  'refrigerator',
  'washing-machine',
  'air-conditioner',
  'wardrobe',
  'cot',
  'sofa',
  'study-table',
  'dining-set'
];

/** `null` value means everything outside the common categories. */
function catItem(S: Parameters<StructureResolver>[0], title: string, value: string | null) {
  const filter = value
    ? '_type == "resaleUnit" && category == $cat'
    : '_type == "resaleUnit" && !(category in $known)';

  return S.listItem()
    .title(title)
    .child(
      S.documentList()
        .title(title)
        .filter(filter)
        .params(value ? { cat: value } : { known: KNOWN })
        .defaultOrdering([{ field: 'salePrice', direction: 'asc' }])
    );
}
