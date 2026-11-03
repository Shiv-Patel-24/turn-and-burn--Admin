/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0D6EFD',
        dark: '#111111',
        sidebar: '#1A1A1A'
      }
    },
  },
  plugins: [],
}
