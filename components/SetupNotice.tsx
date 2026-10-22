/**
 * Shown instead of the catalog until the Sanity project is wired up, so a fresh
 * deploy explains itself rather than rendering an empty page.
 */
export default function SetupNotice() {
  return (
    <div className="wrap">
      <div className="empty">
        <h2>Not connected to Sanity yet</h2>
        <p>
          Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> and{' '}
          <code>NEXT_PUBLIC_SANITY_DATASET</code> in the Vercel project, then redeploy.
          Both values come from the existing nestloop.in Sanity project and are safe to
          expose in the browser.
        </p>
        <p>
          The catalog reads documents of type <code>resaleUnit</code>. That schema lives
          in <code>sanity/resaleUnit.ts</code> in this repo and needs registering in the
          Studio before anything shows up here.
        </p>
      </div>
    </div>
  );
}
