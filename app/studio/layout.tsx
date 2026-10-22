/**
 * The Studio fills the window. No shop header or footer: this is a tool, not a
 * page of the site, and the chrome made the editor unusable.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <div className="studio-shell">{children}</div>;
}
