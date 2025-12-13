/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Supabase Brand Colors
        brand: {
          DEFAULT: '#3ECF8E',
          dark: '#34B27B',
          darker: '#24B47E',
          light: 'rgba(62, 207, 142, 0.1)',
        },
        // Background Colors
        background: {
          DEFAULT: '#11181C',
          alt: '#171717',
          elevated: '#1C1C1C',
          card: '#232323',
        },
        // Text Colors
        foreground: {
          DEFAULT: '#EDEDED',
          light: '#A1A1A1',
          muted: '#6B6B6B',
        },
        // Utility Colors
        success: '#3ECF8E',
        danger: '#EF4444',
        warning: '#F5A623',
        info: '#3B82F6',
        purple: '#9333EA',
      },
      fontFamily: {
        sans: [
          'Circular',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Open Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: [
          'Source Code Pro',
          'SF Mono',
          'Monaco',
          'Inconsolata',
          'Fira Mono',
          'Droid Sans Mono',
          'monospace',
        ],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
        slower: '500ms',
      },
      boxShadow: {
        sm: '0 2px 4px rgba(0, 0, 0, 0.2)',
        md: '0 4px 12px rgba(0, 0, 0, 0.3)',
        lg: '0 12px 40px rgba(0, 0, 0, 0.3)',
        xl: '0 16px 48px rgba(0, 0, 0, 0.4)',
        glow: '0 0 0 3px rgba(62, 207, 142, 0.1)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-down': 'fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(62, 207, 142, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(62, 207, 142, 0)' },
        },
      },
    },
  },
  plugins: [],
};
