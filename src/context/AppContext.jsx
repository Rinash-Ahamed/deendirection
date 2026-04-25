import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Coordinates,
  PrayerTimes,
  CalculationMethod,
  Qibla,
} from 'adhan';

/* ─────────────────────────────────────────
   Prayer names map
   ───────────────────────────────────────── */
export const PRAYER_NAMES = {
  fajr:    { label: 'Fajr',    arabic: 'الفجر',   icon: '🌙' },
  dhuhr:   { label: 'Dhuhr',   arabic: 'الظهر',   icon: '☀️' },
  asr:     { label: 'Asr',     arabic: 'العصر',   icon: '🌤' },
  maghrib: { label: 'Maghrib', arabic: 'المغرب',  icon: '🌇' },
  isha:    { label: 'Isha',    arabic: 'العشاء',  icon: '🌃' },
};

export const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
export const MIN_REMINDER_MINUTES = 5;
export const MAX_REMINDER_MINUTES = 20;

export const CALCULATION_METHODS = [
  { key: 'MuslimWorldLeague',    label: 'Muslim World League' },
  { key: 'Egyptian',             label: 'Egyptian' },
  { key: 'Karachi',              label: 'University of Islamic Sciences, Karachi' },
  { key: 'UmmAlQura',            label: 'Umm al-Qura (Makkah)' },
  { key: 'Dubai',                label: 'Dubai' },
  { key: 'Qatar',                label: 'Qatar' },
  { key: 'Kuwait',               label: 'Kuwait' },
  { key: 'MoonsightingCommittee',label: 'Moonsighting Committee' },
  { key: 'Singapore',            label: 'Singapore' },
  { key: 'Turkey',               label: 'Turkey' },
  { key: 'Tehran',               label: 'Institute of Geophysics, Tehran' },
];

/* ─────────────────────────────────────────
   Hijri date conversion
   ───────────────────────────────────────── */
export const HIJRI_MONTHS = [
  'Muharram','Safar','Rabi al-Awwal','Rabi al-Thani',
  'Jumada al-Awwal','Jumada al-Thani','Rajab','Sha\'ban',
  'Ramadan','Shawwal','Dhu al-Qi\'dah','Dhu al-Hijjah'
];

export function toHijri(date) {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();

  let jd = Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4)
    + Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12)
    - Math.floor((3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4)
    + d - 32075;

  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j = Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719)
    + Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l = l - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
    - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hm = Math.floor((24 * l) / 709);
  const hd = l - Math.floor((709 * hm) / 24);
  const hy = 30 * n + j - 30;

  return { day: hd, month: HIJRI_MONTHS[hm - 1], year: hy };
}

/* ─────────────────────────────────────────
   Format time 12h
   ───────────────────────────────────────── */
export function formatTime(date) {
  if (!date || !(date instanceof Date) || isNaN(date)) return '--:--';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/* ─────────────────────────────────────────
   Format time input (24h)
   ───────────────────────────────────────── */
export function formatTimeInput(date) {
  if (!date || !(date instanceof Date) || isNaN(date)) return '';
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/* ─────────────────────────────────────────
   useStickyState Hook
   ───────────────────────────────────────── */
function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (e) {
      console.warn(`Error reading ${key} from localStorage`, e);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      if (value === null || value === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn(`Error saving ${key} to localStorage (file might be too large)`, e);
    }
  }, [key, value]);

  return [value, setValue];
}

/* ─────────────────────────────────────────
   Context
   ───────────────────────────────────────── */
