// tailwind.config.mjs - UPDATED VERSION
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom-overlay': 'oklch(0.39 0.1 152.54 / 0.23)',
        'strapi-green-dark': '#00382C',
        'strapi-green-light': '#007A5F',
        'strapi-gray-bg': '#F0F2F5',
        'strapi-light-gray': '#E5E7EB',
        'text-dark-gray': '#374151',
        'text-medium-gray': '#666F74',
        'text-light-gray': '#9CA3AF',
        'proposal-border': '#D1D5DB',
        'proposal-bg': '#FFFFFF',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        scaleIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/postcss'),
    require('@tailwindcss/forms'),
  ],
};