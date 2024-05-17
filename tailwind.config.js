/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],  theme: {
    extend: {
      keyframes: {
        slam: {
          '0%': { opacity:0, transform: 'scale(1.5) rotate(-3deg)' },
          '80%': { opacity:1, transform: 'scale(0.8) rotate(2deg)' },
          '90%': { transform: 'scale(1.2) rotate(-2deg)' },
          '100%': { opacity:1, transform: 'scale(1) rotate(0)' },
        }
      },
      animation: {
        slam: 'slam 0.25s ease-out',
      },
    },
  },
  plugins: [],
}

