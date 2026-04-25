/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        emerald: {
          deep: '#0F3D2E',
          mid:  '#1A5C42',
          soft: '#246B4E',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light:   '#E8CB5D',
          dark:    '#A88B1F',
          muted:   'rgba(212,175,55,0.25)',
        },
        cream: '#F5F5DC',
        onyx:  '#0A0A0A',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body:    ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'radial-divine': 'radial-gradient(ellipse at top, #0F3D2E 0%, #071A13 55%, #0A0A0A 100%)',
        'gold-shimmer':  'linear-gradient(135deg, #A88B1F 0%, #D4AF37 50%, #E8CB5D 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(212,175,55,0.3), 0 0 60px rgba(212,175,55,0.1)',
        'inner-gold': 'inset 0 0 30px rgba(212,175,55,0.05)',
        'prayer-next': '0 0 0 1px rgba(212,175,55,0.4), 0 4px 24px rgba(212,175,55,0.15)',
      },
      animation: {
        'pulse-gold':   'pulseGold 3s ease-in-out infinite',
        'spin-slow':    'spin 8s linear infinite',
        'fade-in':      'fadeIn 0.6s ease-out forwards',
        'slide-up':     'slideUp 0.5s ease-out forwards',
        'compass-glow': 'compassGlow 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.02)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        compassGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.5))' },
          '50%':      { filter: 'drop-shadow(0 0 16px rgba(212,175,55,0.9))' },
        },
      },
    },
  },
  plugins: [],
};
