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
          DEFAULT: '#328F9B',
          hover: '#287C87',
          active: '#216C76',
          soft: 'rgba(50, 143, 155, 0.12)',
        },
        background: '#DEEFF6',
        card: '#FFFFFF',
        foreground: '#05313A',
        borderToken: 'rgba(5, 49, 58, 0.10)',
        mutedText: 'rgba(5, 49, 58, 0.60)',
        subtleText: 'rgba(5, 49, 58, 0.40)',
        tag: {
          health: '#35A853',
          work: '#328F9B',
          personal: '#8B5CF6',
          learning: '#D88A2D',
          important: '#D94B5B',
          neutral: '#6B7F84',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '18px',
        'hero': '20px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(5, 49, 58, 0.04)',
        'float': '0 8px 30px rgba(5, 49, 58, 0.08)',
      }
    },
  },
  plugins: [],
}
