// src/pages/help-support.tsx - COMPREHENSIVE HELP & SUPPORT PAGE WITH CONTACT FORM
import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { 
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  LinkIcon,
  DocumentTextIcon,
  UserCircleIcon,
  CogIcon,
  ShieldCheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface FormData {
  name: string;
  email: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  message: string;
}

const HelpSupportPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    priority: 'medium',
    category: 'general',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const supportCategories = [
    { value: 'general', label: 'General Question' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'account', label: 'Account & Billing' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Report' },
    { value: 'training', label: 'Training & Documentation' },
    { value: 'integration', label: 'API & Integration' },
    { value: 'security', label: 'Security & Privacy' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', description: 'General questions, non-urgent' },
    { value: 'medium', label: 'Medium', description: 'Standard support request' },
    { value: 'high', label: 'High', description: 'Impacts productivity' },
    { value: 'urgent', label: 'Urgent', description: 'System down, critical issue' }
  ];

  const quickHelpOptions = [
    {
      title: 'Frequently Asked Questions',
      description: 'Find answers to common questions about using the platform',
      icon: QuestionMarkCircleIcon,
      href: '/faq',
      color: 'blue'
    },
    {
      title: 'Useful Links & Resources',
      description: 'Browse documentation, tutorials, and helpful resources',
      icon: LinkIcon,
      href: '/useful-links',
      color: 'green'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides for platform features',
      icon: DocumentTextIcon,
      href: 'https://youtube.com/commercialcontenthub',
      color: 'purple',
      external: true
    },
    {
      title: 'System Status',
      description: 'Check current platform status and service health',
      icon: CogIcon,
      href: '/status',
      color: 'orange'
    }
  ];

  const supportOptions = [
    {
      title: 'Email Support',
      description: '24/7 support via email',
      response: 'Response within 4-6 hours',
      icon: EnvelopeIcon,
      contact: 'support@commercialcontenthub.com',
      available: true
    },
    {
    title: 'Teams Chat',
    description: 'Connect with support via Microsoft Teams',
    response: 'Available Mon-Fri 9AM-6PM EST',
    icon: ChatBubbleLeftRightIcon,
    contact: 'Open Teams Chat',
    available: true,
    action: () => window.open('msteams://teams.microsoft.com/l/chat/0/0?users=support@commercialcontenthub.com', '_blank')
    },
    {
      title: 'Phone Support',
      description: 'Direct phone support for urgent issues',
      response: 'Business hours only',
      icon: PhoneIcon,
      contact: '+1 (555) 123-4567',
      available: false
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setSubmitMessage('Please enter your name');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setSubmitMessage('Please enter a valid email address');
      return false;
    }
    if (!formData.subject.trim()) {
      setSubmitMessage('Please enter a subject');
      return false;
    }
    if (!formData.message.trim()) {
      setSubmitMessage('Please describe your issue');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Send email via API route
      const response = await fetch('/api/send-support-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage('Your support request has been submitted successfully. We\'ll get back to you within 4-6 hours.');
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          priority: 'medium',
          category: 'general',
          message: ''
        });
      } else {
        throw new Error('Failed to send support request');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Failed to send your request. Please try again or contact us directly at support@commercialcontenthub.com');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <title>Help & Support - Commercial Content Hub</title>
        <meta name="description" content="Get help and support for Commercial Content Hub. Find answers, submit support requests, and access helpful resources." />
      </Head>

      <Layout {...layoutProps}>
        <div className="max-w-6xl mx-auto py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-erm-primary rounded-full mb-6">
              <QuestionMarkCircleIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-text-dark-gray mb-4">Help & Support</h1>
            <p className="text-lg text-text-medium-gray max-w-2xl mx-auto">
              We're here to help you get the most out of Commercial Content Hub. 
              Find answers, get support, or submit a request below.
            </p>
          </div>

          {/* Quick Help Options */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-text-dark-gray mb-6">Quick Help</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickHelpOptions.map((option) => {
                const IconComponent = option.icon;
                const colorClasses = {
                  blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-900',
                  green: 'from-green-50 to-green-100 border-green-200 text-green-900',
                  purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-900',
                  orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-900'
                };
                
                return option.external ? (
                  <a
                    key={option.title}
                    href={option.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-gradient-to-br ${colorClasses[option.color as keyof typeof colorClasses]} rounded-lg p-6 border hover:shadow-lg transition-all duration-200 group`}
                  >
                    <div className="flex items-center mb-4">
                      <IconComponent className="h-8 w-8 mr-3" />
                      <h3 className="font-semibold">{option.title}</h3>
                    </div>
                    <p className="text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                      {option.description}
                    </p>
                  </a>
                ) : (
                  <Link
                    key={option.title}
                    href={option.href}
                    className={`bg-gradient-to-br ${colorClasses[option.color as keyof typeof colorClasses]} rounded-lg p-6 border hover:shadow-lg transition-all duration-200 group`}
                  >
                    <div className="flex items-center mb-4">
                      <IconComponent className="h-8 w-8 mr-3" />
                      <h3 className="font-semibold">{option.title}</h3>
                    </div>
                    <p className="text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                      {option.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Support Options */}
        <div className="mb-12">
        <h2 className="text-2xl font-bold text-text-dark-gray mb-6">Contact Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportOptions.map((option) => {
            const IconComponent = option.icon;
            return (
                <div key={option.title} className={`bg-white rounded-lg border p-6 ${option.available ? 'border-gray-200' : 'border-gray-300 opacity-60'}`}>
                <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                    option.available ? 'bg-erm-primary' : 'bg-gray-400'
                    }`}>
                    <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                    <h3 className="font-semibold text-text-dark-gray">{option.title}</h3>
                    {!option.available && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        Coming Soon
                        </span>
                    )}
                    </div>
                </div>
                <p className="text-text-medium-gray text-sm mb-3">{option.description}</p>
                <p className="text-text-medium-gray text-xs mb-4 flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {option.response}
                </p>
                {option.available && (
                    <div className="text-erm-primary font-medium text-sm">
                    {option.action ? (
                        <button 
                        onClick={option.action} 
                        className="hover:text-erm-dark transition-colors duration-200 hover:underline"
                        >
                        {option.contact}
                        </button>
                    ) : (
                        <span>{option.contact}</span>
                    )}
                    </div>
                )}
                </div>
            );
            })}
        </div>
        </div>

          {/* Support Request Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-text-dark-gray mb-4">Submit a Support Request</h2>
              <p className="text-text-medium-gray">
                Can't find what you're looking for? Submit a support request and our team will get back to you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-dark-gray mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-erm-primary focus:border-erm-primary transition-colors duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-dark-gray mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-erm-primary focus:border-erm-primary transition-colors duration-200"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-text-dark-gray mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-erm-primary focus:border-erm-primary transition-colors duration-200"
                  placeholder="Brief description of your issue"
                />
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-text-dark-gray mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-erm-primary focus:border-erm-primary transition-colors duration-200"
                  >
                    {supportCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-text-dark-gray mb-2">
                    Priority Level
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-erm-primary focus:border-erm-primary transition-colors duration-200"
                  >
                    {priorityLevels.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label} - {priority.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-dark-gray mb-2">
                  Describe Your Issue *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-erm-primary focus:border-erm-primary transition-colors duration-200"
                  placeholder="Please provide as much detail as possible about your issue, including steps to reproduce if applicable..."
                />
              </div>

              {/* Submit Status */}
              {submitStatus !== 'idle' && (
                <div className={`rounded-lg p-4 ${
                  submitStatus === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start">
                    {submitStatus === 'success' ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                    )}
                    <p className={`text-sm ${
                      submitStatus === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {submitMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-medium-gray">
                  Fields marked with * are required
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-erm-primary hover:bg-erm-dark text-white hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-12 pt-8 border-t border-gray-200">
            <Link 
              href="/"
              className="mb-4 sm:mb-0 inline-flex items-center text-erm-primary hover:text-erm-dark transition-colors duration-200"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default HelpSupportPage;