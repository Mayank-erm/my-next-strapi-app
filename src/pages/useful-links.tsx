// src/pages/useful-links.tsx - COMPLETE USEFUL LINKS RESOURCE PAGE
import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { 
  LinkIcon, 
  ArrowTopRightOnSquareIcon,
  BookOpenIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface ResourceLink {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  type: 'internal' | 'external';
  icon?: React.ComponentType<any>;
}

const UsefulLinksPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const resourceLinks: ResourceLink[] = [
    // Documentation & Guides
    {
      id: "doc-1",
      category: "documentation",
      type: "internal",
      title: "User Guide & Documentation",
      description: "Comprehensive guide covering all platform features, workflows, and best practices for document management.",
      url: "/documentation",
      icon: BookOpenIcon
    },
    {
      id: "doc-2",
      category: "documentation",
      type: "internal",
      title: "API Documentation",
      description: "Technical documentation for developers integrating with our platform APIs and webhooks.",
      url: "/api-docs",
      icon: CogIcon
    },
    {
      id: "doc-3",
      category: "documentation",
      type: "external",
      title: "Best Practices for Document Organization",
      description: "Industry best practices and guidelines for organizing commercial documents effectively.",
      url: "https://example.com/best-practices",
      icon: AcademicCapIcon
    },

    // Training & Tutorials
    {
      id: "training-1",
      category: "training",
      type: "external",
      title: "Video Tutorial Series",
      description: "Step-by-step video tutorials covering platform navigation, document upload, and advanced features.",
      url: "https://youtube.com/commercialcontenthub",
      icon: VideoCameraIcon
    },
    {
      id: "training-2",
      category: "training",
      type: "internal",
      title: "Interactive Platform Tour",
      description: "Take a guided tour of the platform to familiarize yourself with key features and workflows.",
      url: "/platform-tour",
      icon: GlobeAltIcon
    },
    {
      id: "training-3",
      category: "training",
      type: "external",
      title: "Webinar Recordings",
      description: "Access recordings of our monthly webinars featuring platform updates and advanced tips.",
      url: "https://webinars.commercialcontenthub.com",
      icon: VideoCameraIcon
    },

    // Support Resources
    {
      id: "support-1",
      category: "support",
      type: "internal",
      title: "Knowledge Base",
      description: "Searchable knowledge base with answers to common questions and troubleshooting guides.",
      url: "/knowledge-base",
      icon: BookOpenIcon
    },
    {
      id: "support-2",
      category: "support",
      type: "external",
      title: "Community Forum",
      description: "Connect with other users, share tips, and get help from the community.",
      url: "https://community.commercialcontenthub.com",
      icon: ChatBubbleLeftRightIcon
    },
    {
      id: "support-3",
      category: "support",
      type: "external",
      title: "Contact Support",
      description: "Get direct help from our support team via email, chat, or phone.",
      url: "mailto:support@commercialcontenthub.com",
      icon: ChatBubbleLeftRightIcon
    },

    // Industry Resources
    {
      id: "industry-1",
      category: "industry",
      type: "external",
      title: "Document Management Standards",
      description: "Industry standards and compliance guidelines for document management systems.",
      url: "https://iso.org/document-management",
      icon: DocumentTextIcon
    },
    {
      id: "industry-2",
      category: "industry",
      type: "external",
      title: "Commercial Best Practices",
      description: "Commercial document lifecycle management best practices and case studies.",
      url: "https://commercialbestpractices.org",
      icon: BuildingOfficeIcon
    },
    {
      id: "industry-3",
      category: "industry",
      type: "external",
      title: "Data Security Guidelines",
      description: "Comprehensive guidelines for maintaining data security in commercial environments.",
      url: "https://security.commercialcontenthub.com",
      icon: ShieldCheckIcon
    },

    // Tools & Templates
    {
      id: "tools-1",
      category: "tools",
      type: "internal",
      title: "Document Templates",
      description: "Download templates for common commercial documents, proposals, and reports.",
      url: "/templates",
      icon: DocumentTextIcon
    },
    {
      id: "tools-2",
      category: "tools",
      type: "external",
      title: "File Conversion Tools",
      description: "Online tools for converting documents between different formats (PDF, Word, Excel, etc.).",
      url: "https://tools.commercialcontenthub.com/converter",
      icon: CogIcon
    },
    {
      id: "tools-3",
      category: "tools",
      type: "external",
      title: "Productivity Extensions",
      description: "Browser extensions and plugins to enhance your document management workflow.",
      url: "https://extensions.commercialcontenthub.com",
      icon: CogIcon
    },

    // Additional Resources
    {
      id: "additional-1",
      category: "training",
      type: "external",
      title: "Mobile App Guide",
      description: "Learn how to access and use Commercial Content Hub features on mobile devices.",
      url: "https://mobile.commercialcontenthub.com",
      icon: GlobeAltIcon
    },
    {
      id: "additional-2",
      category: "support",
      type: "internal",
      title: "System Status",
      description: "Check the current operational status of all platform services and features.",
      url: "/status",
      icon: CogIcon
    },
    {
      id: "additional-3",
      category: "industry",
      type: "external",
      title: "Compliance Resources",
      description: "Information about GDPR, CCPA, and other data protection regulations.",
      url: "https://compliance.commercialcontenthub.com",
      icon: ShieldCheckIcon
    }
  ];

  const categories = [
    { id: 'all', name: 'All Resources', icon: LinkIcon, count: resourceLinks.length },
    { id: 'documentation', name: 'Documentation', icon: BookOpenIcon, count: resourceLinks.filter(item => item.category === 'documentation').length },
    { id: 'training', name: 'Training & Tutorials', icon: AcademicCapIcon, count: resourceLinks.filter(item => item.category === 'training').length },
    { id: 'support', name: 'Support', icon: ChatBubbleLeftRightIcon, count: resourceLinks.filter(item => item.category === 'support').length },
    { id: 'industry', name: 'Industry Resources', icon: BuildingOfficeIcon, count: resourceLinks.filter(item => item.category === 'industry').length },
    { id: 'tools', name: 'Tools & Templates', icon: CogIcon, count: resourceLinks.filter(item => item.category === 'tools').length }
  ];

  const filteredLinks = resourceLinks.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const layoutProps = {
    searchTerm: '',
    isLoading: false,
    onResultClick: () => {},
    activeContentType: '',
    activeServiceLines: [],
    activeIndustries: [],
    activeRegions: [],
    activeDate: '',
    onContentTypeChange: () => {},
    onServiceLineChange: () => {},
    onIndustryChange: () => {},
    onRegionChange: () => {},
    onDateChange: () => {},
    onSearchInFiltersChange: () => {},
    onClearAllFilters: () => {}
  };

  return (
    <>
      <Head>
        <title>Useful Links - Commercial Content Hub</title>
        <meta name="description" content="Useful resources, documentation, training materials, and tools for Commercial Content Hub users." />
      </Head>

      <Layout {...layoutProps}>
        <div className="max-w-6xl mx-auto py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-erm-primary rounded-full mb-6">
              <LinkIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-text-dark-gray mb-4">Useful Links & Resources</h1>
            <p className="text-lg text-text-medium-gray max-w-2xl mx-auto">
              Discover helpful resources, documentation, training materials, and tools to enhance your 
              experience with the Commercial Content Hub platform.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-erm-primary focus:border-erm-primary transition-colors duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-text-dark-gray mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                          activeCategory === category.id
                            ? 'bg-erm-primary text-white'
                            : 'text-text-medium-gray hover:bg-gray-50 hover:text-erm-primary'
                        }`}
                      >
                        <div className="flex items-center">
                          <IconComponent className="h-5 w-5 mr-3" />
                          <span className="font-medium text-sm">{category.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activeCategory === category.id
                            ? 'bg-white bg-opacity-20'
                            : 'bg-gray-200'
                        }`}>
                          {category.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Resources Content */}
            <div className="lg:col-span-3">
              {filteredLinks.length === 0 ? (
                <div className="text-center py-12">
                  <LinkIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-dark-gray mb-2">No resources found</h3>
                  <p className="text-text-medium-gray">
                    Try adjusting your search terms or selecting a different category.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredLinks.map((resource) => {
                    const IconComponent = resource.icon || DocumentTextIcon;
                    const isExternal = resource.type === 'external';
                    
                    return (
                      <div key={resource.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-erm-primary rounded-lg flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex items-center space-x-2">
                            {isExternal && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                External
                              </span>
                            )}
                            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400 group-hover:text-erm-primary transition-colors duration-200" />
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-text-dark-gray mb-2 group-hover:text-erm-primary transition-colors duration-200">
                          {resource.title}
                        </h3>
                        
                        <p className="text-text-medium-gray text-sm leading-relaxed mb-4">
                          {resource.description}
                        </p>
                        
                        {isExternal ? (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-erm-primary hover:text-erm-dark font-medium text-sm transition-colors duration-200"
                          >
                            Visit Resource
                            <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                          </a>
                        ) : (
                          <Link
                            href={resource.url}
                            className="inline-flex items-center text-erm-primary hover:text-erm-dark font-medium text-sm transition-colors duration-200"
                          >
                            View Resource
                            <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Access Section */}
          <div className="mt-12 bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-text-dark-gray mb-6 text-center">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-text-dark-gray mb-2">Need Help?</h3>
                <p className="text-text-medium-gray text-sm mb-4">
                  Get immediate assistance from our support team
                </p>
                <a
                  href="mailto:support@commercialcontenthub.com"
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                >
                  Contact Support
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                </a>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpenIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-text-dark-gray mb-2">Documentation</h3>
                <p className="text-text-medium-gray text-sm mb-4">
                  Comprehensive guides and API documentation
                </p>
                <Link
                  href="/documentation"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse Docs
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AcademicCapIcon className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-text-dark-gray mb-2">Training</h3>
                <p className="text-text-medium-gray text-sm mb-4">
                  Video tutorials and interactive learning
                </p>
                <a
                  href="https://training.commercialcontenthub.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                >
                  Start Learning
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>

          {/* Featured Resources */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-text-dark-gray mb-6">Featured Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <BookOpenIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Getting Started Guide</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Complete walkthrough for new users to get up and running quickly.
                </p>
                <Link
                  href="/getting-started"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Read Guide
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <VideoCameraIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Video Tutorials</h3>
                <p className="text-green-700 text-sm mb-4">
                  Learn platform features through our comprehensive video library.
                </p>
                <a
                  href="https://youtube.com/commercialcontenthub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-green-600 hover:text-green-800 font-medium text-sm"
                >
                  Watch Videos
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                </a>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <CogIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-purple-900 mb-2">API Reference</h3>
                <p className="text-purple-700 text-sm mb-4">
                  Technical documentation for developers and integrations.
                </p>
                <Link
                  href="/api-docs"
                  className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium text-sm"
                >
                  View API Docs
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>

          {/* Community Section */}
          <div className="mt-12 bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-text-dark-gray mb-4">Join Our Community</h2>
              <p className="text-text-medium-gray max-w-2xl mx-auto">
                Connect with other Commercial Content Hub users, share best practices, and get help from our community.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-erm-primary transition-colors duration-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-dark-gray">Community Forum</h3>
                  <p className="text-text-medium-gray text-sm">Ask questions and share knowledge</p>
                </div>
                <a
                  href="https://community.commercialcontenthub.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                </a>
              </div>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-erm-primary transition-colors duration-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <AcademicCapIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-dark-gray">Monthly Webinars</h3>
                  <p className="text-text-medium-gray text-sm">Live training sessions and Q&A</p>
                </div>
                <a
                  href="https://webinars.commercialcontenthub.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Suggest a Resource */}
          <div className="mt-12 bg-gradient-to-r from-erm-primary to-erm-dark rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Missing a Resource?</h2>
            <p className="text-lg mb-6 opacity-90">
              Know of a helpful resource that should be included? Let us know and we'll consider adding it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:feedback@commercialcontenthub.com?subject=Resource Suggestion"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-erm-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Suggest a Resource
              </a>
              <a
                href="mailto:partnership@commercialcontenthub.com?subject=Partnership Inquiry"
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-white rounded-lg font-semibold hover:bg-white hover:text-erm-primary transition-colors duration-200"
              >
                Partner with Us
              </a>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-12 pt-8 border-t border-gray-200">
            <Link 
              href="/"
              className="mb-4 sm:mb-0 inline-flex items-center text-erm-primary hover:text-erm-dark transition-colors duration-200"
            >
              ← Back to Dashboard
            </Link>
            <div className="flex space-x-6">
              <Link href="/faq" className="text-text-medium-gray hover:text-erm-primary transition-colors duration-200">
                FAQ
              </Link>
              <Link href="/privacy-policy" className="text-text-medium-gray hover:text-erm-primary transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-text-medium-gray hover:text-erm-primary transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default UsefulLinksPage;