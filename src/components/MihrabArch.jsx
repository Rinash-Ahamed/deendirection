/**
 * MihrabArch — Decorative Islamic arch used as a frame on various screens.
 * Props:
 *   size    — number (default 260): width in px
 *   opacity — number (default 1)
 *   glow    — boolean: adds gold glow filter
 *   children — rendered inside the arch
 */
export default function MihrabArch({ size = 260, opacity = 1, glow = false, children }) {
  const w  = size;
  const h  = size * 1.2;
  const cx = w / 2;
  const base = h * 0.92;
  const archTop = h * 0.12;
  const stemY   = h * 0.42;

  // Outer arch path: sides rise straight then meet in a pointed arch
  const outerPath = `
    M ${w * 0.08} ${base}
    L ${w * 0.08} ${stemY}
    Q ${w * 0.08} ${archTop} ${cx} ${archTop * 0.6}
    Q ${w * 0.92} ${archTop} ${w * 0.92} ${stemY}
    L ${w * 0.92} ${base}
    Z
  `;

  const innerPath = `
    M ${w * 0.16} ${base}
    L ${w * 0.16} ${stemY + h * 0.04}
    Q ${w * 0.16} ${archTop * 1.6} ${cx} ${archTop * 1.2}
    Q ${w * 0.84} ${archTop * 1.6} ${w * 0.84} ${stemY + h * 0.04}
    L ${w * 0.84} ${base}
    Z
  `;

  return (
    <div style={{ position: 'relative', width: w, height: h, opacity }}>
      <svg
        width={w} height={h} viewBox={`0 0 ${w} ${h}`}
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {glow && (
          <defs>
            <filter id="arch-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
              <feColorMatrix in="blur" type="matrix"
                values="1 0.8 0 0 0.1  0.7 0.5 0 0 0.06  0 0 0 0 0  0 0 0 0.6 0"
                result="colored"/>
              <feMerge><feMergeNode in="colored"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
        )}

        {/* Background fill */}
        <path d={outerPath} fill="rgba(212,175,55,0.03)"/>

        {/* Outer arch border */}
        <path d={outerPath}
              stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.65"
              filter={glow ? 'url(#arch-glow)' : undefined}/>

        {/* Inner arch border */}
        <path d={innerPath}
              stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.3"/>

        {/* Keystone detail at peak */}
        <path d={`M ${cx - w * 0.06} ${archTop * 0.75} L ${cx} ${archTop * 0.3} L ${cx + w * 0.06} ${archTop * 0.75}`}
              stroke="#D4AF37" strokeWidth="1.2" strokeOpacity="0.55"/>

        {/* Spandrel dots */}
        <circle cx={cx - w * 0.1} cy={archTop * 1.3} r="2" fill="#D4AF37" opacity="0.3"/>
        <circle cx={cx + w * 0.1} cy={archTop * 1.3} r="2" fill="#D4AF37" opacity="0.3"/>
        <circle cx={cx}           cy={archTop * 0.9}  r="2.5" fill="#D4AF37" opacity="0.5"/>

        {/* Column capitals */}
        <rect x={w * 0.06} y={stemY - 4} width={w * 0.04} height={6} rx="1" fill="#D4AF37" opacity="0.4"/>
        <rect x={w * 0.90} y={stemY - 4} width={w * 0.04} height={6} rx="1" fill="#D4AF37" opacity="0.4"/>

        {/* Base platform */}
        <rect x={w * 0.06} y={base}          width={w * 0.88} height={3}   rx="1.5" fill="#D4AF37" opacity="0.55"/>
        <rect x={w * 0.03} y={base + 3}      width={w * 0.94} height={2}   rx="1"   fill="#D4AF37" opacity="0.3"/>
        <rect x={0}        y={base + 5}      width={w}        height={1.5} rx="0.75" fill="#D4AF37" opacity="0.15"/>
      </svg>

      {/* Content slot */}
      <div style={{
        position: 'absolute',
        left:   `${w * 0.16}px`,
        right:  `${w * 0.16}px`,
        top:    `${archTop * 1.4}px`,
        bottom: `${h - base}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}
