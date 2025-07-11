// src/components/Footer.tsx - ENHANCED VERSION WITH FUNCTIONAL LINKS
import React from 'react';
import Link from 'next/link';
import { 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  QuestionMarkCircleIcon,
  LinkIcon,
  ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Privacy Policy',
      href: '/privacy-policy',
      icon: ShieldCheckIcon,
      description: 'How we protect your data'
    },
    {
      title: 'Terms of Service',
      href: '/terms-of-service',
      icon: DocumentTextIcon,
      description: 'Service terms and conditions'
    },
    {
      title: 'FAQ',
      href: '/faq',
      icon: QuestionMarkCircleIcon,
      description: 'Frequently asked questions'
    },
    {
      title: 'Useful Links',
      href: '/useful-links',
      icon: LinkIcon,
      description: 'Resources and references'
    }
  ];

  return (
    <footer className="bg-white border-t border-strapi-light-gray mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-erm-primary rounded-lg flex items-center justify-center mr-3">
                  <img src="/images/ERM_Vertical_Green_Black_RGB.svg" alt="Logo" className="w-6 h-6 filter brightness-0 invert" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-dark-gray">Commercial Content Hub</h3>
                  <p className="text-sm text-text-medium-gray">Document Management System</p>
                </div>
              </div>
              <p className="text-text-medium-gray text-sm leading-relaxed mb-6">
                A comprehensive platform for managing commercial documents, proposals, and resources. 
                Streamlining your document workflow with advanced search and organization capabilities.
              </p>
              <div className="flex space-x-4">
                <a href="https://uk.linkedin.com/company/erm" target="_blank"  rel="noopener noreferrer" className="text-text-medium-gray hover:text-erm-primary transition-colors duration-200">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://twitter.com/GlobalERM" target="_blank"  rel="noopener noreferrer" className="text-text-medium-gray hover:text-erm-primary transition-colors duration-200">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="https://www.youtube.com/c/ERMAPAC" target="_blank"  rel="noopener noreferrer" className="text-text-medium-gray hover:text-erm-primary transition-colors duration-200">
                  <span className="sr-only">YouTube</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-text-dark-gray mb-6">Quick Links</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="https://www.erm.com/" className="text-text-medium-gray hover:text-erm-primary transition-colors duration-200 text-sm flex items-center group" target="_blank">
                    <span>ERM</span>
                    <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
                <li>
                  <Link href="https://theermgroup.sharepoint.com/sites/minervahome" className="text-text-medium-gray hover:text-erm-primary transition-colors duration-200 text-sm flex items-center group" target="_blank">
                    <span>Minerva</span>
                    <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h4 className="text-lg font-semibold text-text-dark-gray mb-6">Support & Legal</h4>
              <ul className="space-y-4">
                {footerLinks.map((link) => {
                  const IconComponent = link.icon;
                  return (
                    <li key={link.href}>
                      <Link 
                        href={link.href} 
                        className="text-text-medium-gray hover:text-erm-primary transition-colors duration-200 text-sm flex items-center group"
                        title={link.description}
                      >
                        <IconComponent className="h-4 w-4 mr-2 opacity-70 group-hover:opacity-100 transition-opacity" />
                        <span>{link.title}</span>
                        <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-strapi-light-gray py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-text-medium-gray text-sm">
              <span>&copy; {currentYear} Commercial Content Hub. All rights reserved.</span>
            </div>
            
            <div className="flex items-center space-x-6 text-text-medium-gray text-xs">
              <span>Version 0.1.0</span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                System Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;