/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        poker: {
          green: '#0D5C2F',
          felt: '#1A472A',
          dark: '#0A0E1A',
          gold: '#FFD700',
          red: '#DC143C',
          blue: '#1E3A8A',
        },
      },
      backgroundImage: {
        'poker-felt': "linear-gradient(135deg, #0D5C2F 0%, #1A472A 100%)",
      },
    },
  },
  plugins: [],
}

