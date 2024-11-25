/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        telegram: {
          primary: '#2AABEE',
          secondary: '#229ED9',
          bg: '#17212B',
          hover: '#2C3847'
        }
      }
    },
  },
  plugins: [],
}