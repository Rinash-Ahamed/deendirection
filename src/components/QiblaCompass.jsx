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
  const [continuousHeading, setContinuousHeading] = useState(null);
  const [hasPermission, setHasPerm] = useState(null);
  const wasFacingRef = useRef(false);

  const rawTargetAngle = continuousHeading !== null ? ((qiblaAngle - continuousHeading) % 360 + 360) % 360 : null;
  const isFacing = rawTargetAngle !== null && (rawTargetAngle <= 5 || rawTargetAngle >= 355);

  /* ── Notify parent & vibrate if facing Qibla ── */
  useEffect(() => {
    if (onFacingQibla && continuousHeading !== null) {
      if (isFacing && !wasFacingRef.current) {
        if ('vibrate' in navigator) {
          // Double-pulse "heartbeat" vibration (100ms on, 50ms off, 100ms on)
          navigator.vibrate([100, 50, 100]);
        }
      }
      wasFacingRef.current = isFacing;

      onFacingQibla(isFacing);
    }
  }, [continuousHeading, qiblaAngle, onFacingQibla, isFacing]);

  /* ── Request device orientation ── */
  useEffect(() => {
    if (!isActive) return;
    if (typeof window.DeviceOrientationEvent === 'undefined') {
      setHasPerm(false);
      return;
    }

    let useAbsolute = false;

    const handler = (e) => {
      let heading = null;

      if (e.webkitCompassHeading != null) {
        // iOS
        heading = e.webkitCompassHeading;
      } else if (e.absolute === true && e.alpha != null) {
        // Android absolute
        heading = (360 - e.alpha) % 360;
      } else if (e.type === 'deviceorientationabsolute' && e.alpha != null) {
        // Android deviceorientationabsolute
        heading = (360 - e.alpha) % 360;
      } else if (e.alpha != null && !useAbsolute) {
        // Fallback to relative
        heading = (360 - e.alpha) % 360;
      }

      if (e.absolute === true || e.type === 'deviceorientationabsolute') {
        useAbsolute = true;
      }

      if (heading !== null) {
        setContinuousHeading(prev => {
          if (prev === null) return heading;
          let diff = heading - ((prev % 360) + 360) % 360;
          if (diff > 180) diff -= 360;
          else if (diff < -180) diff += 360;
          
          // Fast exponential moving average to smooth sensor micro-jitter
          return prev + diff * 0.4;
        });
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

  const displayHeadingAngle = continuousHeading !== null ? -continuousHeading : 0;
  const displayAngle = continuousHeading !== null ? qiblaAngle - continuousHeading : 0;

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
                  fill={isFacing ? '#D4AF37' : 'rgba(10,10,10,0.85)'}
                  stroke={isFacing ? '#F5F5DC' : '#D4AF37'} strokeWidth="1.5" strokeOpacity="0.6"
                  style={{ transition: 'all 0.4s ease' }}/>

          {/* Alignment Ripple Effect */}
          {isFacing && (
            <g>
              <circle cx={cx} cy={cy} fill="none" stroke="#F5F5DC">
                <animate attributeName="r" values={`10; ${r - 10}`} dur="2s" begin="0s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8; 0" dur="2s" begin="0s" repeatCount="indefinite" />
                <animate attributeName="stroke-width" values="3; 0" dur="2s" begin="0s" repeatCount="indefinite" />
              </circle>
              <circle cx={cx} cy={cy} fill="none" stroke="#F5F5DC">
                <animate attributeName="r" values={`10; ${r - 10}`} dur="2s" begin="-1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8; 0" dur="2s" begin="-1s" repeatCount="indefinite" />
                <animate attributeName="stroke-width" values="3; 0" dur="2s" begin="-1s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* Outer decorative ring */}
          <circle cx={cx} cy={cy} r={r - 10}
                  fill="none" stroke={isFacing ? '#0F3D2E' : '#D4AF37'} strokeWidth="0.5" strokeOpacity="0.25"
                  style={{ transition: 'stroke 0.4s ease' }}/>

          {/* Rotating Dial (Ticks and Cardinals) */}
          <g
            style={{
              transform: `rotate(${displayHeadingAngle}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
              willChange: 'transform'
            }}
          >
            {/* Tick marks */}
            {ticks.map((t, i) => (
              <line key={i}
                x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                stroke={isFacing ? '#0F3D2E' : '#D4AF37'}
                strokeWidth={t.isMajor ? 1.5 : t.isMid ? 1 : 0.6}
                strokeOpacity={t.isMajor ? 0.9 : t.isMid ? 0.5 : 0.25}
                style={{ transition: 'stroke 0.4s ease' }}
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
                  fill={isFacing ? '#0F3D2E' : (label === 'N' ? '#D4AF37' : 'rgba(245,245,220,0.5)')}
                  style={{
                    transform: `rotate(${-displayHeadingAngle}deg)`,
                    transformOrigin: `${lx}px ${ly}px`,
                    willChange: 'transform',
                    transition: 'fill 0.4s ease'
                  }}
                >
                  {label}
                </text>
              );
            })}
          </g>

          {/* Inner ring */}
          <circle cx={cx} cy={cy} r={r * 0.38}
                  fill={isFacing ? 'rgba(255,255,255,0.15)' : 'rgba(15,61,46,0.3)'}
                  stroke={isFacing ? '#0F3D2E' : '#D4AF37'} strokeWidth="1" strokeOpacity={isFacing ? "0.6" : "0.35"}
                  style={{ transition: 'all 0.4s ease' }}/>
                  
          {/* Fixed Forward Guideline (Device Top / Alignment Mark) */}
          <g className="forward-guideline">
            {/* Outer triangle pointer */}
            <path
              d={`M ${cx - 7} 2 L ${cx + 7} 2 L ${cx} 14 Z`}
              fill={isFacing ? "#F5F5DC" : "#E8CB5D"}
              stroke="#0A0A0A"
              strokeWidth="1.5"
              strokeLinejoin="round"
              style={{ transition: 'fill 0.3s ease' }}
            />
            {/* Dashed alignment line */}
            <line
              x1={cx} y1={18}
              x2={cx} y2={cy - r * 0.40}
              stroke={isFacing ? "#F5F5DC" : "#D4AF37"}
              strokeWidth={isFacing ? "2" : "1.5"}
              strokeDasharray="3 4"
              opacity={isFacing ? "0.9" : "0.4"}
              style={{ transition: 'all 0.3s ease' }}
            />
          </g>

          {/* Qibla Needle — rotates to point at Qibla */}
          <g
            className="compass-needle"
            style={{
              transform: `rotate(${displayAngle}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
              willChange: 'transform'
            }}
          >
            {/* North / Qibla tip */}
            <polygon
              points={`${cx},${cy - r * 0.52}  ${cx - 7},${cy}  ${cx + 7},${cy}`}
              fill={isFacing ? "#0F3D2E" : "url(#needleGoldGrad)"}
              style={{ transition: 'fill 0.4s ease' }}
            />
            {/* South tail */}
            <polygon
              points={`${cx},${cy + r * 0.38}  ${cx - 5},${cy}  ${cx + 5},${cy}`}
              fill={isFacing ? "rgba(15,61,46,0.4)" : "rgba(245,245,220,0.2)"}
              style={{ transition: 'fill 0.4s ease' }}
            />

            {/* Kaaba icon at tip */}
            <rect
              x={cx - 9} y={cy - r * 0.52 - 16}
              width={18} height={14}
              rx="2"
              fill={isFacing ? "#0F3D2E" : "rgba(212,175,55,0.9)"}
              stroke={isFacing ? "#F5F5DC" : "#A88B1F"} strokeWidth="1"
              style={{ transition: 'all 0.4s ease' }}
            />
            <line
              x1={cx - 9} y1={cy - r * 0.52 - 8}
              x2={cx + 9} y2={cy - r * 0.52 - 8}
              stroke={isFacing ? "#F5F5DC" : "#A88B1F"} strokeWidth="1"
              style={{ transition: 'all 0.4s ease' }}
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
                  fill={isFacing ? "#F5F5DC" : "#0F3D2E"} stroke={isFacing ? "#0F3D2E" : "#D4AF37"} strokeWidth="1.5"
                  style={{ transition: 'all 0.4s ease' }}/>
          <circle cx={cx} cy={cy} r={3.5} fill={isFacing ? "#0F3D2E" : "#D4AF37"} style={{ transition: 'fill 0.4s ease' }}/>
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
