/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#AAEE00', // Lime green accent
          dark: '#8BC200',
        },
        secondary: {
          DEFAULT: '#1A1A1A', // Near black
          light: '#2E2E2E',
        },
        tertiary: {
          DEFAULT: '#FFD700', // Gold
        },
        neutralBg: {
          DEFAULT: '#F8F9FA', // Off-white neutral background
        },
        onSurface: '#191c1d',
        surfaceContainer: '#edeeef',
        surfaceVariant: '#e1e3e4',
        outline: '#727a62',
        outlineVariant: '#c2caae',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem', // Cards border radius (rounded-xl)
        'lg': '0.5rem', // Buttons border radius (rounded-lg)
      }
    },
  },
  plugins: [],
}
