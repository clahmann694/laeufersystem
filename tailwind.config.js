/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Vereinsfarben VSG Kleinsteinbach: Cyan aus dem Wappen auf dunklem Marineblau
        navy: { 950: '#071522', 900: '#0b1a27', 800: '#10283b', 700: '#17364d', 600: '#1f4562' },
        vsg: { 200: '#cdeefb', 300: '#8fd8f6', 400: '#4fc0ef', 500: '#009fe3', 600: '#0089c8', 700: '#0a6fa5' },
        // Helle Sektionen
        paper: { DEFAULT: '#f2f7fa', card: '#ffffff' },
        ice: '#d9eefa',
        // Spielfeld in Hallenblau
        court: { front: '#5fb5e3', back: '#3f9fd4', line: '#ffffff' },
      },
      fontFamily: {
        display: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 30px 80px -30px rgba(0,0,0,0.6)',
        dot: '0 6px 14px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}
