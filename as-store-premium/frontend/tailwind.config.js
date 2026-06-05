/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#070A13',      // Luxurious dark slate background
          panel: '#10162A',     // Smooth dark panel background
          panelLight: '#FFFFFF',// Sleek light mode panel
          accent: '#3B82F6',    // Electric premium blue
          accentLight: '#60A5FA',
          emerald: '#10B981',   // Success/Completed green
          rose: '#F43F5E',      // Danger/Cancelled rose
          amber: '#F59E0B',     // Warning amber
          violet: '#8B5CF6',    // Purple allocation accent
          slateDark: '#1E293B',
          textDark: '#94A3B8',
          textLight: '#475569',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'premium': '0 20px 40px -15px rgba(0,0,0,0.5)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
