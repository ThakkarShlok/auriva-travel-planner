// tailwind.config.js - Clean Professional Theme
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Warm Navy Blue (Professional, Trustworthy)
        primary: {
          50: '#f0f4f8',
          100: '#e1e8ef',
          200: '#c3d0df',
          300: '#a5b8cf',
          400: '#87a0bf',
          500: '#6988af',
          600: '#55709c',
          700: '#42587a',
          800: '#2f4058',
          900: '#1c2836',
        },
        // Secondary - Warm Sand/Taupe (Elegant, Natural)
        secondary: {
          50: '#faf8f6',
          100: '#f5f0ec',
          200: '#eae1d9',
          300: '#dfd2c6',
          400: '#d4c3b3',
          500: '#C9B4A0',
          600: '#b59a82',
          700: '#9a7d64',
          800: '#7f6046',
          900: '#644328',
        },
        // Accent - Soft Terracotta (Warm, Inviting)
        accent: {
          50: '#fdf6f3',
          100: '#fbece6',
          200: '#f7d9cd',
          300: '#f3c6b4',
          400: '#efb39b',
          500: '#EBA082',
          600: '#e27d56',
          700: '#d15a2a',
          800: '#a8451a',
          900: '#7f3010',
        },
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'hover': '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1c2836 0%, #2f4058 50%, #42587a 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #C9B4A0 0%, #B59A82 100%)',
      },
    },
  },
  plugins: [],
}