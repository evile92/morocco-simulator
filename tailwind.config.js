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
        morocco: {
          red: '#c1272d',
          green: '#006233',
          gold: '#d4af37',
          sand: '#e8d8c8',
          dark: '#0f172a',
          surface: '#1e293b',
          card: '#182234',
          border: '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Cairo', 'Segoe UI', 'sans-serif'],
        arabic: ['Cairo', 'Amiri', 'Traditional Arabic', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
