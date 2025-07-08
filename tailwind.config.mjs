// tailwind.config.mjs - ERM DESIGN SYSTEM
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ERM Brand Colors
      colors: {
        // Primary ERM Colors (from your palette)
        'erm-primary': '#007A5F',
        'erm-dark': '#00382C', 
        'erm-light': '#f0fdfa',
        'erm-surface': '#f8fafc',
        
        // Extended Primary Palette
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#007A5F', // Your main ERM green
          600: '#006B52',
          700: '#00382C', // Your dark ERM green
          800: '#134e4a',
          900: '#042f2e',
        },
        
        // Professional Neutrals
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        
        // Semantic Colors using ERM palette
        success: '#007A5F',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        
        // Legacy support for existing components
        'strapi-green-light': '#007A5F',
        'strapi-green-dark': '#00382C',
        'strapi-gray-bg': '#f8fafc',
        'strapi-light-gray': '#e7e5e4',
        'text-dark-gray': '#1c1917',
        'text-medium-gray': '#78716c',
        'text-light-gray': '#a8a29e',
        'proposal-border': '#e7e5e4',
        'proposal-bg': '#ffffff',
        
        // Custom overlay
        'custom-overlay': 'oklch(0.39 0.1 152.54 / 0.23)',
      },
      
      // Enhanced Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
      },
      
      // Enhanced Animations
      animation: {
        'erm-fade-in': 'erm-fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'erm-scale-in': 'erm-scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'erm-slide-up': 'erm-slide-up 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'erm-shimmer': 'erm-shimmer 1.5s infinite',
        'erm-pulse-glow': 'erm-pulse-glow 2s infinite',
        'erm-gradient': 'erm-gradient-shift 8s ease infinite',
        
        // Legacy animations
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      
      // Enhanced Keyframes
      keyframes: {
        'erm-fade-in': {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(-12px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        'erm-scale-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.92) translateY(8px)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1) translateY(0)',
          },
        },
        'erm-slide-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'erm-shimmer': {
          '0%': {
            'background-position': '-200px 0',
          },
          '100%': {
            'background-position': 'calc(200px + 100%) 0',
          },
        },
        'erm-pulse-glow': {
          '0%, 100%': {
            'box-shadow': '0 0 0 0 rgba(0, 122, 95, 0.4)',
          },
          '50%': {
            'box-shadow': '0 0 0 8px rgba(0, 122, 95, 0)',
          },
        },
        'erm-gradient-shift': {
          '0%, 100%': { 
            'background-position': '0% 50%' 
          },
          '50%': { 
            'background-position': '100% 50%' 
          },
        },
        
        // Legacy keyframes
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
      
      // Enhanced Shadows
      boxShadow: {
        'erm-sm': '0 1px 2px 0 rgba(0, 122, 95, 0.05)',
        'erm-md': '0 4px 6px -1px rgba(0, 122, 95, 0.1), 0 2px 4px -1px rgba(0, 122, 95, 0.06)',
        'erm-lg': '0 10px 15px -3px rgba(0, 122, 95, 0.1), 0 4px 6px -2px rgba(0, 122, 95, 0.05)',
        'erm-xl': '0 20px 25px -5px rgba(0, 122, 95, 0.1), 0 10px 10px -5px rgba(0, 122, 95, 0.04)',
      },
      
      // Enhanced Backdrop Blur
      backdropBlur: {
        xs: '2px',
      },
      
      // ERM Gradients
      backgroundImage: {
        'erm-gradient-primary': 'linear-gradient(135deg, #007A5F 0%, #00382C 100%)',
        'erm-gradient-soft': 'linear-gradient(135deg, #f0fdfa 0%, #fafaf9 100%)',
        'erm-gradient-accent': 'linear-gradient(135deg, #007A5F 0%, #16a34a 50%, #10b981 100%)',
      },
      
      // Enhanced Border Radius
      borderRadius: {
        'erm': '0.75rem',
        'erm-lg': '1rem',
        'erm-xl': '1.5rem',
        'erm-2xl': '2rem',
      },
      
      // ERM Spacing
      spacing: {
        'erm-xs': '0.25rem',
        'erm-sm': '0.5rem',
        'erm-md': '1rem',
        'erm-lg': '1.5rem',
        'erm-xl': '2rem',
        'erm-2xl': '3rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/postcss'),
    require('@tailwindcss/forms'),
  ],
};