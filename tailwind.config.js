/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // UI/UX Overhaul Design System Colors - Strictly Minimal
        'metallic-gray': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Primary Brand Color - Mpondo Gold
        'mpondo-gold': {
          50: '#fdfbf4',
          100: '#faf4e1',
          200: '#f5e8c3',
          300: '#edd597',
          400: '#e2bd64',
          500: '#D4AF37', // Primary
          600: '#b8932a',
          700: '#997624',
          800: '#7d5f21',
          900: '#684e20',
          950: '#3b2b0f',
        },
        // Semantic Colors (UI/UX Overhaul) - Used sparingly
        status: {
          success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            800: '#166534',
          },
          warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            800: '#92400e',
          },
          error: {
            50: '#fef2f2',
            100: '#fee2e2',
            500: '#ef4444', // Red
            800: '#991b1b',
          },
          info: {
            50: '#f8fafc',
            100: '#f1f5f9',
            800: '#1e293b',
          },
        },
        // Neutral palette for UI
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        }
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      animation: {
        'scale-in': 'scaleIn 200ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'slide-down': 'slideDown 300ms ease-out',
        'fade-in': 'fadeIn 200ms ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgb(0 0 0 / 0.1)',
        'glow': '0 0 20px -5px rgb(212 175 55 / 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '120': '30rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [],
}

export default config