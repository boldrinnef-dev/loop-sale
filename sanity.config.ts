'use client';

import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { resaleUnit } from './sanity/resaleUnit';
import { structure } from './sanity/structure';

/**
 * Studio for the resale track, embedded at /studio on the shop.
 *
 * Points at the main nestloop.in Sanity project, the same one the rental site
 * uses. Rental appliances and resale units share a dataset but not a document
 * type, so each Studio shows only its own. Nothing here can affect the rental
 * schema or the rental site's queries.
 */
export default defineConfig({
  basePath: '/studio',
  title: 'Nestloop Resale',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  schema: { types: [resaleUnit] },
  plugins: [structureTool({ structure }), visionTool()]
});
