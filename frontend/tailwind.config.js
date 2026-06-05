/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        fifa: {
          red:    '#7B1D2E',
          purple: '#4A1060',
          blue:   '#0A2E6E',
          teal:   '#007A6E',
          green:  '#00A551',
          yellow: '#C9E820',
          orange: '#F47B20',
        },
      },
    },
  },
  plugins: [],
};
