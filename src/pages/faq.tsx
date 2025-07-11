// src/pages/faq.tsx - FAQ PAGE WITH COLLAPSIBLE SECTIONS
import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { 
  QuestionMarkCircleIcon, 
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CogIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  const faqData: FAQItem[] = [
    // Getting Started
    {
      id: "getting-started-1",
      category: "getting-started",
      question: "How do I create an account and get started?",
      answer: "To create an account, click the 'Sign Up' button on the login page. You'll need to provide your work email address, create a password, and verify your email. Once verified, you can start uploading and organizing your documents immediately."
    },
    {
      id: "getting-started-2",
      category: "getting-started",
      question: "What file types are supported for upload?",
      answer: "We support a wide range of file types including PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, PNG, and many others. Files must be under 100MB in size. For a complete list of supported formats, check our documentation."
    },
    {
      id: "getting-started-3",
      category: "getting-started",
      question: "How do I navigate the platform interface?",
      answer: "The platform features an intuitive sidebar navigation with main sections: Dashboard (overview), Content Library (all documents), and Bookmarks (saved items). Use the search bar at the top to quickly find documents, and the filter sidebar to narrow down results."
    },

    // Document Management
    {
      id: "documents-1",
      category: "documents",
      question: "How do I organize my documents effectively?",
      answer: "Documents are automatically categorized by type, industry, region, and other metadata. You can also use tags, create custom folders, and bookmark important documents. The advanced search and filter options help you quickly locate specific documents."
    },
    {
      id: "documents-2",
      category: "documents",
      question: "Can I collaborate with team members on documents?",
      answer: "Yes! You can share documents with team members, add comments, and track document versions. Team members with appropriate permissions can view, edit, or manage shared documents based on their access level."
    },
    {
      id: "documents-3",
      category: "documents",
      question: "How do I search for specific documents?",
      answer: "Use the search bar at the top of the page to search by keywords, document titles, client names, or content. You can also use advanced filters on the left sidebar to narrow results by document type, date range, industry, region, and more."
    },
    {
      id: "documents-4",
      category: "documents",
      question: "What happens to my documents if I delete them?",
      answer: "Deleted documents are moved to a trash folder where they remain for 30 days before permanent deletion. During this period, you can restore them. After 30 days, documents are permanently deleted and cannot be recovered."
    },

    // Account & Security
    {
      id: "security-1",
      category: "security",
      question: "How secure is my data on the platform?",
      answer: "We use enterprise-grade security measures including SSL encryption, regular security audits, and secure data centers. Your documents are encrypted both in transit and at rest. We also implement role-based access controls and regular backups."
    },
    {
      id: "security-2",
      category: "security",
      question: "Can I control who has access to my documents?",
      answer: "Absolutely. You have full control over document permissions. You can set documents as private, share with specific team members, or make them accessible to your entire organization. Permissions can be modified at any time."
    },
    {
      id: "security-3",
      category: "security",
      question: "How do I change my password or update account settings?",
      answer: "Click on your profile icon in the top right corner and select 'Account Settings'. From there, you can update your password, email preferences, notification settings, and other account details."
    },

    // Troubleshooting
    {
      id: "troubleshooting-1",
      category: "troubleshooting",
      question: "Why is my document upload failing?",
      answer: "Upload failures are usually due to file size (over 100MB), unsupported file type, or network connectivity issues. Check your internet connection, ensure the file is under the size limit, and verify it's a supported format. If issues persist, contact support."
    },
    {
      id: "troubleshooting-2",
      category: "troubleshooting",
      question: "The search function isn't finding my documents. What should I do?",
      answer: "First, check if you're using the correct keywords or try broader search terms. Ensure you haven't accidentally applied filters that exclude your documents. If you recently uploaded documents, wait a few minutes for indexing to complete."
    },
    {
      id: "troubleshooting-3",
      category: "troubleshooting",
      question: "I'm experiencing slow performance. How can I improve it?",
      answer: "Clear your browser cache and cookies, ensure you're using a supported browser (Chrome, Firefox, Safari, Edge), and check your internet connection. If you have many browser tabs open, try closing unnecessary ones. For persistent issues, contact our support team."
    },

    // Features
    {
      id: "features-1",
      category: "features",
      question: "What are bookmarks and how do I use them?",
      answer: "Bookmarks allow you to save important documents for quick access later. Click the bookmark icon on any document card to save it. Access all your bookmarked documents from the 'Bookmarks' section in the sidebar navigation."
    },
    {
      id: "features-2",
      category: "features",
      question: "Can I download multiple documents at once?",
      answer: "Yes! Use the checkbox selection feature to select multiple documents, then click the 'Download' button in the bulk actions toolbar. The system will create a ZIP file containing all selected documents."
    },
    {
      id: "features-3",
      category: "features",
      question: "Is there a mobile app available?",
      answer: "Currently, we offer a responsive web interface that works well on mobile devices. While we don't have a dedicated mobile app yet, you can access all features through your mobile browser. A native mobile app is planned for future release."
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', icon: QuestionMarkCircleIcon, count: faqData.length },
    { id: 'getting-started', name: 'Getting Started', icon: UserGroupIcon, count: faqData.filter(item => item.category === 'getting-started').length },
    { id: 'documents', name: 'Document Management', icon: DocumentTextIcon, count: faqData.filter(item => item.category === 'documents').length },
    { id: 'security', name: 'Security & Privacy', icon: ShieldCheckIcon, count: faqData.filter(item => item.category === 'security').length },
    { id: 'features', name: 'Features', icon: CogIcon, count: faqData.filter(item => item.category === 'features').length },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: ExclamationCircleIcon, count: faqData.filter(item => item.category === 'troubleshooting').length }
  ];

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
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
        <title>FAQ - Commercial Content Hub</title>
        <meta name="description" content="Frequently Asked Questions about Commercial Content Hub - Find answers to common questions about using our platform." />
      </Head>

      <Layout {...layoutProps}>
        <div className="max-w-6xl mx-auto py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-erm-primary rounded-full mb-6">
              <QuestionMarkCircleIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-text-dark-gray mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-text-medium-gray max-w-2xl mx-auto">
              Find answers to common questions about using the Commercial Content Hub. 
              Can't find what you're looking for? Contact our support team.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
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

            {/* FAQ Content */}
            <div className="lg:col-span-3">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <QuestionMarkCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-dark-gray mb-2">No questions found</h3>
                  <p className="text-text-medium-gray">
                    Try adjusting your search terms or selecting a different category.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((item) => {
                    const isOpen = openItems.includes(item.id);
                    return (
                      <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                        >
                          <h3 className="text-lg font-semibold text-text-dark-gray pr-4">
                            {item.question}
                          </h3>
                          {isOpen ? (
                            <ChevronUpIcon className="h-5 w-5 text-text-medium-gray flex-shrink-0" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-text-medium-gray flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4">
                            <div className="border-t border-gray-100 pt-4">
                              <p className="text-text-medium-gray leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-12 bg-gradient-to-r from-erm-primary to-erm-dark rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-lg mb-6 opacity-90">
              Our support team is here to help you get the most out of Commercial Content Hub.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@commercialcontenthub.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-erm-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Email Support
              </a>
              <Link
                href="/useful-links"
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-white rounded-lg font-semibold hover:bg-white hover:text-erm-primary transition-colors duration-200"
              >
                Browse Resources
              </Link>
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

export default FAQPage;