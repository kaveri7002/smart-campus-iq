/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B18',
          900: '#0B1528',
          850: '#0F1E38',
          800: '#142544',
          700: '#1E365E',
          600: '#2A4B82',
        },
        cyan: {
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          DEFAULT: '#06B6D4',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-navy': 'linear-gradient(135deg, #0B1528 0%, #0F1E38 50%, #142544 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(20, 37, 68, 0.7) 0%, rgba(15, 30, 56, 0.9) 100%)',
      }
    },
  },
  plugins: [],
}
