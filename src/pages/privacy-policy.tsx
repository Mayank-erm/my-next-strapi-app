// src/pages/privacy-policy.tsx - PRIVACY POLICY PAGE
import React from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  CogIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = "December 15, 2024";

  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: DocumentTextIcon,
      content: [
        "Personal information such as name, email address, and job title when you create an account",
        "Usage data including pages visited, search queries, and time spent on the platform",
        "Document metadata and interaction history for improving our services",
        "Technical information such as IP address, browser type, and device information"
      ]
    },
    {
      id: "how-we-use",
      title: "How We Use Your Information",
      icon: CogIcon,
      content: [
        "To provide and maintain our document management services",
        "To personalize your experience and improve our platform",
        "To communicate with you about updates, security alerts, and support",
        "To analyze usage patterns and enhance platform functionality",
        "To ensure security and prevent fraudulent activities"
      ]
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      icon: UserGroupIcon,
      content: [
        "We do not sell, trade, or rent your personal information to third parties",
        "Information may be shared with team members within your organization",
        "We may share aggregated, non-personally identifiable information for analytics",
        "Legal disclosure may occur if required by law or to protect our rights"
      ]
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: ShieldCheckIcon,
      content: [
        "We implement industry-standard security measures to protect your data",
        "All data transmission is encrypted using SSL/TLS protocols",
        "Regular security audits and vulnerability assessments are conducted",
        "Access to personal information is restricted to authorized personnel only",
        "We maintain backup systems to prevent data loss"
      ]
    }
  ];

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
        <title>Privacy Policy - Commercial Content Hub</title>
        <meta name="description" content="Privacy Policy for Commercial Content Hub - Learn how we protect and handle your personal information." />
      </Head>

      <Layout {...layoutProps}>
        <div className="max-w-4xl mx-auto py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-erm-primary rounded-full mb-6">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-text-dark-gray mb-4">Privacy Policy</h1>
            <p className="text-lg text-text-medium-gray max-w-2xl mx-auto">
              We are committed to protecting your privacy and ensuring the security of your personal information. 
              This policy explains how we collect, use, and safeguard your data.
            </p>
            <div className="mt-4 inline-flex items-center text-sm text-text-medium-gray">
              <InformationCircleIcon className="h-4 w-4 mr-2" />
              Last updated: {lastUpdated}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-text-dark-gray mb-4">Quick Navigation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center p-3 rounded-lg hover:bg-white transition-colors duration-200 text-text-medium-gray hover:text-erm-primary"
                >
                  <section.icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{section.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Introduction */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Important Notice</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  This Privacy Policy applies to all users of the Commercial Content Hub platform. 
                  By using our services, you consent to the collection and use of information as described in this policy. 
                  We encourage you to read this policy carefully and contact us if you have any questions.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <section key={section.id} id={section.id} className="scroll-mt-8">
                  <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-erm-primary rounded-lg flex items-center justify-center mr-4">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-text-dark-gray">{section.title}</h2>
                        <div className="text-sm text-text-medium-gray">Section {index + 1}</div>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <div className="w-2 h-2 bg-erm-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-text-medium-gray leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              );
            })}
          </div>

          {/* Data Retention */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm mt-8">
            <h2 className="text-2xl font-bold text-text-dark-gray mb-6">Data Retention</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-text-dark-gray mb-3">Account Data</h3>
                <p className="text-text-medium-gray text-sm leading-relaxed">
                  We retain your account information for as long as your account is active or as needed to provide you services.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-dark-gray mb-3">Usage Data</h3>
                <p className="text-text-medium-gray text-sm leading-relaxed">
                  Usage and analytics data is typically retained for 24 months to help us improve our services.
                </p>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">Your Rights</h3>
                <div className="text-yellow-800 text-sm space-y-2">
                  <p>• Access: You can request access to your personal information</p>
                  <p>• Correction: You can request correction of inaccurate information</p>
                  <p>• Deletion: You can request deletion of your personal information</p>
                  <p>• Portability: You can request transfer of your data to another service</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm mt-8">
            <h2 className="text-2xl font-bold text-text-dark-gray mb-6">Contact Us</h2>
            <p className="text-text-medium-gray mb-6">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-text-dark-gray mb-2">Data Protection Officer</h3>
                <p className="text-text-medium-gray text-sm">privacy@commercialcontenthub.com</p>
              </div>
              <div>
                <h3 className="font-semibold text-text-dark-gray mb-2">Support Team</h3>
                <p className="text-text-medium-gray text-sm">support@commercialcontenthub.com</p>
              </div>
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
              <Link href="/terms-of-service" className="text-text-medium-gray hover:text-erm-primary transition-colors duration-200">
                Terms of Service
              </Link>
              <Link href="/faq" className="text-text-medium-gray hover:text-erm-primary transition-colors duration-200">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default PrivacyPolicyPage;