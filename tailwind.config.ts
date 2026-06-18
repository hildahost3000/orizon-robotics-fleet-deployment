import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'fleet-dark': '#1c0f12',
        'fleet-panel': '#261418',
        'fleet-border': '#3d2428',
        'fleet-accent': '#9b1b30',
        'fleet-accent-soft': '#d4566a',
        'fleet-cream': '#faf6f2',
        'fleet-cream-dark': '#f0e6de',
        'fleet-ink': '#2a1818',
        'fleet-muted': '#6b4f4f',
        'fleet-success': '#2d6a4f',
        'fleet-warning': '#b45309',
        'fleet-danger': '#9b1b30',
        'fleet-veto': '#6e1222',
      },
      fontFamily: {
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-instrument)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
