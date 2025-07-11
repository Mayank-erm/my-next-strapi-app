// src/pages/terms-of-service.tsx - COMPLETE TERMS OF SERVICE PAGE
import React from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { 
  DocumentTextIcon, 
  UserIcon, 
  ExclamationTriangleIcon, 
  ShieldCheckIcon,
  CogIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const TermsOfServicePage: React.FC = () => {
  const lastUpdated = "December 15, 2024";
  const effectiveDate = "January 1, 2025";

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: CheckCircleIcon,
      content: [
        "By accessing and using the Commercial Content Hub platform, you accept and agree to be bound by these Terms of Service",
        "If you do not agree to these terms, you may not use our services",
        "We reserve the right to modify these terms at any time with notice to users",
        "Continued use of the platform after changes constitutes acceptance of new terms"
      ]
    },
    {
      id: "user-accounts",
      title: "User Accounts and Responsibilities",
      icon: UserIcon,
      content: [
        "You must provide accurate and complete information when creating an account",
        "You are responsible for maintaining the confidentiality of your account credentials",
        "You must notify us immediately of any unauthorized use of your account",
        "You are solely responsible for all activities that occur under your account",
        "Each user must be authorized by their organization to access and use the platform"
      ]
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use Policy",
      icon: ShieldCheckIcon,
      content: [
        "Use the platform only for lawful business purposes",
        "Do not upload or share malicious content, viruses, or harmful code",
        "Respect intellectual property rights of all content on the platform",
        "Do not attempt to gain unauthorized access to any part of the system",
        "Do not interfere with or disrupt the platform's functionality",
        "Maintain confidentiality of sensitive business information"
      ]
    },
    {
      id: "content-ownership",
      title: "Content and Intellectual Property",
      icon: DocumentTextIcon,
      content: [
        "You retain ownership of all content you upload to the platform",
        "You grant us a license to store, process, and display your content as necessary to provide our services",
        "You must have proper rights and permissions for all content you upload",
        "Our platform software and features are protected by intellectual property laws",
        "You may not copy, modify, or reverse engineer our platform software"
      ]
    },
    {
      id: "service-availability",
      title: "Service Availability and Modifications",
      icon: CogIcon,
      content: [
        "We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service",
        "Scheduled maintenance will be announced in advance when possible",
        "We reserve the right to modify or discontinue features with reasonable notice",
        "Emergency maintenance may occur without advance notice",
        "We are not liable for temporary service interruptions or data loss during maintenance"
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
        <title>Terms of Service - Commercial Content Hub</title>
        <meta name="description" content="Terms of Service for Commercial Content Hub - Understand your rights and responsibilities when using our platform." />
      </Head>

      <Layout {...layoutProps}>
        <div className="max-w-4xl mx-auto py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-erm-primary rounded-full mb-6">
              <DocumentTextIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-text-dark-gray mb-4">Terms of Service</h1>
            <p className="text-lg text-text-medium-gray max-w-2xl mx-auto">
              These terms govern your use of the Commercial Content Hub platform. 
              Please read them carefully as they form a legal agreement between you and our service.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-text-medium-gray">
              <div className="flex items-center">
                <InformationCircleIcon className="h-4 w-4 mr-2" />
                Last updated: {lastUpdated}
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-600" />
                Effective: {effectiveDate}
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Important Legal Agreement</h3>
                <p className="text-yellow-800 text-sm leading-relaxed">
                  These Terms of Service constitute a legally binding agreement. By using our platform, 
                  you acknowledge that you have read, understood, and agree to be bound by these terms. 
                  If you are using this service on behalf of an organization, you represent that you have 
                  the authority to bind that organization to these terms.
                </p>
              </div>
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

          {/* Limitation of Liability */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-8">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-3">Limitation of Liability</h3>
                <div className="text-red-800 text-sm space-y-2">
                  <p>• We provide the platform "as is" without warranties of any kind</p>
                  <p>• We are not liable for any indirect, incidental, or consequential damages</p>
                  <p>• Our total liability is limited to the amount paid for our services</p>
                  <p>• Users are responsible for backing up their important data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Termination */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm mt-8">
            <h2 className="text-2xl font-bold text-text-dark-gray mb-6">Account Termination</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-text-dark-gray mb-3">By You</h3>
                <p className="text-text-medium-gray text-sm leading-relaxed mb-3">
                  You may terminate your account at any time by contacting our support team or using the account deletion feature.
                </p>
                <ul className="text-sm text-text-medium-gray space-y-1">
                  <li>• 30-day data retention period</li>
                  <li>• Export options available</li>
                  <li>• No termination fees</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-dark-gray mb-3">By Us</h3>
                <p className="text-text-medium-gray text-sm leading-relaxed mb-3">
                  We may terminate accounts for violations of these terms or for business reasons with appropriate notice.
                </p>
                <ul className="text-sm text-text-medium-gray space-y-1">
                  <li>• 30-day notice for business reasons</li>
                  <li>• Immediate for policy violations</li>
                  <li>• Data export assistance provided</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Governing Law */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <div className="flex items-start">
              <InformationCircleIcon className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Governing Law and Jurisdiction</h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved 
                  through binding arbitration or in the courts of [Your Jurisdiction]. We both agree to waive 
                  rights to jury trial and to participate in class action lawsuits.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm mt-8">
            <h2 className="text-2xl font-bold text-text-dark-gray mb-6">Questions or Concerns?</h2>
            <p className="text-text-medium-gray mb-6">
              If you have any questions about these Terms of Service, please don't hesitate to contact us:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-text-dark-gray mb-2">Legal Department</h3>
                <p className="text-text-medium-gray text-sm">legal@commercialcontenthub.com</p>
              </div>
              <div>
                <h3 className="font-semibold text-text-dark-gray mb-2">Customer Support</h3>
                <p className="text-text-medium-gray text-sm">support@commercialcontenthub.com</p>
              </div>
              <div>
                <h3 className="font-semibold text-text-dark-gray mb-2">Business Inquiries</h3>
                <p className="text-text-medium-gray text-sm">business@commercialcontenthub.com</p>
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
              <Link href="/privacy-policy" className="text-text-medium-gray hover:text-erm-primary transition-colors duration-200">
                Privacy Policy
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

export default TermsOfServicePage;