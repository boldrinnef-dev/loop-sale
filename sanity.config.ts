'use client';

import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { resaleUnit } from './sanity/resaleUnit';

/**
 * Studio embedded at /studio on this same site, so stock can be added from a
 * browser with no local setup. Sanity handles the login; the route being public
 * does not make the data editable.
 */
export default defineConfig({
  basePath: '/studio',
  title: 'Nestloop Shop',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  schema: { types: [resaleUnit] },
  plugins: [structureTool(), visionTool()]
});
