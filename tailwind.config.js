/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        brand: {
          50:  '#eef9ff',
          100: '#d8f1ff',
          200: '#b9e7ff',
          300: '#88d8ff',
          400: '#50bfff',
          500: '#289eff',
          600: '#0f7ef5',
          700: '#0966e1',
          800: '#0e53b6',
          900: '#12488f',
          950: '#0e2d5c',
        },
      },
    },
  },
  plugins: [],
}
