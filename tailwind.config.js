/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chess: {
          dark: '#302e2b',
          darker: '#262421',
          darkest: '#1e1c18',
          sidebar: '#272522',
          card: '#312e2b',
          border: '#403d39',
          green: '#81b64c',
          greenHover: '#a3d160',
          boardLight: '#eeeed2',
          boardDark: '#769656',
          highlight: 'rgba(255, 255, 0, 0.4)',
        }
      }
    },
  },
  plugins: [],
}