const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [location, setLocation]     = useStickyState(null, 'hidaya_location');   // { lat, lng }
  const [cityName, setCityName]     = useStickyState('', 'hidaya_cityName');
  const [locationErr, setLocErr]    = useState(null);
  const [locLoading, setLocLoading] = useState(false);

  const [method, setMethod] = useStickyState('MuslimWorldLeague', 'hidaya_method');

  const [prayers, setPrayers]     = useState(null);  // { fajr, sunrise, dhuhr, asr, maghrib, isha }
  const [nextPrayer, setNext]     = useState(null);  // { name, time, remaining }
  const [qiblaAngle, setQibla]    = useState(null);
  const [hijriDate, setHijri]     = useState(null);

  const [notifications, setNotifs] = useStickyState({
    fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true,
  }, 'hidaya_notifications');
  const [notificationSound, setNotificationSound] = useStickyState(null, 'hidaya_notificationSound');

  const [reminderMinutes, setReminderMinutes] = useStickyState(15, 'hidaya_reminderMinutes');
  const [manualPrayerTimes, setManualPrayerTimes] = useStickyState({}, 'hidaya_manualPrayerTimes');
  const setManualPrayerTime = useCallback((key, value) => {
    setManualPrayerTimes(prev => ({ ...prev, [key]: value }));
  }, []);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  /* ── Network Status ── */
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /* ── Compute prayer times whenever location / method changes ── */
  useEffect(() => {
    if (!location) return;

    const { lat, lng } = location;
    const coords = new Coordinates(lat, lng);
    const params  = CalculationMethod[method]();
    const date    = new Date();

    const pt = new PrayerTimes(coords, date, params);

    const prayerMap = {
      fajr:    pt.fajr,
      sunrise: pt.sunrise,
      dhuhr:   pt.dhuhr,
      asr:     pt.asr,
      maghrib: pt.maghrib,
      isha:    pt.isha,
    };

    // Override calculated times with manual settings if they exist
    PRAYER_KEYS.forEach(key => {
      if (manualPrayerTimes[key]) {
        const [h, m] = manualPrayerTimes[key].split(':').map(Number);
        const overrideDate = new Date(date);
        overrideDate.setHours(h, m, 0, 0);
        prayerMap[key] = overrideDate;
      }
    });

    setPrayers(prayerMap);

    // Qibla
    const qAngle = Qibla(coords);
    setQibla(qAngle);

    // Next prayer
    const now = Date.now();
    let found = PRAYER_KEYS.find(p => prayerMap[p] > now);
    let nextTime;

    if (found) {
      nextTime = prayerMap[found];
    } else {
      found = 'fajr'; // wrap to next day fajr
      nextTime = new Date(prayerMap.fajr);
      nextTime.setDate(nextTime.getDate() + 1);
    }
    
    const remaining = nextTime - now;
    setNext({ name: found, time: nextTime, remaining });

    // Hijri
    setHijri(toHijri(date));
  }, [location, method, manualPrayerTimes, updateTrigger]);

  /* ── Tick remaining countdown every second ── */
  useEffect(() => {
    if (!nextPrayer) return;
    const id = setInterval(() => {
      setNext(prev => {
        if (!prev) return prev;
        const diff = prev.time - Date.now();
        // Rollover to the next prayer slightly after reaching 0 to allow the notification to fire
        if (diff < 0 && prev.remaining > 0) {
          setTimeout(() => setUpdateTrigger(t => t + 1), 2000);
        }
        return { ...prev, remaining: Math.max(0, diff) };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [nextPrayer?.name]);

  /* ── Fire Notification when remaining hits 0 ── */
  const prevRemainingRef = useRef(null);
  const reminderFiredRef = useRef(null);

  const triggerAlert = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icons/logo.png' });
    }

    if (notificationSound) {
      const audio = new Audio(notificationSound);
      audio.play().catch(e => console.warn('Audio playback blocked:', e));
    } else {
      // Fallback: 5-second beep-beep sequence via Web Audio API
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
        
        // Close the context to prevent browser memory leaks
        setTimeout(() => {
          if (audioCtx.state !== 'closed') audioCtx.close().catch(e => console.warn(e));
        }, 6000);
      } catch (e) {
        console.warn('Web Audio API not supported:', e);
      }
    }
  }, [notificationSound]);

  useEffect(() => {
    // Ask for native notification permission on load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (!nextPrayer) return;

    const reminderMs = reminderMinutes * 60 * 1000;
    const isExactTime = prevRemainingRef.current !== null && prevRemainingRef.current > 0 && nextPrayer.remaining === 0;
    const isReminderTime = prevRemainingRef.current !== null && prevRemainingRef.current > reminderMs && nextPrayer.remaining <= reminderMs;

    // 1. Trigger Exact Time Alert
    if (isExactTime && notifications[nextPrayer.name]) {
      const title = `Time for ${PRAYER_NAMES[nextPrayer.name]?.label || nextPrayer.name}`;
      triggerAlert(title, 'May your prayer be accepted.');
    }

    // 2. Trigger Early Reminder Alert
    if (isReminderTime && reminderFiredRef.current !== nextPrayer.name) {
      if (notifications[nextPrayer.name]) {
        const title = `Reminder: ${PRAYER_NAMES[nextPrayer.name]?.label || nextPrayer.name} is in ${reminderMinutes} minutes`;
        triggerAlert(title, 'Prepare for prayer.');
      }
      reminderFiredRef.current = nextPrayer.name;
    }

    prevRemainingRef.current = nextPrayer.remaining;
  }, [nextPrayer, notifications, reminderMinutes, triggerAlert]);

  /* ── Request geolocation ── */
  const fetchLocation = useCallback(() => {
    setLocLoading(true);
    setLocErr(null);

    if (!navigator.geolocation) {
      setLocErr('Geolocation is not supported by your browser.');
      setLocLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
        setLocLoading(false);

        // Reverse geocode city name
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en-US,en;q=0.9' } }
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            'Your Location';
          setCityName(city);
        } catch {
          setCityName('Your Location');
        }
      },
      (err) => {
        const messages = {
          1: 'Location permission denied. Please allow access in your browser settings.',
          2: 'Location unavailable. Please try again.',
          3: 'Location request timed out. Please try again.',
        };
        setLocErr(messages[err.code] || 'Could not get location.');
        setLocLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, []);

  /* ── Format countdown ── */
  function formatRemaining(ms) {
    if (ms === null || ms === undefined) return '--:--:--';
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2,'0')}m`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  return (
    <AppCtx.Provider value={{
      location, cityName, locationErr, locLoading, fetchLocation,
      prayers, nextPrayer, qiblaAngle, hijriDate,
      method, setMethod,
      notifications, setNotifs,
      formatRemaining,
      notificationSound, setNotificationSound,
      reminderMinutes, setReminderMinutes,
      manualPrayerTimes, setManualPrayerTime,
      isOnline,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  return useContext(AppCtx);
}
