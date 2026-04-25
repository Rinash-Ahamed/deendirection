import { useEffect, useState } from 'react';
import { useApp, PRAYER_NAMES, formatTime } from '../context/AppContext.jsx';

const PRAYER_ORDER = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const PRAYER_QUOTES = {
  fajr: { text: "Indeed, the recitation of dawn is ever witnessed.", ref: "Quran 17:78" },
  dhuhr: { text: "And glorify the praises of your Lord... and at the time of noon.", ref: "Quran 30:18" },
  asr: { text: "Maintain with care the [obligatory] prayers and [in particular] the middle prayer.", ref: "Quran 2:238" },
  maghrib: { text: "And establish prayer at the two ends of the day and at the approach of the night.", ref: "Quran 11:114" },
  isha: { text: "Establish prayer at the decline of the sun until the darkness of the night.", ref: "Quran 17:78" },
};

/* Thin SVG icons per prayer */
function PrayerIcon({ name, active }) {
  const stroke = active ? '#D4AF37' : 'rgba(245,245,220,0.4)';
  const icons = {
    fajr: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>
        <path d="M19 3v4M21 5h-4" strokeOpacity="0.6"/>
      </svg>
    ),
    sunrise: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 2v2M4.22 6.22l1.42 1.42M20.78 6.22l-1.42 1.42"/>
        <path d="M7 13a5 5 0 0 1 10 0"/>
        <path d="M3 13h2M19 13h2"/>
        <path d="M3 17h18"/>
      </svg>
    ),
    dhuhr: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    ),
    asr: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" strokeOpacity="0.7"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
        <path d="M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42"/>
      </svg>
    ),
    maghrib: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round">
        <path d="M17 12a5 5 0 0 1-10 0"/>
        <path d="M3 12h2M19 12h2"/>
        <path d="M12 2v2"/>
        <path d="M3 17h18"/>
        <path d="M4.22 7.22l1.42 1.42M18.36 7.22l-1.42 1.42"/>
      </svg>
    ),
    isha: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>
        <circle cx="18" cy="5" r="1.5" fill={stroke} stroke="none"/>
        <circle cx="21" cy="9" r="1" fill={stroke} stroke="none" opacity="0.6"/>
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function PrayerTimes() {
  const [expandedPrayer, setExpandedPrayer] = useState(null);
  const {
    location, prayers, nextPrayer, locLoading, fetchLocation,
    hijriDate, formatRemaining, notifications,
  } = useApp();

  useEffect(() => {
    if (!location && !locLoading) fetchLocation();
  }, []);

  return (
    <div style={{ padding: '0 0 8px', minHeight: '100%' }}>

      {/* ── Header ── */}
      <div style={{ padding: '16px 22px 0' }}>
        <p style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 11,
          color: '#D4AF37',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}>
          أوقات الصلاة
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <h1 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 26,
            color: '#F5F5DC',
            letterSpacing: '0.04em',
            lineHeight: 1.2,
          }}>
            Prayer Times
          </h1>
        </div>

        {hijriDate && (
          <p style={{
            fontSize: 12,
            color: '#D4AF37',
            marginTop: 6,
            letterSpacing: '0.05em',
            opacity: 0.8,
          }}>
            {hijriDate.day} {hijriDate.month} {hijriDate.year} AH
          </p>
        )}
      </div>

      <div className="divider-gold" style={{ margin: '16px 22px 0' }} />

      {/* ── No location ── */}
      {!location && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 16, padding: '32px 32px',
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
               stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" style={{ opacity: 0.45 }}>
            <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          <p style={{ color: 'rgba(245,245,220,0.5)', fontSize: 14, textAlign: 'center', lineHeight: 1.6 }}>
            Allow location access to calculate accurate prayer times for your area
          </p>
          <button className="btn-gold" onClick={fetchLocation}>
            {locLoading ? 'Getting location…' : 'Allow Location'}
          </button>
        </div>
      )}

      {/* ── Prayer list ── */}
      {location && (
        <div style={{ padding: '12px 20px 0' }}>

          {/* Next prayer countdown banner */}
          {nextPrayer && (
            <div style={{
              background: 'rgba(212,175,55,0.08)',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: 12,
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}>
              <p style={{ fontSize: 12, color: 'rgba(245,245,220,0.5)', letterSpacing: '0.08em' }}>
                Next • {PRAYER_NAMES[nextPrayer.name]?.label}
              </p>
              <p style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 15,
                color: '#D4AF37',
                letterSpacing: '0.05em',
              }}>
                in {nextPrayer.remaining != null ? formatRemaining(nextPrayer.remaining) : '--'}
              </p>
            </div>
          )}

          {/* Prayer rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {PRAYER_ORDER.map((key, i) => {
              const info = PRAYER_NAMES[key];
              const time = prayers?.[key];
              const isNext = nextPrayer?.name === key;
              const isPast = time && time < new Date();

              return (
                <div
                  key={key}
                  className={`animate-fade-in-up delay-${(i + 1) * 100 > 500 ? 500 : (i + 1) * 100}`}
                  onClick={() => setExpandedPrayer(prev => prev === key ? null : key)}
                  style={{
                    borderRadius: 14,
                    background: isNext
                      ? 'rgba(15,61,46,0.55)'
                      : 'rgba(15,61,46,0.2)',
                    border: isNext
                      ? '1px solid rgba(212,175,55,0.35)'
                      : '1px solid rgba(212,175,55,0.06)',
                    marginBottom: 6,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    ...(isNext ? {
                      boxShadow: '0 0 0 1px rgba(212,175,55,0.2), 0 4px 20px rgba(212,175,55,0.1)',
                    } : {}),
                    opacity: isPast && !isNext ? 0.6 : 1,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 16px',
                  }}>
                    {/* Icon */}
                    <div style={{
                      width: 40, height: 40,
                      borderRadius: 12,
                      background: isNext ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isNext ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <PrayerIcon name={key} active={isNext} />
                    </div>

                    {/* Name */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <p style={{
                          fontFamily: 'Cinzel, serif',
                          fontSize: isNext ? 17 : 15,
                          color: isNext ? '#D4AF37' : '#F5F5DC',
                          letterSpacing: '0.04em',
                          lineHeight: 1.2,
                        }}>
                          {info.label}
                        </p>
                        {!notifications[key] && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,220,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            <line x1="2" y1="2" x2="22" y2="22"></line>
                          </svg>
                        )}
                      </div>
                      <p style={{
                        fontSize: 12,
                        color: 'rgba(245,245,220,0.35)',
                        marginTop: 2,
                        fontFamily: 'Georgia, serif',
                        letterSpacing: '0.08em',
                      }}>
                        {info.arabic}
                      </p>
                    </div>

                    {/* Time */}
                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        fontFamily: 'Cinzel, serif',
                        fontSize: isNext ? 18 : 16,
                        color: isNext ? '#D4AF37' : '#F5F5DC',
                        letterSpacing: '0.04em',
                      }}>
                        {time ? formatTime(time) : '--:--'}
                      </p>
                      {isNext && (
                        <span style={{
                          display: 'inline-block',
                          marginTop: 4,
                          fontSize: 10,
                          color: '#D4AF37',
                          background: 'rgba(212,175,55,0.15)',
                          border: '1px solid rgba(212,175,55,0.3)',
                          borderRadius: 20,
                          padding: '1px 8px',
                          letterSpacing: '0.1em',
                        }}>
                          NEXT
                        </span>
                      )}
                      {isPast && !isNext && (
                        <p style={{ fontSize: 10, color: 'rgba(245,245,220,0.25)', marginTop: 3, letterSpacing: '0.06em' }}>
                          passed
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expanded Quote content */}
                  {expandedPrayer === key && (
                    <div className="animate-fade-in" style={{ padding: '0 16px 16px 70px' }}>
                      <div style={{
                        borderTop: '1px solid rgba(212,175,55,0.1)',
                        paddingTop: 12,
                        marginTop: -4,
                      }}>
                        <p style={{ 
                          fontSize: 12, 
                          color: 'rgba(245,245,220,0.65)', 
                          fontStyle: 'italic', 
                          lineHeight: 1.6, 
                          letterSpacing: '0.02em' 
                        }}>
                          "{PRAYER_QUOTES[key].text}"
                        </p>
                        <p style={{ 
                          fontSize: 10, 
                          color: '#D4AF37', 
                          marginTop: 6, 
                          letterSpacing: '0.05em' 
                        }}>
                          — {PRAYER_QUOTES[key].ref}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Ayah */}
          <div style={{
            marginTop: 20,
            padding: '16px 18px',
            background: 'rgba(212,175,55,0.03)',
            border: '1px solid rgba(212,175,55,0.1)',
            borderRadius: 12,
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: 'Georgia, serif',
              fontSize: 15,
              color: 'rgba(212,175,55,0.7)',
              letterSpacing: '0.06em',
              lineHeight: 1.8,
            }}>
              إِنَّ ٱلصَّلَوٰةَ كَانَتْ عَلَى ٱلْمُؤْمِنِينَ كِتَٰبًا مَّوْقُوتًا
            </p>
            <div className="divider-gold" style={{ margin: '10px 24px' }} />
            <p style={{ fontSize: 11, color: 'rgba(245,245,220,0.3)', lineHeight: 1.5, letterSpacing: '0.04em' }}>
              "Indeed, prayer has been decreed upon the believers a decree of specified times" — Quran 4:103
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
