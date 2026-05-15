/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9a1528',
        'primary-dark': '#7f1020',
      },
    },
  },
  plugins: [],
}
