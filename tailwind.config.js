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
        },
        shakeLR: {
        /* ----------------------------------------------
        * Generated by Animista on 2024-5-18 21:16:10
        * Licensed under FreeBSD License.
        * See http://animista.net/license for more info.
        * w: http://animista.net, t: @cssanimista
        * ----------------------------------------
        * animation shake-lr
        * ----------------------------------------
        */
          '0%':   {transform: 'rotate(0deg)', transformOrigin: '50% 50%' },
          '100%': {transform: 'rotate(0deg)', transformOrigin: '50% 50%' },
          '10%':  {transform: 'rotate(8deg)'},
          '20%':{transform: 'rotate(-10deg)'},
          '40%':{transform: 'rotate(-10deg)'},
          '60%':{transform: 'rotate(-10deg)'},
          '30%':{transform: 'rotate(10deg)'},
          '50%':{transform: 'rotate(10deg)'},
          '70%': {transform: 'rotate(10deg)'},
          '80%': {transform: 'rotate(-8deg)'},
          '90%': {transform: 'rotate(8deg)'},
        }

      },
      animation: {
        slam: 'slam 0.25s ease-out',
        'shake-lr': 'shakeLR 0.5s cubic-bezier(0.645, 0.045, 0.355, 1.000) both',
      },
    },
  },
  plugins: [],
}
