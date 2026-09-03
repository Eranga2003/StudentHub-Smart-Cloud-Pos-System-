/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
          subtle: 'var(--color-primary-subtle)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          hover: 'var(--color-secondary-hover)',
          light: 'var(--color-secondary-light)',
          dark: 'var(--color-secondary-dark)',
          subtle: 'var(--color-secondary-subtle)',
        },
        brand: {
          navy: 'var(--color-primary)',
          green: 'var(--color-secondary)',
          white: 'var(--color-white)',
        },
        app: {
          bg: 'var(--color-background)',
          surface: 'var(--color-surface)',
          border: 'var(--color-border)',
          muted: 'var(--color-border-subtle)',
        },
        textColor: {
          main: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        status: {
          success: 'var(--color-success)',
          error: 'var(--color-error)',
          warning: 'var(--color-warning)',
          info: 'var(--color-info)',
        },
      },
      fontFamily: {
        sans: ['Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 4px 20px -2px rgba(11, 59, 96, 0.08)',
        'glass-hover': '0 8px 28px -4px rgba(11, 59, 96, 0.16)',
        'brand-glow': '0 0 15px rgba(67, 176, 42, 0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
