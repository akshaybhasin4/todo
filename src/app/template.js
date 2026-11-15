// Re-mounts on every navigation, so each screen fades in.
// Opacity only: a transform here would break the position:fixed + button on Home.
export default function Template({ children }) {
  return <div className="animate-page-in">{children}</div>;
}
