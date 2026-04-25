# 🕌 Hidaya — Islamic Qibla & Prayer Times PWA

> **"Find Direction. Find Peace."**

Hidaya (هداية) means *guidance* in Arabic. This app provides accurate Qibla direction and prayer time reminders in a spiritually respectful, minimal, and calming interface.

---

## ✨ Features

| Feature | Details |
|---------|---------|
| **Qibla Compass** | Device orientation sensor + manual fallback |
| **Prayer Times** | Accurate calculation via Adhan.js with manual overrides |
| **Hijri Date** | Interactive Islamic calendar with month navigation |
| **Custom Alerts** | Native push notifications & custom audio file uploads |
| **Quranic Quotes** | Time-specific verses revealed on interactive prayer cards |
| **Dark Mode** | Deep emerald & gold — dark-first always |
| **PWA** | Installable, offline-ready, local storage persistence |
| **11 Calculation Methods** | Muslim World League, Karachi, UmmAlQura, etc. |
| **Reverse Geocoding** | Auto-detect city via OpenStreetMap Nominatim |

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Allow Location** when prompted for accurate prayer times and Qibla.

---

## 📦 Build for Production

```bash
npm run build
npm run preview
```

The `dist/` folder is your deployable PWA.

---

## 🎨 Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `Deep Emerald` | `#0F3D2E` | Primary background |
| `Gold` | `#D4AF37` | Accents, highlights (Noor) |
| `Gold Light` | `#E8CB5D` | Hover, gradient tip |
| `Gold Dark` | `#A88B1F` | Gradient base |
| `Cream` | `#F5F5DC` | Primary text |
| `Near Black` | `#0A0A0A` | App background |

### Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display | Cinzel (serif) | 400–700 | App name, prayer names, headings |
| Body | Inter (sans-serif) | 300–600 | UI labels, descriptions |
| Arabic | Georgia (fallback) | 400 | Arabic text overlays |

### Iconography Style
- **Stroke weight:** 1.5px thin lines
- **Color:** Gold `#D4AF37` (active), Cream 35% opacity (inactive)
- **Themes:** Crescent, compass, mosque silhouette, sun/moon phases
- **Never:** Filled cartoon icons, colorful icons, or complex illustrations

### Component Tokens
```css
--glass-bg:      rgba(15, 61, 46, 0.35)    /* card backgrounds */
--glass-border:  rgba(212, 175, 55, 0.18)  /* card borders */
--gold-glow:     rgba(212, 175, 55, 0.35)  /* glow effects */
```

---

## 🗂 Project Structure

```
hidaya/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/
│       ├── logo.svg           # ← Replace with your logo
│       ├── icon-192.png       # ← Replace with your icon
│       └── icon-512.png       # ← Replace with your icon
├── src/
│   ├── context/
│   │   └── AppContext.jsx     # Global state, prayer calc, Hijri date
│   ├── components/
│   │   ├── BottomNav.jsx      # 4-tab navigation
│   │   ├── MihrabArch.jsx     # Reusable Islamic arch SVG
│   │   └── QiblaCompass.jsx   # Animated compass with sensor
│   ├── pages/
│   │   ├── Home.jsx           # Greeting, next prayer, quick actions
│   │   ├── Qibla.jsx          # Compass screen
│   │   ├── PrayerTimes.jsx    # Full prayer list
│   │   └── Settings.jsx       # Method, notifications, about
│   ├── App.jsx                # Router shell
│   ├── main.jsx               # Entry point
│   └── index.css              # Design system + Tailwind
├── vite.config.js             # Vite + PWA plugin
├── tailwind.config.js         # Design tokens
└── package.json
```

---

## 🖼️ Replacing the Logo

1. Design your logo following these guidelines:
   - **Shape:** Mihrab (pointed arch) with subtle compass element
   - **Style:** Gold `#D4AF37` on transparent/dark background
   - **Format:** SVG for crisp rendering at all sizes
   - **Clearspace:** Minimum 10% padding on all sides

2. Replace files:
   ```
   public/icons/logo.svg      → Your SVG logo
   public/icons/icon-192.png  → 192×192 PNG (square, with padding)
   public/icons/icon-512.png  → 512×512 PNG (square, with padding)
   ```

---

## 🕌 Prayer Calculation Methods

Change via **Settings → Calculation Method**:

- Muslim World League *(default)*
- Egyptian
- University of Islamic Sciences, Karachi
- Umm al-Qura (Makkah)
- Dubai
- Qatar
- Kuwait
- Moonsighting Committee
- Singapore
- Turkey
- Institute of Geophysics, Tehran

---

## 📱 PWA Installation

| Platform | How to install |
|----------|---------------|
| Android Chrome | Menu → "Add to Home Screen" |
| iOS Safari | Share → "Add to Home Screen" |
| Desktop Chrome | Address bar install icon |

---

## 🔔 Notifications & Alerts

Alerts are designed to be respectful and reliable:

- **Native Push Notifications:** "Time for Fajr. May your prayer be accepted."
- **Custom Audio:** Upload your own audio file (up to 2MB) stored safely offline.
- **Web Audio Fallback:** A clean, 5-second programmatic beep sequence if no custom sound is selected.
- **Selective Muting:** Toggle alerts on or off for specific prayers directly from the Settings page.

---

## 📖 App Store Taglines

| Option | Tagline |
|--------|---------|
| Primary | "Find Direction. Find Peace." |
| Alt 1 | "Guidance to Your Qibla" |
| Alt 2 | "Stay Connected to Salah" |
| Alt 3 | "Your Companion for Every Prayer" |

---

## 🤝 Religious Sensitivity Guidelines

- ✅ Minimal, respectful use of Islamic symbols
- ✅ Arabic text rendered with proper font fallbacks
- ✅ Quranic verses cited with surah/ayah reference
- ✅ No imagery of the Prophet (PBUH)
- ✅ Kaaba reference kept geometric and minimal
- ❌ No excessive decorative use of sacred imagery
- ❌ No commercial or promotional language in reminders
- ❌ No flashy animations or neon effects

---

*Hidaya is built with respect for Islamic values and the communities it serves. Developed by Rinash.*

**Bismillah ir-Rahman ir-Rahim**
