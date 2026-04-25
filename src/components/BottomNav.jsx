import { useNavigate, useLocation } from 'react-router-dom';

/* ── Thin-line SVG icons ── */
const HomeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke={active ? '#D4AF37' : 'rgba(245,245,220,0.35)'} strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12L12 3l9 9"/>
    <path d="M9 21V12h6v9"/>
    <path d="M5 10v11h14V10"/>
  </svg>
);

const QiblaIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke={active ? '#D4AF37' : 'rgba(245,245,220,0.35)'} strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9"/>
    <circle cx="12" cy="12" r="1.5" fill={active ? '#D4AF37' : 'rgba(245,245,220,0.35)'} stroke="none"/>
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>
    <path d="M12 3l2 7-2 2-2-2 2-7z" fill={active ? '#D4AF37' : 'rgba(245,245,220,0.35)'}
          stroke="none" opacity="0.85"/>
  </svg>
);

const PrayerIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke={active ? '#D4AF37' : 'rgba(245,245,220,0.35)'} strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20h16"/>
    <path d="M6 20V10a6 6 0 0 1 12 0v10"/>
    <path d="M9 20v-6a3 3 0 0 1 6 0v6"/>
    <path d="M12 4V2"/>
    <path d="M10.5 2h3"/>
  </svg>
);

const SettingsIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke={active ? '#D4AF37' : 'rgba(245,245,220,0.35)'} strokeWidth="1.6"
       strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const TABS = [
  { path: '/',         label: 'Home',     Icon: HomeIcon },
  { path: '/qibla',   label: 'Qibla',    Icon: QiblaIcon },
  { path: '/prayers', label: 'Prayers',  Icon: PrayerIcon },
  { path: '/settings',label: 'Settings', Icon: SettingsIcon },
];

export default function BottomNav() {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav">
      {TABS.map(({ path, label, Icon }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            className={`nav-item${active ? ' active' : ''}`}
            onClick={() => navigate(path)}
            aria-label={label}
          >
            <Icon active={active} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
