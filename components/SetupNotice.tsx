/**
 * Thin banner shown above the sample catalog until the Sanity project is wired
 * up, so a fresh deploy explains itself without hiding the layout.
 */
export default function SetupNotice() {
  return (
    <div className="wrap">
      <div className="notice">
        <strong>Sample stock.</strong> Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> in
        the Vercel project and redeploy to show real units. The catalog reads documents
        of type <code>resaleUnit</code>, the schema for which is in{' '}
        <code>sanity/resaleUnit.ts</code> in this repo and needs registering in the
        Studio.
      </div>
    </div>
  );
}
