import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, PRAYER_NAMES, formatTime, toHijri, HIJRI_MONTHS } from '../context/AppContext.jsx';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return { text: 'Peaceful night',  arabic: 'ليلة مطمئنة' };
  if (h < 12) return { text: 'Blessed morning', arabic: 'صباح مبارك' };
  if (h < 17) return { text: 'Blessed day',     arabic: 'يوم مبارك' };
  if (h < 21) return { text: 'Blessed evening', arabic: 'مساء مبارك' };
  return              { text: 'Peaceful night',  arabic: 'ليلة مطمئنة' };
}

function GregorianDate() {
  const now = new Date();
  return now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function HijriCalendar({ hijriDate }) {
  const [monthOffset, setMonthOffset] = useState(0);

  // Compute the information for the currently viewed month
  const viewedInfo = useMemo(() => {
    let gDate = new Date();
    const baseHijri = toHijri(gDate);
    const baseMIndex = HIJRI_MONTHS.indexOf(baseHijri.month);
    const targetMIndex = ((baseMIndex + monthOffset) % 12 + 12) % 12;
    const targetYear = baseHijri.year + Math.floor((baseMIndex + monthOffset) / 12);

    // Approximate the jump
    const diffDays = Math.round((targetYear - baseHijri.year) * 354.36 + (targetMIndex - baseMIndex) * 29.53);
    gDate.setDate(gDate.getDate() + diffDays);

    function getAbsoluteMonth(h) { return h.year * 12 + HIJRI_MONTHS.indexOf(h.month); }
    const targetAbs = targetYear * 12 + targetMIndex;

    // Fine-tune to exactly Day 1 of the target month
    let attempts = 0;
    while (attempts++ < 100) {
      const currAbs = getAbsoluteMonth(toHijri(gDate));
      if (currAbs < targetAbs) {
        gDate.setDate(gDate.getDate() + 1);
      } else if (currAbs > targetAbs) {
        gDate.setDate(gDate.getDate() - 1);
      } else {
        const h = toHijri(gDate);
        if (h.day > 1) {
          gDate.setDate(gDate.getDate() - (h.day - 1));
        }
        break;
      }
    }

    const firstWeekday = gDate.getDay();
    const nextMonthDate = new Date(gDate);
    nextMonthDate.setDate(nextMonthDate.getDate() + 29);
    const nextMonthHijri = toHijri(nextMonthDate);
    const daysInMonth = nextMonthHijri.day === 1 ? 29 : 30;

    return {
      month: HIJRI_MONTHS[targetMIndex],
      year: targetYear,
      daysInMonth,
      firstWeekday
    };
  }, [hijriDate, monthOffset]);

  const [selectedDay, setSelectedDay] = useState(hijriDate.day);

  useEffect(() => {
    setSelectedDay(monthOffset === 0 ? hijriDate.day : 1);
  }, [monthOffset, hijriDate.day]);

  const days = Array.from({ length: viewedInfo.daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: viewedInfo.firstWeekday }, (_, i) => i);
  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekdayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const selectedWeekday = weekdayNames[(viewedInfo.firstWeekday + selectedDay - 1) % 7];

  return (
    <div className="animate-fade-in-up delay-500" style={{ padding: '16px 20px 0' }}>
      <div style={{
        background: 'rgba(15,61,46,0.32)',
        border: '1px solid rgba(212,175,55,0.14)',
        borderRadius: 16,
        padding: '14px 16px',
        overflow: 'hidden',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 15, color: '#D4AF37', letterSpacing: '0.06em' }}>
              Hijri Calendar
            </p>
            {monthOffset !== 0 && (
              <button
                onClick={() => setMonthOffset(0)}
                style={{
                  background: 'rgba(212,175,55,0.1)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  borderRadius: 4,
                  color: '#D4AF37',
                  fontSize: 9,
                  padding: '2px 6px',
                  cursor: 'pointer',
                }}
              >
                Today
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <button
              onClick={() => setMonthOffset(prev => prev - 1)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, color: 'rgba(245,245,220,0.6)', cursor: 'pointer', padding: '2px 4px', display: 'flex' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <p style={{ fontSize: 11, color: 'rgba(245,245,220,0.38)', letterSpacing: '0.04em' }}>
              {viewedInfo.month} {viewedInfo.year} AH
            </p>
            <button
              onClick={() => setMonthOffset(prev => prev + 1)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, color: 'rgba(245,245,220,0.6)', cursor: 'pointer', padding: '2px 4px', display: 'flex' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(245,245,220,0.62)', marginTop: 8, letterSpacing: '0.03em' }}>
            {selectedWeekday}, {selectedDay} {viewedInfo.month}
          </p>
          </div>
          <div style={{
            minWidth: 48,
            minHeight: 48,
            borderRadius: 12,
            border: '1px solid rgba(212,175,55,0.35)',
            background: 'rgba(212,175,55,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D4AF37',
            fontFamily: 'Cinzel, serif',
            fontSize: 22,
          }}>
            {selectedDay}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 5,
          marginBottom: 7,
        }}>
          {weekdayShort.map(day => (
            <div
              key={day}
              style={{
                textAlign: 'center',
                color: 'rgba(212,175,55,0.58)',
                fontSize: 9,
                letterSpacing: '0.04em',
              }}
            >
              {day}
            </div>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 5,
        }}>
        {emptyDays.map(empty => <div key={`empty-${empty}`} />)}
          {days.map(day => {
            const active = day === selectedDay;
          const today = monthOffset === 0 && day === hijriDate.day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: active ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.035)',
                  border: active ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(255,255,255,0.04)',
                  color: active ? '#D4AF37' : 'rgba(245,245,220,0.42)',
                  fontSize: 10,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {day}
                {today && (
                  <span style={{
                    position: 'absolute',
                    bottom: 4,
                    width: 3,
                    height: 3,
                    borderRadius: 3,
                    background: active ? '#D4AF37' : 'rgba(212,175,55,0.55)',
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const {
    location, cityName, locationErr, locLoading, fetchLocation,
    nextPrayer, prayers, hijriDate, formatRemaining,
    notifications,
  } = useApp();
  const [temp, setTemp] = useState(null);

  const greeting = getGreeting();

  // Auto-request location on first load if not set
  useEffect(() => {
    if (!location && !locLoading) fetchLocation();
  }, []);

  // Fetch temperature when location is available
  useEffect(() => {
    if (location) {
      const controller = new AbortController();
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&current_weather=true`, { signal: controller.signal })
        .then(res => res.json())
        .then(data => {
          if (data?.current_weather?.temperature != null) {
            setTemp(`${Math.round(data.current_weather.temperature)}°C`);
          }
        })
        .catch(err => { if (err.name !== 'AbortError') console.error("Weather fetch error", err); });
      
      return () => controller.abort();
    }
  }, [location]);

  const np = nextPrayer;
  const npInfo = np ? PRAYER_NAMES[np.name] : null;

  return (
    <div style={{ padding: '0 0 8px', minHeight: '100%' }}>

      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '20px 22px 0',
      }}>
        {/* Logo + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/icons/onlylogo.png" alt="Hidaya" width={36} height={36}
               style={{ filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.4))', borderRadius: 8 }} />
          <div>
            <p style={{ fontFamily: 'Cinzel, serif', fontSize: 18, color: '#D4AF37', letterSpacing: '0.1em', lineHeight: 1 }}>
              Hidaya
            </p>
            <p style={{ fontSize: 10, color: 'rgba(245,245,220,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>
              هداية
            </p>
          </div>
        </div>

        {/* Location */}
        <button
          onClick={fetchLocation}
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'right' }}
        >
          {locLoading ? (
            <div className="spinner" style={{ width: 18, height: 18, marginLeft: 'auto' }} />
          ) : (
            <>
              <p style={{ fontSize: 12, color: '#D4AF37', letterSpacing: '0.05em' }}>
                {cityName || (locationErr ? '⚠ Location error' : 'Tap to set location')}
              </p>
              <p style={{ fontSize: 10, color: 'rgba(245,245,220,0.35)', marginTop: 1 }}>
                {temp ? temp : location ? 'Fetching temp...' : ''}
              </p>
            </>
          )}
        </button>
      </div>

      {/* ── Gold divider ── */}
      <div className="divider-gold" style={{ margin: '16px 22px 0' }} />

      {/* ── Greeting ── */}
      <div className="animate-fade-in-up" style={{ padding: '20px 22px 0' }}>
        <p style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 26,
          color: '#F5F5DC',
          letterSpacing: '0.04em',
          lineHeight: 1.2,
        }}>
          {greeting.text}
        </p>
        <p style={{
          fontSize: 15,
          color: 'rgba(245,245,220,0.4)',
          marginTop: 3,
          fontFamily: 'Georgia, serif',
          letterSpacing: '0.06em',
        }}>
          {greeting.arabic}
        </p>
      </div>

      {/* ── Date row ── */}
      <div className="animate-fade-in-up delay-100"
           style={{ padding: '10px 22px 0', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'rgba(245,245,220,0.5)', letterSpacing: '0.04em' }}>
          {GregorianDate()}
        </span>
        {hijriDate && (
          <span style={{
            fontSize: 12,
            color: '#D4AF37',
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: 20,
            padding: '1px 10px',
            letterSpacing: '0.04em',
          }}>
            {hijriDate.day} {hijriDate.month} {hijriDate.year} AH
          </span>
        )}
      </div>

      {/* ── Next Prayer Card ── */}
      <div className="animate-fade-in-up delay-300"
           style={{ padding: '22px 20px 0' }}>
        <div style={{
          background: 'rgba(15,61,46,0.45)',
          border: '1px solid rgba(212,175,55,0.22)',
          borderRadius: 20,
          padding: '24px 22px',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 0 0 1px rgba(212,175,55,0.12), 0 8px 32px rgba(0,0,0,0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="prayer-next-glow"
        >
          {/* Background arch ornament */}
          <svg width="120" height="140" viewBox="0 0 120 140"
               style={{ position: 'absolute', right: -20, top: -10, opacity: 0.06 }}
               fill="none">
            <path d="M 10 130 L 10 55 Q 10 10 60 6 Q 110 10 110 55 L 110 130 Z"
                  stroke="#D4AF37" strokeWidth="3" fill="rgba(212,175,55,0.3)"/>
          </svg>

          <p style={{ fontSize: 11, color: 'rgba(245,245,220,0.45)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
            NEXT PRAYER
          </p>

          {!location ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <p style={{ color: 'rgba(245,245,220,0.5)', fontSize: 14, marginBottom: 14 }}>
                Enable location to see prayer times
              </p>
              <button className="btn-gold" onClick={fetchLocation}>
                {locLoading ? 'Getting location…' : 'Allow Location'}
              </button>
            </div>
          ) : np ? (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <p style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: 36,
                      color: '#D4AF37',
                      lineHeight: 1,
                      letterSpacing: '0.04em',
                    }}>
                      {npInfo.label}
                    </p>
                    {!notifications[np.name] && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,220,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 4 }}>
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        <line x1="2" y1="2" x2="22" y2="22"></line>
                      </svg>
                    )}
                  </div>
                  <p style={{
                    fontSize: 17,
                    color: 'rgba(245,245,220,0.45)',
                    marginTop: 4,
                    fontFamily: 'Georgia, serif',
                    letterSpacing: '0.08em',
                  }}>
                    {npInfo.arabic}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: 28,
                    color: '#F5F5DC',
                    letterSpacing: '0.04em',
                    lineHeight: 1,
                  }}>
                    {formatTime(np.time)}
                  </p>
                  <p style={{ fontSize: 11, color: 'rgba(245,245,220,0.4)', marginTop: 4, letterSpacing: '0.08em' }}>
                    {np.remaining != null ? `in ${formatRemaining(np.remaining)}` : 'soon'}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              {prayers && (
                <div style={{ marginTop: 18, position: 'relative' }}>
                  <div style={{
                    height: 3, borderRadius: 2,
                    background: 'rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                  }}>
                    {np.remaining != null && (
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, ((1 - np.remaining / 3600000) * 100).toFixed(1))}%`,
                        background: 'linear-gradient(90deg, #A88B1F, #D4AF37, #E8CB5D)',
                        borderRadius: 2,
                        transition: 'width 1s linear',
                      }} />
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p style={{ color: 'rgba(245,245,220,0.4)', fontSize: 14 }}>
              Calculating prayer times…
            </p>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="animate-fade-in-up delay-400"
           style={{ padding: '16px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Qibla card */}
        <button
          onClick={() => navigate('/qibla')}
          style={{
            background: 'rgba(15,61,46,0.3)',
            border: '1px solid rgba(212,175,55,0.18)',
            borderRadius: 16,
            padding: '18px 16px',
            cursor: 'pointer',
            textAlign: 'left',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
               stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 10 }}>
            <circle cx="12" cy="12" r="9"/>
            <polygon points="12,4 14,11 12,10 10,11" fill="#D4AF37" stroke="none"/>
            <circle cx="12" cy="12" r="1.5" fill="#D4AF37" stroke="none"/>
          </svg>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: '#D4AF37', letterSpacing: '0.06em' }}>
            Qibla
          </p>
          <p style={{ fontSize: 11, color: 'rgba(245,245,220,0.4)', marginTop: 3, letterSpacing: '0.04em' }}>
            Find direction
          </p>
        </button>

        {/* Prayer times card */}
        <button
          onClick={() => navigate('/prayers')}
          style={{
            background: 'rgba(15,61,46,0.3)',
            border: '1px solid rgba(212,175,55,0.18)',
            borderRadius: 16,
            padding: '18px 16px',
            cursor: 'pointer',
            textAlign: 'left',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
               stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 10 }}>
            <path d="M4 20h16"/>
            <path d="M6 20V10a6 6 0 0 1 12 0v10"/>
            <path d="M9 20v-6a3 3 0 0 1 6 0v6"/>
            <path d="M12 4V2"/>
            <path d="M10.5 2h3"/>
          </svg>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: '#D4AF37', letterSpacing: '0.06em' }}>
            Prayers
          </p>
          <p style={{ fontSize: 11, color: 'rgba(245,245,220,0.4)', marginTop: 3, letterSpacing: '0.04em' }}>
            Today's times
          </p>
        </button>
      </div>

      {/* ── Hijri Calendar ── */}
      {hijriDate && <HijriCalendar hijriDate={hijriDate} />}

      <div className="animate-fade-in-up delay-500"
           style={{ padding: '16px 20px 0' }}>
        <div style={{
          background: 'rgba(212,175,55,0.04)',
          border: '1px solid rgba(212,175,55,0.12)',
          borderRadius: 14,
          padding: '16px 18px',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: 18,
            color: 'rgba(212,175,55,0.8)',
            letterSpacing: '0.06em',
            lineHeight: 1.8,
          }}>
            ٱلسَّلَامُ عَلَيْكُم
          </p>
          <div className="divider-gold" style={{ margin: '10px 24px' }} />
          <p style={{ fontSize: 11, color: 'rgba(245,245,220,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            "And He is with you wherever you are" — Quran 57:4
          </p>
        </div>
      </div>

    </div>
  );
}
