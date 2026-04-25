import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import BottomNav from './components/BottomNav.jsx';
import Home from './pages/Home.jsx';
import Qibla from './pages/Qibla.jsx';
import PrayerTimes from './pages/PrayerTimes.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-shell">
          <div className="page-content">
            <Routes>
              <Route path="/"        element={<Home />} />
              <Route path="/qibla"   element={<Qibla />} />
              <Route path="/prayers" element={<PrayerTimes />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*"        element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <BottomNav />
        </div>
      </Router>
    </AppProvider>
  );
}
