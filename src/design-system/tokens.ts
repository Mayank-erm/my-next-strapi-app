// src/design-system/tokens.ts - ERM SUSTAINABILITY DESIGN SYSTEM
// Based on your provided ERM color palette

export const ermDesignTokens = {
  // === ERM BRAND COLORS (from your palette) ===
  colors: {
    // Primary ERM Green
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
    
    // Supporting ERM Colors (from your accessibility palette)
    supporting: {
      // These would be extracted from your color palette image
      emerald: '#10b981',
      teal: '#14b8a6',
      cyan: '#06b6d4',
      blue: '#3b82f6',
      amber: '#f59e0b',
      orange: '#ea580c',
    },
    
    // Neutral colors (professional)
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
    
    // Semantic colors
    semantic: {
      success: '#007A5F', // Use your ERM green
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    
    // Surface colors
    surface: {
      background: '#fafaf9',
      card: '#ffffff',
      elevated: '#ffffff',
      overlay: 'rgba(0, 122, 95, 0.15)', // Using your ERM green
    }
  },

  // === TYPOGRAPHY SYSTEM ===
  typography: {
    fontFamily: {
      primary: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      heading: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },
    
    // Consistent font sizes
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },
    
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    }
  },

  // === SPACING SYSTEM ===
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // === BORDER RADIUS ===
  borderRadius: {
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // === SHADOWS ===
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // === COMPONENT SPECIFICATIONS ===
  components: {
    button: {
      primary: {
        backgroundColor: '#007A5F',
        color: '#ffffff',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.75rem',
        fontWeight: 600,
        fontSize: '0.875rem',
        lineHeight: 1.25,
        transition: 'all 0.2s ease-in-out',
        hover: {
          backgroundColor: '#00382C',
          transform: 'translateY(-1px)',
          boxShadow: '0 10px 15px -3px rgba(0, 122, 95, 0.3)',
        }
      },
      secondary: {
        backgroundColor: '#ffffff',
        color: '#007A5F',
        border: '1px solid #d6d3d1',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.75rem',
        fontWeight: 500,
        fontSize: '0.875rem',
        transition: 'all 0.2s ease-in-out',
        hover: {
          backgroundColor: '#f0fdfa',
          borderColor: '#007A5F',
          color: '#00382C',
        }
      }
    },
    
    card: {
      default: {
        backgroundColor: '#ffffff',
        border: '1px solid #e7e5e4',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease-in-out',
        hover: {
          borderColor: '#007A5F',
          boxShadow: '0 10px 15px -3px rgba(0, 122, 95, 0.1)',
          transform: 'translateY(-2px)',
        }
      }
    },
    
    input: {
      default: {
        backgroundColor: '#ffffff',
        border: '1px solid #d6d3d1',
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        lineHeight: 1.25,
        transition: 'all 0.2s ease-in-out',
        focus: {
          borderColor: '#007A5F',
          boxShadow: '0 0 0 2px rgba(0, 122, 95, 0.1)',
          outline: 'none',
        }
      }
    }
  }
};

// === UTILITY FUNCTIONS ===
export const getErmColor = (colorPath: string) => {
  const path = colorPath.split('.');
  let color: any = ermDesignTokens.colors;
  
  for (const key of path) {
    color = color[key];
    if (!color) return '#007A5F'; // Fallback to ERM green
  }
  
  return color;
};

export const getErmSpacing = (size: keyof typeof ermDesignTokens.spacing) => {
  return ermDesignTokens.spacing[size];
};

export const getErmTypography = (property: string, value: string) => {
  const typography = ermDesignTokens.typography as any;
  return typography[property]?.[value] || '';
};

// === COMPONENT VARIANTS ===
export const ermComponentVariants = {
  // Button variants using ERM colors
  button: {
    primary: `
      bg-[#007A5F] text-white font-semibold py-3 px-6 rounded-xl
      hover:bg-[#00382C] hover:-translate-y-1 hover:shadow-lg
      transition-all duration-200 ease-in-out
    `,
    secondary: `
      bg-white text-[#007A5F] border border-neutral-300 font-medium py-3 px-6 rounded-xl
      hover:bg-[#f0fdfa] hover:border-[#007A5F] hover:text-[#00382C]
      transition-all duration-200 ease-in-out
    `,
    ghost: `
      bg-transparent text-[#007A5F] font-medium py-3 px-6 rounded-xl
      hover:bg-[#f0fdfa]
      transition-all duration-200 ease-in-out
    `
  },
  
  // Card variants
  card: {
    default: `
      bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm
      hover:border-[#007A5F] hover:shadow-lg hover:-translate-y-1
      transition-all duration-300 ease-in-out
    `,
    elevated: `
      bg-white rounded-2xl p-6 shadow-lg border-0
      hover:shadow-xl hover:-translate-y-2
      transition-all duration-300 ease-in-out
    `,
    sustainability: `
      bg-gradient-to-br from-white to-[#f0fdfa] border border-[#007A5F]/20 rounded-2xl p-6 shadow-sm
      hover:border-[#007A5F] hover:shadow-lg hover:-translate-y-1
      transition-all duration-300 ease-in-out
    `
  }
};

// === ACCESSIBILITY TOKENS ===
export const ermAccessibility = {
  focusRing: {
    style: '0 0 0 2px rgba(0, 122, 95, 0.5)',
    offset: '2px',
  },
  
  contrast: {
    // Ensure WCAG compliance with your ERM colors
    textOnPrimary: '#ffffff',
    textOnSecondary: '#00382C',
    textPrimary: '#1c1917',
    textSecondary: '#44403c',
    textTertiary: '#78716c',
  }
};