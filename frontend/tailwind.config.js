export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tas: {
          red: '#9a1528', // colore principale del brand TAS
        },
      },
      fontFamily: {
        sans: ['Open Sans', 'Arial', 'Helvetica', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'], // usato con classe font-display
      },
    },
  },
  plugins: [],
}
