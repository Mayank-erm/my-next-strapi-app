// src/components/Footer.tsx (NEW FILE)
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-8 border-t border-strapi-light-gray mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center text-text-medium-gray text-sm">
        <p className="mb-4">
          &copy; {new Date().getFullYear()} Commercial Content Hub. All rights reserved.
        </p>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-strapi-green-light transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2">Privacy Policy</a>
          <a href="#" className="hover:text-strapi-green-light transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2">Terms of Service</a>
          <a href="#" className="hover:text-strapi-green-light transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2">Contact Us</a>
          <a href="#" className="hover:text-strapi-green-light transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2">Need Help?</a> {/* Moved from header */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;