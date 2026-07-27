/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#e6f7ff',
          100: '#b3e5fc',
          200: '#81d4fa',
          300: '#4fc3f7',
          400: '#29b6f6',
          500: '#03a9f4',
          600: '#039be5',
          700: '#0288d1',
          800: '#0277bd',
          900: '#01579b',
          950: '#01234a',
        },
        cyber: {
          cyan: '#00e5ff',
          blue: '#1e90ff',
          green: '#00ff9f',
          red: '#ff2d55',
          orange: '#ff9500',
          yellow: '#ffd60a',
          purple: '#bf5af2',
        },
        surface: {
          900: '#020817',
          800: '#0a1428',
          700: '#0f1f3d',
          600: '#16305c',
          500: '#1f4280',
        },
      },
      fontFamily: {
        display: ['Orbitron', 'Inter', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.5)',
        'glow-blue': '0 0 20px rgba(30, 144, 255, 0.5)',
        'glow-green': '0 0 20px rgba(0, 255, 159, 0.5)',
        'glow-red': '0 0 20px rgba(255, 45, 85, 0.5)',
        'glow-orange': '0 0 20px rgba(255, 149, 0, 0.5)',
      },
      backgroundImage: {
        'grid-cyber': "linear-gradient(rgba(0,229,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.07) 1px, transparent 1px)",
        'radar-sweep': 'radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid-40': '40px 40px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'flash-border': 'flash-border 1s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'spin-reverse': 'spin-reverse 6s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0,229,255,0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(0,229,255,0.8)' },
        },
        'flash-border': {
          '0%, 100%': { borderColor: 'rgba(255,45,85,0.5)', boxShadow: '0 0 10px rgba(255,45,85,0.3)' },
          '50%': { borderColor: 'rgba(255,45,85,1)', boxShadow: '0 0 30px rgba(255,45,85,0.9)' },
        },
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
