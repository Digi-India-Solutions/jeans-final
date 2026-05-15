/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        container: {
          center: true,
          padding: '0.5rem' /* slightly reduced container padding for a more compact layout */
        }
      },
    },
    plugins: [],
  }