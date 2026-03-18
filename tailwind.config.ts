import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vsonus-black': '#000000',
        'vsonus-dark': '#231F20',
        'vsonus-red': '#EC1C24',
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 12px 2px rgba(236, 28, 36, 0.5)',
        'glow-red-hover': '0 0 24px 6px rgba(236, 28, 36, 0.75)',
        'card-hover': '0 8px 32px rgba(236, 28, 36, 0.18)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'line-expand': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 4px 2px rgba(236, 28, 36, 0.2)' },
          '50%': { boxShadow: '0 0 28px 8px rgba(236, 28, 36, 0.65)' },
        },
        'wave': {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.12)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '80%': { transform: 'translateX(-4px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-once': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(236, 28, 36, 0)' },
          '50%': { boxShadow: '0 0 0 8px rgba(236, 28, 36, 0.35)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'line-expand': 'line-expand 0.5s ease-out forwards',
        'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'wave': 'wave 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 10s linear infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        scroll: 'scroll 35s linear infinite',
        'slide-in-right': 'slide-in-right 0.4s ease-out forwards',
        'pulse-once': 'pulse-once 1.5s ease-in-out 2',
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
        sm: '0px',
        md: '0px',
        lg: '0px',
        xl: '0px',
        '2xl': '0px',
        '3xl': '0px',
        full: '0px',
      },
    },
  },
  plugins: [],
}

export default config
