import type { StructureResolver } from 'sanity/structure';

/**
 * Two lists, deliberately.
 *
 * The status already shows on every row in the preview subtitle, so filtering
 * by it is only worth a sidebar entry once scrolling becomes the problem. The
 * one exception is "live on the shop", which answers the question worth asking
 * daily: what can a customer actually buy right now.
 *
 * Add more lists when a flat list gets tiring, not before.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Nestloop')
    .items([
      S.listItem()
        .title('All resale units')
        .child(
          S.documentTypeList('resaleUnit')
            .title('All resale units')
            .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
        ),

      S.listItem()
        .title('Live on the shop')
        .child(
          S.documentList()
            .title('Available to buy')
            .filter('_type == "resaleUnit" && status == "available"')
            .defaultOrdering([{ field: 'listedAt', direction: 'desc' }])
        )
    ]);
