// "Digiaccel assignment" attribution shown on the screens and beside the phone frame on desktop.
export default function Credit({ className = "" }) {
  return (
    <p className={`text-center text-[10px] leading-4 tracking-wide text-muted ${className}`}>
      A <span className="font-semibold text-brand">Digiaccel</span> Assignment · Designed &amp; built by{" "}
      <span className="font-medium text-ink">Akshay Bhasin</span>
    </p>
  );
}

export function DesktopCredit() {
  return (
    <div className="animate-fade-up fixed bottom-6 right-6 hidden rounded-md bg-white/80 px-4 py-3 shadow-sm backdrop-blur [animation-delay:400ms] lg:block">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">Digiaccel Assignment</p>
      <p className="mt-0.5 text-sm text-ink">
        Built by <span className="font-semibold text-brand">Akshay Bhasin</span>
      </p>
    </div>
  );
}
