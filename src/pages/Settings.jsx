import { useEffect, useState, useRef } from 'react';
import {
  useApp,
  PRAYER_NAMES,
  PRAYER_KEYS,
  MIN_REMINDER_MINUTES,
  MAX_REMINDER_MINUTES,
  formatTimeInput,
} from '../context/AppContext.jsx';

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{
        fontSize: 11,
        color: '#D4AF37',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        marginBottom: 10,
        paddingLeft: 4,
      }}>
        {title}
      </p>
      <div style={{
        background: 'rgba(15,61,46,0.3)',
        border: '1px solid rgba(212,175,55,0.12)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, sub, children, last }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      borderBottom: last ? 'none' : '1px solid rgba(212,175,55,0.06)',
      gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, color: '#F5F5DC', letterSpacing: '0.02em' }}>{label}</p>
        {sub && (
          <p style={{
            fontSize: 11,
            color: 'rgba(245,245,220,0.4)',
            marginTop: 2,
            letterSpacing: '0.04em',
          }}>
            {sub}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function parseTimeParts(value) {
  if (!value) return { hour: '12', minute: '00', period: 'AM' };

  const [rawHour, rawMinute] = value.split(':').map(Number);
  const period = rawHour >= 12 ? 'PM' : 'AM';
  const hour12 = rawHour % 12 || 12;

  return {
    hour: String(hour12).padStart(2, '0'),
    minute: String(Number.isFinite(rawMinute) ? rawMinute : 0).padStart(2, '0'),
    period,
  };
}

function toTimeValue(hour, minute, period) {
  const hourNumber = Number(hour);
  const minuteNumber = Number(minute);
  const hour24 = period === 'PM'
    ? (hourNumber % 12) + 12
    : hourNumber % 12;

  return `${String(hour24).padStart(2, '0')}:${String(minuteNumber).padStart(2, '0')}`;
}

function PrayerTimePicker({ value, onChange }) {
  const { hour, minute, period } = parseTimeParts(value);
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const update = (next) => {
    onChange(toTimeValue(
      next.hour || hour,
      next.minute || minute,
      next.period || period
    ));
  };

  return (
    <div className="time-picker-modern" aria-label="Prayer time">
      <select value={hour} onChange={e => update({ hour: e.target.value })} aria-label="Hour">
        {hours.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
      <span>:</span>
      <select value={minute} onChange={e => update({ minute: e.target.value })} aria-label="Minute">
        {minutes.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
      <select value={period} onChange={e => update({ period: e.target.value })} aria-label="AM or PM">
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

export default function Settings() {
  const [editingPrayer, setEditingPrayer] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [appInstalled, setAppInstalled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const fallbackTimeoutRef = useRef(null);
  const fallbackCtxRef = useRef(null);
  const {
    location, cityName, locationErr, locLoading, fetchLocation,
    prayers,
    reminderMinutes, setReminderMinutes,
    manualPrayerTimes, setManualPrayerTime,
    notificationSound, setNotificationSound,
    notificationSoundName, setNotificationSoundName,
    notifications, setNotifs,
  } = useApp();

  useEffect(() => {
    const isStandalone = window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone;
    setAppInstalled(!!isStandalone);

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleAppInstalled = () => {
      setAppInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleStopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (fallbackCtxRef.current && fallbackCtxRef.current.state !== 'closed') {
      fallbackCtxRef.current.close().catch(e => console.warn(e));
      fallbackCtxRef.current = null;
    }
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    setIsPlaying(false);
  };

  // Stop audio playback if the user navigates away from settings
  useEffect(() => {
    return handleStopSound;
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const result = await installPrompt.userChoice;

    if (result.outcome === 'accepted') {
      setAppInstalled(true);
    }
    setInstallPrompt(null);
  };

  const handleClearSound = () => {
    handleStopSound();
    setNotificationSound(null);
    setNotificationSoundName('');
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      handleStopSound();
      return;
    }

    setIsPlaying(true);

    if (notificationSound) {
      audioRef.current = new Audio(notificationSound);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play().catch(e => {
        console.warn('Audio playback failed:', e);
        setIsPlaying(false);
      });
    } else {
      // Fallback: 5-second beep-beep sequence via Web Audio API
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        fallbackCtxRef.current = audioCtx;
        const now = audioCtx.currentTime;
        for (let i = 0; i < 5; i++) {
          const playBeep = (offset) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.value = 880; // A5 note
            gain.gain.setValueAtTime(0, now + offset);
            gain.gain.linearRampToValueAtTime(0.5, now + offset + 0.05);
            gain.gain.setValueAtTime(0.5, now + offset + 0.1);
            gain.gain.linearRampToValueAtTime(0, now + offset + 0.15);
            osc.start(now + offset);
            osc.stop(now + offset + 0.15);
          };
          playBeep(i);         // First beep
          playBeep(i + 0.2);   // Second beep
        }
        
        fallbackTimeoutRef.current = setTimeout(() => {
          handleStopSound();
        }, 6000);
      } catch (e) {
        console.warn('Web Audio API not supported:', e);
        setIsPlaying(false);
      }
    }
  };

  return (
    <div style={{ padding: '0 0 8px', minHeight: '100%' }}>
      <div style={{ padding: '20px 22px 20px' }}>
        <p style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 11,
          color: '#D4AF37',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}>
          الإعدادات
        </p>
        <h1 style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 26,
          color: '#F5F5DC',
          letterSpacing: '0.04em',
          lineHeight: 1.2,
        }}>
          Settings
        </h1>
      </div>

      <div className="divider-gold" style={{ margin: '0 22px 24px' }} />

      <div style={{ padding: '0 20px' }}>
        <Section title="Location">
          <Row
            label="Current Location"
            sub={location ? cityName || 'Your Location' : locationErr || 'Not set'}
            last
          >
            <button
              onClick={fetchLocation}
              style={{
                background: 'rgba(212,175,55,0.12)',
                border: '1px solid rgba(212,175,55,0.25)',
                borderRadius: 8,
                color: '#D4AF37',
                fontSize: 12,
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.06em',
                padding: '6px 14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {locLoading ? '...' : cityName ? 'Refresh' : 'Detect'}
            </button>
          </Row>
        </Section>

        <Section title="Prayer Reminder">
          <div style={{ padding: '16px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              alignItems: 'center',
              marginBottom: 14,
            }}>
              <div>
                <p style={{ fontSize: 14, color: '#F5F5DC', letterSpacing: '0.02em' }}>Reminder Time</p>
                <p style={{
                  fontSize: 11,
                  color: 'rgba(245,245,220,0.4)',
                  marginTop: 2,
                  letterSpacing: '0.04em',
                }}>
                  Applies to all prayers
                </p>
              </div>
              <span style={{
                minWidth: 58,
                textAlign: 'center',
                borderRadius: 8,
                border: '1px solid rgba(212,175,55,0.35)',
                background: 'rgba(212,175,55,0.12)',
                color: '#D4AF37',
                fontSize: 13,
                padding: '6px 10px',
                letterSpacing: '0.04em',
              }}>
                {reminderMinutes}m
              </span>
            </div>
            <input
              type="range"
              min={MIN_REMINDER_MINUTES}
              max={MAX_REMINDER_MINUTES}
              step="1"
              value={reminderMinutes}
              onChange={e => setReminderMinutes(e.target.value)}
              style={{
                width: '100%',
                accentColor: '#D4AF37',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 10, color: 'rgba(245,245,220,0.35)' }}>{MIN_REMINDER_MINUTES} min</span>
              <span style={{ fontSize: 10, color: 'rgba(245,245,220,0.35)' }}>{MAX_REMINDER_MINUTES} min</span>
            </div>
          </div>
        </Section>

        <Section title="Notification Sound">
          <Row label="Custom Sound" sub={notificationSoundName || "Choose an audio file from your device"} last={false}>
            <label
              style={{
                background: 'rgba(212,175,55,0.12)',
                border: '1px solid rgba(212,175,55,0.25)',
                borderRadius: 8,
                color: '#D4AF37',
                fontSize: 12,
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.06em',
                padding: '6px 14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {notificationSound ? 'Change' : 'Select'}
              <input
                type="file"
                accept="audio/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      alert('Audio file is too large. Please select a file under 2MB.');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setNotificationSound(event.target.result);
                      setNotificationSoundName(file.name);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </Row>
          <Row label="Test Sound" sub={notificationSound ? "Custom audio selected" : "Using fallback beeps"} last>
            <div style={{ display: 'flex', gap: 8 }}>
              {notificationSound && (
                <button
                  onClick={handleClearSound}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(245,245,220,0.15)',
                    borderRadius: 8,
                    color: 'rgba(245,245,220,0.6)',
                    fontSize: 12,
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.06em',
                    padding: '6px 14px',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              )}
                <button
                  onClick={handleTogglePlay}
                  style={{
                    background: 'rgba(212,175,55,0.12)',
                    border: '1px solid rgba(212,175,55,0.25)',
                    borderRadius: 8,
                    color: '#D4AF37',
                    fontSize: 12,
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '0.06em',
                    padding: '6px 14px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isPlaying ? 'Stop' : 'Play'}
                </button>
              </div>
            </Row>
        </Section>

        <Section title="Prayer Times">
          {PRAYER_KEYS.map((key, i) => {
            const info = PRAYER_NAMES[key];
            const isManual = !!manualPrayerTimes[key];

            return (
              <Row
                key={key}
                label={info.label}
                sub={isManual ? 'Custom time' : 'Calculated time'}
                last={i === PRAYER_KEYS.length - 1}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    type="button"
                    onClick={() => setNotifs(prev => ({ ...prev, [key]: !prev[key] }))}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      outline: 'none',
                    }}
                    aria-label={`Toggle notifications for ${info.label}`}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={notifications[key] ? "#D4AF37" : "rgba(245,245,220,0.25)"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.2s ease' }}>
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      {!notifications[key] && <line x1="2" y1="2" x2="22" y2="22"></line>}
                    </svg>
                  </button>
                  <div
                    onMouseDown={() => setEditingPrayer(key)}
                    onTouchStart={() => setEditingPrayer(key)}
                    onFocus={() => setEditingPrayer(key)}
                    onBlur={(e) => {
                      const container = e.currentTarget;
                      window.setTimeout(() => {
                        if (!container.contains(document.activeElement)) {
                          setEditingPrayer(current => current === key ? null : current);
                        }
                      }, 0);
                    }}
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <PrayerTimePicker
                      value={manualPrayerTimes[key] || formatTimeInput(prayers?.[key])}
                      onChange={value => setManualPrayerTime(key, value)}
                    />
                    {editingPrayer === key && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {isManual && (
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setManualPrayerTime(key, '');
                            }}
                            style={{
                              minHeight: 34,
                              borderRadius: 8,
                              border: '1px solid rgba(245,245,220,0.08)',
                              background: 'rgba(255,255,255,0.04)',
                              color: 'rgba(245,245,220,0.52)',
                              fontSize: 11,
                              padding: '6px 8px',
                              cursor: 'pointer',
                            }}
                          >
                            Reset
                          </button>
                        )}
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setEditingPrayer(null);
                          }}
                          style={{
                            minHeight: 34,
                            borderRadius: 8,
                            border: '1px solid rgba(212,175,55,0.35)',
                            background: 'rgba(212,175,55,0.12)',
                            color: '#D4AF37',
                            fontSize: 11,
                            padding: '6px 12px',
                            cursor: 'pointer',
                          }}
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Row>
            );
          })}
        </Section>

        <div style={{
          background: 'rgba(212,175,55,0.04)',
          border: '1px solid rgba(212,175,55,0.1)',
          borderRadius: 12,
          padding: '12px 16px',
          marginBottom: 24,
        }}>
          <p style={{ fontSize: 12, color: 'rgba(245,245,220,0.35)', lineHeight: 1.7, letterSpacing: '0.03em' }}>
            Reminders use the same lead time for every prayer. Custom prayer times will be used for both the prayer page and reminders.
          </p>
        </div>

        <Section title="About">
          <Row label="App Name" last={false}>
            <span style={{ fontSize: 13, color: 'rgba(245,245,220,0.5)', fontFamily: 'Cinzel, serif' }}>Hidaya</span>
          </Row>
          <Row label="Version" last={false}>
            <span style={{ fontSize: 13, color: 'rgba(245,245,220,0.4)' }}>1.0.0</span>
          </Row>
          <Row label="Tagline" last={false}>
            <span style={{ fontSize: 12, color: '#D4AF37', opacity: 0.7, textAlign: 'right', maxWidth: 160 }}>
              "Find Direction. Find Peace."
            </span>
          </Row>
          <Row label="Developer" last>
            <span style={{ fontSize: 13, color: 'rgba(245,245,220,0.4)' }}>Rinash Ahamed</span>
          </Row>
        </Section>

        {!appInstalled && installPrompt && (
          <button
            type="button"
            onClick={handleInstallApp}
            style={{
              width: '100%',
              minHeight: 44,
              marginBottom: 18,
              borderRadius: 10,
              border: '1px solid rgba(212,175,55,0.35)',
              background: 'rgba(212,175,55,0.14)',
              color: '#D4AF37',
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Install App
          </button>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 0 20px',
          textAlign: 'center',
          width: '100%',
        }}>
          <img
          src="/icons/logo.svg"
            alt="Hidaya"
            width={48}
            height={48}
            style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.35))', marginBottom: 8 }}
          />
          <p style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 16,
            color: 'rgba(212,175,55,0.6)',
            letterSpacing: '0.2em',
          }}>
            هداية
          </p>
          <p style={{
            fontSize: 11,
            color: 'rgba(245,245,220,0.2)',
            marginTop: 4,
            letterSpacing: '0.08em',
          }}>
            Guidance to Your Qibla
          </p>
        </div>
      </div>
    </div>
  );
}
