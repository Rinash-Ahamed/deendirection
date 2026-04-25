import { useState, useEffect, useRef } from 'react';

/**
 * QiblaCompass
 * Props:
 *   qiblaAngle  — number: true bearing of Qibla from user's location (degrees from North)
 *   size        — number: diameter in px (default 280)
 *   compact     — boolean: show minimal version
 *   isActive    — boolean: whether the compass is actively listening to sensors
 *   onFacingQibla — function: callback when user is facing Qibla (+/- 5 degrees)
 */
export default function QiblaCompass({ qiblaAngle, size = 280, compact = false, isActive = false, onFacingQibla }) {
  const [deviceHeading, setHeading] = useState(null);
  const [hasPermission, setHasPerm] = useState(null);
  const prevAngleRef = useRef(0);
  const wasFacingRef = useRef(false);
  const prevHeadingRef = useRef(0);

  // Angle of needle tip from top (0 = North, clockwise)
  // When device heading = H, qibla bearing = Q:
  //   needle rotation = Q - H  (so needle points toward Qibla relative to screen)
  const rawTargetAngle = deviceHeading !== null
    ? ((qiblaAngle - deviceHeading) + 360) % 360
    : 0;

  let displayAngle = 0;
  if (deviceHeading !== null) {
    let diff = rawTargetAngle - (prevAngleRef.current % 360);
    if (diff > 180) diff -= 360;
    else if (diff < -180) diff += 360;
    displayAngle = prevAngleRef.current + diff;
    prevAngleRef.current = displayAngle;
  }

  // Smooth rotation for the compass background dial
  const rawHeadingAngle = deviceHeading !== null ? -deviceHeading : 0;
  let displayHeadingAngle = 0;
  if (deviceHeading !== null) {
    let diffH = rawHeadingAngle - (prevHeadingRef.current % 360);
    if (diffH > 180) diffH -= 360;
    else if (diffH < -180) diffH += 360;
    displayHeadingAngle = prevHeadingRef.current + diffH;
    prevHeadingRef.current = displayHeadingAngle;
  }

  /* ── Notify parent if facing Qibla ── */
  useEffect(() => {
    if (onFacingQibla && deviceHeading !== null) {
      // +/- 5 degrees tolerance around North (0/360) where the Qibla needle points straight up
      const isFacing = rawTargetAngle <= 5 || rawTargetAngle >= 355;
      
      if (isFacing && !wasFacingRef.current) {
        if ('vibrate' in navigator) {
          navigator.vibrate(50); // 50ms short vibration burst
        }
      }
      wasFacingRef.current = isFacing;

      onFacingQibla(isFacing);
    }
  }, [rawTargetAngle, deviceHeading, onFacingQibla]);

  /* ── Request device orientation ── */
  useEffect(() => {
    if (!isActive) return;
    if (typeof window.DeviceOrientationEvent === 'undefined') {
      setHasPerm(false);
      return;
    }

    let useAbsolute = false;

    const handler = (e) => {
      if (e.type === 'deviceorientationabsolute') {
        useAbsolute = true;
      } else if (useAbsolute && e.type === 'deviceorientation') {
        return; // Ignore relative events if absolute hardware orientation is available
      }

      if (e.webkitCompassHeading != null) {
        // iOS
        setHeading(e.webkitCompassHeading);
      } else if (e.alpha != null) {
        setHeading((360 - e.alpha) % 360);
      }
    };

    // Permission was already requested by the parent button, so we just attach
    setHasPerm(true);
    window.addEventListener('deviceorientationabsolute', handler, true);
    window.addEventListener('deviceorientation', handler, true);

    return () => {
      window.removeEventListener('deviceorientationabsolute', handler, true);
      window.removeEventListener('deviceorientation', handler, true);
    };
  }, [isActive]);

  const r    = size / 2;
  const cx   = r;
  const cy   = r;

  // Tick marks (36 minor, 8 major)
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const angle  = (i * 5) * (Math.PI / 180);
    const isMajor = i % 9 === 0;
    const isMid   = i % 3 === 0;
    const outer  = r - 4;
    const inner  = outer - (isMajor ? 18 : isMid ? 10 : 6);
    return {
      x1: cx + Math.sin(angle) * inner,
      y1: cy - Math.cos(angle) * inner,
      x2: cx + Math.sin(angle) * outer,
      y2: cy - Math.cos(angle) * outer,
      isMajor,
      isMid,
    };
  });

  const cardinals = [
    { label: 'N', angle: 0 },
    { label: 'E', angle: 90 },
    { label: 'S', angle: 180 },
    { label: 'W', angle: 270 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* Compass SVG */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size} height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ overflow: 'visible' }}
          xmlns="http://www.w3.org/2000/svg"
          className="compass-ring"
        >
          {/* Background circle */}
          <circle cx={cx} cy={cy} r={r - 2}
                  fill="rgba(10,10,10,0.85)"
                  stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.6"/>

          {/* Outer decorative ring */}
          <circle cx={cx} cy={cy} r={r - 10}
                  fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.25"/>

          {/* Rotating Dial (Ticks and Cardinals) */}
          <g
            style={{
              transform: `rotate(${displayHeadingAngle}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
              transition: deviceHeading !== null ? 'transform 0.25s cubic-bezier(0.2, 0.0, 0.2, 1)' : 'none',
              willChange: 'transform'
            }}
          >
            {/* Tick marks */}
            {ticks.map((t, i) => (
              <line key={i}
                x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                stroke="#D4AF37"
                strokeWidth={t.isMajor ? 1.5 : t.isMid ? 1 : 0.6}
                strokeOpacity={t.isMajor ? 0.9 : t.isMid ? 0.5 : 0.25}
              />
            ))}

            {/* Cardinal labels */}
            {cardinals.map(({ label, angle }) => {
              const rad = angle * Math.PI / 180;
              const lx  = cx + Math.sin(rad) * (r - 30);
              const ly  = cy - Math.cos(rad) * (r - 30);
              return (
                <text key={label}
                  x={lx} y={ly}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={label === 'N' ? 14 : 11}
                  fontFamily="Cinzel, serif"
                  fontWeight={label === 'N' ? '700' : '400'}
                  fill={label === 'N' ? '#D4AF37' : 'rgba(245,245,220,0.5)'}
                  style={{
                    transform: `rotate(${-displayHeadingAngle}deg)`,
                    transformOrigin: `${lx}px ${ly}px`,
                    transition: deviceHeading !== null ? 'transform 0.25s cubic-bezier(0.2, 0.0, 0.2, 1)' : 'none',
                    willChange: 'transform'
                  }}
                >
                  {label}
                </text>
              );
            })}
          </g>

          {/* Inner ring */}
          <circle cx={cx} cy={cy} r={r * 0.38}
                  fill="rgba(15,61,46,0.3)"
                  stroke="#D4AF37" strokeWidth="1" strokeOpacity="0.35"/>

          {/* Qibla Needle — rotates to point at Qibla */}
          <g
            className="compass-needle"
            style={{
              transform: `rotate(${displayAngle}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
              transition: deviceHeading !== null ? 'transform 0.25s cubic-bezier(0.2, 0.0, 0.2, 1)' : 'none',
              willChange: 'transform'
            }}
          >
            {/* North / Qibla tip */}
            <polygon
              points={`${cx},${cy - r * 0.52}  ${cx - 7},${cy}  ${cx + 7},${cy}`}
              fill="url(#needleGoldGrad)"
            />
            {/* South tail */}
            <polygon
              points={`${cx},${cy + r * 0.38}  ${cx - 5},${cy}  ${cx + 5},${cy}`}
              fill="rgba(245,245,220,0.2)"
            />

            {/* Kaaba icon at tip */}
            <rect
              x={cx - 9} y={cy - r * 0.52 - 16}
              width={18} height={14}
              rx="2"
              fill="rgba(212,175,55,0.9)"
              stroke="#A88B1F" strokeWidth="1"
            />
            <line
              x1={cx - 9} y1={cy - r * 0.52 - 8}
              x2={cx + 9} y2={cy - r * 0.52 - 8}
              stroke="#A88B1F" strokeWidth="1"
            />
          </g>

          {/* Gradients & defs */}
          <defs>
            <linearGradient id="needleGoldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#E8CB5D"/>
              <stop offset="100%" stopColor="#A88B1F"/>
            </linearGradient>
          </defs>

          {/* Center pivot */}
          <circle cx={cx} cy={cy} r={8}
                  fill="#0F3D2E" stroke="#D4AF37" strokeWidth="1.5"/>
          <circle cx={cx} cy={cy} r={3.5} fill="#D4AF37"/>
        </svg>
      </div>

      {/* Permission notice */}
      {hasPermission === false && (
        <p style={{
          fontSize: 11, color: 'rgba(245,245,220,0.4)', textAlign: 'center',
          maxWidth: 220, lineHeight: 1.5, marginTop: 4,
        }}>
          Compass sensor not available — use manual rotation below.
        </p>
      )}

    </div>
  );
}
