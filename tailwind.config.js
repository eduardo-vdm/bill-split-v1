/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f0ff',
          100: '#ebe0ff',
          200: '#d7c1ff',
          300: '#c3a2ff',
          400: '#af83ff',
          500: '#8941d7',
          600: '#6d34ac',
          700: '#512781',
          800: '#351a56',
          900: '#190d2b',
        },
        secondary: {
          50: '#fff5ed',
          100: '#ffebdb',
          200: '#ffd7b7',
          300: '#ffc393',
          400: '#ffaf6f',
          500: '#fb8f27',
          600: '#c9721f',
          700: '#975517',
          800: '#65380f',
          900: '#321b07',
        },
        tertiary: {
          50: '#e6fcf8',
          100: '#cdf9f1',
          200: '#9bf3e3',
          300: '#69edd5',
          400: '#37e7c7',
          500: '#1ad1b2',
          600: '#15a78e',
          700: '#107d6a',
          800: '#0a5346',
          900: '#052922',
        },
        navyblue: {
          50: '#e6e9f2',
          100: '#ccd3e5',
          200: '#99a7cb',
          300: '#667bb1',
          400: '#334f97',
          500: '#0e2a63',
          600: '#0b2250',
          700: '#08193c',
          800: '#051128',
          900: '#020814',
        },
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      dropShadow: {
        'white': '3px 3px rgba(255, 255, 255, .8)',
        'dark': '3px 3px #0e2a63',
        'white-hover': '3px 3px #c9721f',
        'dark-hover': '3px 3px #c9721f',
      }
    },
  },
  darkMode: 'class',
  plugins: [],
} 