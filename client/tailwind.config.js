/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aviator-dark': '#0f1923',
        'aviator-darker': '#0a0f14',
        'aviator-card': '#1a242d',
        'aviator-accent': '#ff4d4d',
        'aviator-green': '#00e701',
        'aviator-orange': '#ff6b00',
        'aviator-blue': '#1e88e5',
        'aviator-purple': '#9c27b0',
      },
      animation: {
        'pulse-fast': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
