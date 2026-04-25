import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import QiblaCompass from '../components/QiblaCompass.jsx';
import MihrabArch from '../components/MihrabArch.jsx';

export default function Qibla() {
  const { location, qiblaAngle, locLoading, fetchLocation, locationErr } = useApp();
  const [isCompassActive, setIsCompassActive] = useState(false);
  const [isFacingQibla, setIsFacingQibla] = useState(false);

  useEffect(() => {
    if (!location && !locLoading) fetchLocation();
  }, []);

  const handleShowDirection = () => {
    // iOS 13+ requires explicit permission for DeviceOrientation
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            setIsCompassActive(true);
          } else {
            alert('Compass permission denied. Please enable device orientation in your browser settings.');
          }
        })
        .catch(console.error);
    } else {
      // Non-iOS 13+ devices don't need explicit permission prompt
      setIsCompassActive(true);
    }
  };

  return (
    <div style={{ padding: '0 0 8px', minHeight: '100%' }}>

      {/* ── Header ── */}
      <div style={{ padding: '20px 22px 0', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 11,
          color: '#D4AF37',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}>
          القبلة
        </p>
        <h1 style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 28,
          color: '#F5F5DC',
          letterSpacing: '0.06em',
          lineHeight: 1.2,
        }}>
          Qibla Direction
        </h1>
      </div>

      <div className="divider-gold" style={{ margin: '16px 22px 8px' }} />

      {/* ── No location state ── */}
      {!location && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 16, padding: '40px 32px',
        }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none"
               stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"
               style={{ opacity: 0.5 }}>
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>
            <circle cx="12" cy="12" r="3" fill="rgba(212,175,55,0.2)"/>
          </svg>
          <p style={{ color: 'rgba(245,245,220,0.5)', fontSize: 15, textAlign: 'center', lineHeight: 1.6 }}>
            {locationErr || 'Allow location access to find your Qibla direction'}
          </p>
          <button className="btn-gold" onClick={fetchLocation}>
            {locLoading ? 'Getting location…' : 'Allow Location'}
          </button>
        </div>
      )}

      {/* ── Compass ── */}
      {location && (
        <div className="animate-fade-in"
             style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 20px 0' }}>

          {/* Arch frame around compass */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <MihrabArch size={300} glow={isFacingQibla}>
              <QiblaCompass qiblaAngle={qiblaAngle} size={220} isActive={isCompassActive} onFacingQibla={setIsFacingQibla} />
            </MihrabArch>
          </div>

          {/* Direction label */}
          <div style={{
            background: 'rgba(15,61,46,0.45)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: 50,
            padding: '10px 28px',
            textAlign: 'center',
            marginTop: -8,
          }}>
            <p style={{
              fontFamily: 'Cinzel, serif',
              fontSize: 14,
              color: '#D4AF37',
              letterSpacing: '0.1em',
            }}>
              Face this direction for Qibla
            </p>
          </div>

          {/* Show direction button */}
          {!isCompassActive && (
            <div style={{ marginTop: 20, width: '100%', maxWidth: 360 }}>
              <button
                className="btn-gold"
                onClick={handleShowDirection}
                style={{ width: '100%', padding: '14px', fontSize: 15 }}
              >
                Show Direction
              </button>
            </div>
          )}

          {/* Spiritual note */}
          <div style={{
            marginTop: 20,
            padding: '14px 20px',
            background: 'rgba(212,175,55,0.04)',
            border: '1px solid rgba(212,175,55,0.1)',
            borderRadius: 12,
            width: '100%', maxWidth: 360,
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 12, color: 'rgba(245,245,220,0.35)', letterSpacing: '0.04em', lineHeight: 1.6 }}>
              "Turn your face toward al-Masjid al-Haram"
            </p>
            <p style={{ fontSize: 11, color: 'rgba(212,175,55,0.5)', marginTop: 4, letterSpacing: '0.08em' }}>
              — Quran 2:144
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
