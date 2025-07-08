// tailwind.config.mjs - UPDATED: ERM DESIGN SYSTEM with Search Enhancements
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
      
      // Enhanced Z-index scale
      zIndex: {
        'base': 1,
        'sidebar': 20,
        'header': 30,
        'dropdown': 1000,
        'overlay': 9000,
        'search-modal': 99999,
        'search-content': 100000,
        'document-modal': 10001,
        'toast': 10003,
      },
      
      // Enhanced Animations
      animation: {
        'erm-fade-in': 'erm-fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'erm-scale-in': 'erm-scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'erm-slide-up': 'erm-slide-up 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'erm-shimmer': 'erm-shimmer 1.5s infinite',
        'erm-pulse-glow': 'erm-pulse-glow 2s infinite',
        'erm-gradient': 'erm-gradient-shift 8s ease infinite',
        'gentle-pulse': 'gentle-pulse 3s ease-in-out infinite',
        'professional-fade-in': 'professional-fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'smooth-scale': 'smooth-scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slideInFromRight': 'slideInFromRight 0.3s ease-out',
        
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
        'gentle-pulse': {
          '0%, 100%': { 
            opacity: '1' 
          },
          '50%': { 
            opacity: '0.8' 
          },
        },
        'professional-fade-in': {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(8px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        'smooth-scale': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.98)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'slideInFromRight': {
          '0%': {
            opacity: '0',
            transform: 'translateX(100%)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
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
      
      // Enhanced Shadows with ERM theming
      boxShadow: {
        'erm-sm': '0 1px 2px 0 rgba(0, 122, 95, 0.05)',
        'erm-md': '0 4px 6px -1px rgba(0, 122, 95, 0.1), 0 2px 4px -1px rgba(0, 122, 95, 0.06)',
        'erm-lg': '0 10px 15px -3px rgba(0, 122, 95, 0.1), 0 4px 6px -2px rgba(0, 122, 95, 0.05)',
        'erm-xl': '0 20px 25px -5px rgba(0, 122, 95, 0.1), 0 10px 10px -5px rgba(0, 122, 95, 0.04)',
        'erm-search': '0 25px 50px -12px rgba(0, 122, 95, 0.25), 0 0 0 1px rgba(0, 122, 95, 0.05)',
        'erm-search-focus': '0 0 0 3px rgba(0, 122, 95, 0.1), 0 8px 25px rgba(0, 122, 95, 0.15)',
      },
      
      // Enhanced Backdrop Blur
      backdropBlur: {
        xs: '2px',
        search: '16px',
      },
      
      // ERM Gradients
      backgroundImage: {
        'erm-gradient-primary': 'linear-gradient(135deg, #007A5F 0%, #00382C 100%)',
        'erm-gradient-soft': 'linear-gradient(135deg, #f0fdfa 0%, #fafaf9 100%)',
        'erm-gradient-accent': 'linear-gradient(135deg, #007A5F 0%, #16a34a 50%, #10b981 100%)',
        'erm-gradient-search': 'linear-gradient(135deg, rgba(0, 122, 95, 0.05) 0%, transparent 100%)',
        'erm-pattern-organic': 'radial-gradient(circle at 50% 50%, rgba(0, 122, 95, 0.1) 0%, transparent 70%)',
        'erm-pattern-subtle': `
          radial-gradient(circle at 20% 80%, rgba(0, 122, 95, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(0, 56, 44, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(0, 122, 95, 0.03) 0%, transparent 50%)
        `,
      },
      
      // Enhanced Border Radius
      borderRadius: {
        'erm': '0.75rem',
        'erm-lg': '1rem',
        'erm-xl': '1.5rem',
        'erm-2xl': '2rem',
        'erm-search': '1rem',
      },
      
      // ERM Spacing
      spacing: {
        'erm-xs': '0.25rem',
        'erm-sm': '0.5rem',
        'erm-md': '1rem',
        'erm-lg': '1.5rem',
        'erm-xl': '2rem',
        'erm-2xl': '3rem',
      },
      
      // Enhanced Ring colors for focus states
      ringColor: {
        'erm-primary': '#007A5F',
        'erm-focus': 'rgba(0, 122, 95, 0.5)',
      },
      
      // Enhanced opacity scale
      opacity: {
        '15': '0.15',
        '85': '0.85',
        '98': '0.98',
      },
      
      // Enhanced blur utilities
      blur: {
        'xs': '2px',
        'search': '16px',
      },
      
      // Enhanced scale utilities
      scale: {
        '98': '0.98',
        '102': '1.02',
      },
      
      // Enhanced transition timing
      transitionTimingFunction: {
        'erm-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'erm-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      
      // Enhanced transition duration
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/postcss'),
    require('@tailwindcss/forms'),
    
    // Custom plugin for ERM utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // ERM Search utilities
        '.search-input-erm': {
          backgroundColor: 'rgba(248, 250, 252, 0.8)',
          border: '2px solid rgb(231, 229, 228)',
          borderRadius: '1rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:focus': {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#007A5F',
            boxShadow: '0 0 0 3px rgba(0, 122, 95, 0.1), 0 8px 25px rgba(0, 122, 95, 0.15)',
            outline: 'none',
          },
        },
        
        // ERM Button utilities
        '.btn-erm-primary': {
          background: 'linear-gradient(135deg, #007A5F 0%, #00382C 100%)',
          color: 'white',
          fontWeight: '600',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.75rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 12px rgba(0, 122, 95, 0.2)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 122, 95, 0.3)',
          },
        },
        
        // ERM Card utilities
        '.card-erm': {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgb(231, 229, 228)',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.98)',
            borderColor: '#007A5F',
            boxShadow: '0 20px 40px rgba(0, 122, 95, 0.1)',
            transform: 'translateY(-2px)',
          },
        },
        
        // ERM Modal utilities
        '.modal-erm': {
          zIndex: '99999',
          position: 'fixed',
          inset: '0',
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(4px)',
        },
        
        '.modal-content-erm': {
          zIndex: '100000',
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 122, 95, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 122, 95, 0.25), 0 0 0 1px rgba(0, 122, 95, 0.05)',
        },
        
        // ERM Scrollbar utilities
        '.scrollbar-erm': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#007A5F rgb(245, 245, 244)',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgb(245, 245, 244)',
            borderRadius: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(180deg, #007A5F 0%, #00382C 100%)',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#00382C',
          },
        },
      }
      
      addUtilities(newUtilities)
    },
  ],
};