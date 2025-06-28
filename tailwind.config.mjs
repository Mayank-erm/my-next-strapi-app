// tailwind.config.mjs
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
        'strapi-green-dark': '#00382C', // Kept original as per instruction
        'strapi-green-light': '#007A5F', // Updated to Green PMS 341
        'strapi-gray-bg': '#F0F2F5',
        'strapi-light-gray': '#E5E7EB',
        'text-dark-gray': '#374151',
        'text-medium-gray': '#666F74', // Updated to Grey PMS 431
        'text-light-gray': '#9CA3AF',
        'proposal-border': '#D1D5DB',
        'proposal-bg': '#FFFFFF',
        // 'brand-blue': '#008DD6', // Removed as per instruction to only update green/grey
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
  ],
};