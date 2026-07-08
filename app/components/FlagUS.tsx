/*
  Tiny decorative US flag (nasaforce.gov-banner style). Deliberately
  aria-hidden with no role/title: the adjacent text carries all meaning,
  and naming it "U.S. flag" beside "not a U.S. government website" would
  invite the exact misreading the strip disclaims.
*/
export default function FlagUS({ width = 19 }: { width?: number }) {
  const h = Math.round(width * (10 / 19));
  return (
    <svg
      viewBox="0 0 190 100"
      width={width}
      height={h}
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0, display: 'inline-block' }}
    >
      <rect width="190" height="100" fill="#f5f5f4" />
      {[0, 15.4, 30.8, 46.2, 61.6, 77, 92.3].map(y => (
        <rect key={y} y={y} width="190" height="7.7" fill="#B22234" />
      ))}
      <rect width="76" height="53.9" fill="#3C3B6E" />
      {[10, 27, 44].map(cy =>
        [10, 29, 48, 67].map(cx => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.2" fill="#f5f5f4" />
        ))
      )}
    </svg>
  );
}
