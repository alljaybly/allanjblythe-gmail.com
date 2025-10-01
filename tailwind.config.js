
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'cosmic-blue': '#0A84FF',
        'cosmic-orange': '#FF6B35',
        'dark-bg': '#0D1117',
        'dark-card': '#161B22',
        'dark-border': '#30363d',
        'light-bg': '#f6f8fa',
        'light-card': '#ffffff',
        'light-border': '#d0d7de',
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        pulse: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' },
        },
      },
      animation: {
        gradient: 'gradient 15s ease infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'glow-blue': '0 0 15px rgba(10, 132, 255, 0.5)',
        'glow-orange': '0 0 15px rgba(255, 107, 53, 0.5)',
      }
    },
  },
  plugins: [],
}
