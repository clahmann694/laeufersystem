/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        court: { line: '#ffffff', front: '#e8853a', back: '#c96a28' },
        vsg: { cyan: '#009fe3', blue: '#0089c8', navy: { 900: '#0b1a27', 800: '#0d283a' } },
      },
    },
  },
  plugins: [],
}
