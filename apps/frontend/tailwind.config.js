/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gpu: {
          50: '#e8e8f0',
          100: '#c8c8d8',
          200: '#a8a8c0',
          300: '#8888a0',
          400: '#686880',
          500: '#555568',
          600: '#3a3a4a',
          700: '#2a2a38',
          800: '#1a1a26',
          900: '#14141e',
          950: '#0a0a12',
        },
        surface: {
          card: '#1a1a26',
        },
        accent: {
          DEFAULT: '#00aadd',
          dim: '#0088aa',
        },
        text: {
          primary: '#e8e8f0',
          secondary: '#8888a0',
          dim: '#3a3a4e',
        },
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.4)',
        glow: '0 0 12px rgba(30, 100, 200, 0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
