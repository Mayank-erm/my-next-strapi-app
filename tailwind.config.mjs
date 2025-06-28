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
        // Extend your existing color palette or add a new one for the overlay
        'custom-overlay': 'oklch(0.39 0.1 152.54 / 0.23)',
        // Re-adding your existing custom theme colors just in case they were lost
        'strapi-green-dark': '#00382C',
        'strapi-green-light': '#00644B',
        'strapi-gray-bg': '#F0F2F5',
        'strapi-light-gray': '#E5E7EB',
        'text-dark-gray': '#374151',
        'text-medium-gray': '#6B7280',
        'text-light-gray': '#9CA3AF',
        'proposal-border': '#D1D5DB',
        'proposal-bg': '#FFFFFF',
      },
      // You should not need to define backdropFilter explicitly for 'backdrop-blur-sm'
      // in modern Tailwind CSS, but if issues persist, uncomment the following:
      // backdropFilter: {
      //   'none': 'none',
      //   'blur-sm': 'blur(2px)', // Matches 'backdrop-blur-sm'
      // },
    },
  },
  plugins: [
    require('@tailwindcss/postcss'),
    // If you need it, add a plugin for backdrop-filter if your Tailwind/PostCSS setup is older
    // For Tailwind 3.0+ and PostCSS 8+, backdrop-blur-sm should work natively.
    // If you had `tailwindcss-filters` for backdrop-filter, ensure it's still installed and configured.
  ],
};