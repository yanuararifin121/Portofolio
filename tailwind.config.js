/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./admin/**/*.html",
    "./main.js",
    "./admin/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'purple': {
          400: '#a78bfa',
          500: '#a855f7',
          600: '#9333ea',
        }
      }
    },
  },
  plugins: [],
}