// tailwind.config.mjs - PERFORMANCE OPTIMIZED VERSION
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ERM Brand Colors - Streamlined
      colors: {
        'erm-primary': '#007A5F',
        'erm-dark': '#00382C', 
        'erm-light': '#f0fdfa',
        'erm-surface': '#f8fafc',
        
        // Legacy support for existing components - MINIMAL SET
        'strapi-green-light': '#007A5F',
        'strapi-green-dark': '#00382C',
        'strapi-gray-bg': '#f8fafc',
        'strapi-light-gray': '#e7e5e4',
        'text-dark-gray': '#1c1917',
        'text-medium-gray': '#78716c',
        'text-light-gray': '#a8a29e',
      },
      
      // Typography - Essential only
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      // Z-index - Simplified
      zIndex: {
        'sidebar': 20,
        'header': 30,
        'dropdown': 1000,
        'search-modal': 99999,
        'search-content': 100000,
        'document-modal': 10001,
        'toast': 10003,
      },
      
      // Animations - Essential only
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'professional-fade-in': 'professionalFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slideInFromRight': 'slideInFromRight 0.3s ease-out',
      },
      
      // Keyframes - Essential only
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
        professionalFadeIn: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(8px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        slideInFromRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(100%)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
      },
      
      // Essential shadows only
      boxShadow: {
        'erm-search': '0 25px 50px -12px rgba(0, 122, 95, 0.25)',
        'erm-search-focus': '0 0 0 3px rgba(0, 122, 95, 0.1), 0 8px 25px rgba(0, 122, 95, 0.15)',
      },
      
      // Essential transitions
      transitionTimingFunction: {
        'erm-ease': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    
    // Minimal custom utilities - PERFORMANCE FOCUSED
    function({ addUtilities }) {
      addUtilities({
        // Search utilities only
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
        
        // Modal utilities only
        '.modal-erm': {
          zIndex: '99999',
          position: 'fixed',
          inset: '0',
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(4px)',
        },
        
        // Scrollbar utilities only
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
            background: '#007A5F',
            borderRadius: '8px',
            transition: 'background 0.3s ease',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#00382C',
          },
        },
      })
    },
  ],
};