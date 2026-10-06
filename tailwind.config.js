/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        card: {
          DEFAULT: 'var(--color-card)',
          subtle: 'var(--color-card-subtle)',
          muted: 'var(--color-card-muted)',
        },
        foreground: 'var(--color-text)',
        textSecondary: 'var(--color-text-secondary)',
        mutedText: 'var(--color-text-muted)',
        borderToken: 'var(--color-border)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
          soft: 'var(--color-primary-soft)',
          text: 'var(--color-primary-text)',
        },
        tag: {
          health: 'var(--tag-health)',
          healthBg: 'var(--tag-health-bg)',
          work: 'var(--tag-work)',
          workBg: 'var(--tag-work-bg)',
          personal: 'var(--tag-personal)',
          personalBg: 'var(--tag-personal-bg)',
          learning: 'var(--tag-learning)',
          learningBg: 'var(--tag-learning-bg)',
          important: 'var(--tag-important)',
          importantBg: 'var(--tag-important-bg)',
          neutral: 'var(--tag-neutral)',
          neutralBg: 'var(--tag-neutral-bg)',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Lora', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '24px',
        'hero': '28px',
        'subcard': '18px',
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'float': 'var(--shadow-float)',
        'glow': '0 0 24px var(--color-primary-soft)',
      }
    },
  },
  plugins: [],
}
