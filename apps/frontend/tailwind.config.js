/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gpu: {
          950: '#080a12',
          900: '#0b0e17',
          800: '#0f1320',
          700: '#151a2c',
          600: '#1c2340',
          500: '#27305a',
          400: '#3d4a7a',
          300: '#6370a0',
          200: '#919bc2',
          100: '#c5cbe0',
          50: '#e6e9f2',
        },
        accent: {
          DEFAULT: '#f04747',
          dim: '#c0392b',
          bright: '#ff6b6b',
          glow: 'rgba(240, 71, 71, 0.2)',
          subtle: 'rgba(240, 71, 71, 0.08)',
        },
        temp: {
          cool: '#22d3ee',
          warm: '#f59e0b',
          hot: '#ef4444',
          critical: '#dc2626',
        },
        surface: {
          DEFAULT: '#0b0e17',
          raised: '#0f1320',
          card: '#151a2c',
          border: '#1c2340',
          hover: '#1f2748',
        },
        text: {
          primary: '#f0f2f8',
          secondary: '#919bc2',
          muted: '#5a6488',
          dim: '#3d4a7a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'gpu': '0 0 20px rgba(240, 71, 71, 0.06), 0 0 60px rgba(240, 71, 71, 0.03)',
        'glow': '0 0 16px rgba(240, 71, 71, 0.15)',
        'card': '0 2px 12px rgba(0,0,0,0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
