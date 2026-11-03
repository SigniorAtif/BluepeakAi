/**
 * The wordmark, in two halves so the home intro can pull them apart the way Crambook splits
 * "Cram" and "book". The mark is a single peak drawn in the accent.
 */
export function PeakMark({ className = "bp-logo-mark" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M2.5 19.5 9.2 8.3l3.3 5.4 2.6-4.1 6.4 9.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="15.1" cy="5.1" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <>
      <span className="bp-logo-a js-logo-a">
        <PeakMark />
        BluePeak
      </span>
      <span className="bp-logo-b js-logo-b">AI</span>
    </>
  );
}
