// src/pages/index.tsx
import React from 'react';
import Layout from '@/components/Layout';
import Carousel from '@/components/Carousel';
import ProposalCard from '@/components/ProposalCard';
import { GetServerSideProps } from 'next';

// --- CHANGE 1: Updated StrapiProposal interface to match the flat structure from your console logs ---
interface StrapiProposal {
  id: number;
  // These fields are directly on the object, not nested under 'attributes'
  opportunityNumber: string;
  proposalName: string;
  clientName: string;
  pstatus: string; // Using pstatus as per your Strapi field
  value: string | number; // Allow value to be string or number based on Strapi output
  description?: any[] | null; // Allow description to be optional, meaning it can be undefined or null
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  // Add other fields like proposedBy, chooseEmployee as per your actual data
  proposedBy: string | null;
  chooseEmployee: number | null; // Assuming it's the ID of the related employee
}

interface HomePageProps {
  proposals: StrapiProposal[];
  error?: string | null;
}

// This component displays the main content of the home page.
const HomePage: React.FC<HomePageProps> = ({ proposals, error }) => {
  // console.log('[HomePage Component] Props received - proposals:', proposals);
  // console.log('[HomePage Component] Props received - error:', error);

  return (
    <Layout>
      {/* Carousel Section */}
      <Carousel />

      <h2 className="text-2xl font-bold text-text-dark-gray mb-6">Popular resources</h2>

      {error && ( // Only show error if it's not null/undefined
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {/* Placeholder for Filters and Sort options */}
      <div className="flex justify-end items-center mb-4 space-x-4 text-text-medium-gray text-sm">
        <span className="font-semibold hidden sm:inline">Filters</span>
        <select className="p-2 border rounded-lg bg-white">
          <option>All Types</option>
        </select>
        <span className="font-semibold">Sort by:</span>
        <select className="p-2 border rounded-lg bg-white">
          <option>Published Date</option>
        </select>
        <div className="flex space-x-2">
          {/* Grid/List view icons */}
          <button className="p-2 border rounded-lg bg-white hover:bg-gray-100">
            {/* Grid Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM13 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
            </svg>
          </button>
          <button className="p-2 border rounded-lg bg-white hover:bg-gray-100">
            {/* List Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content grid - adjusted for responsiveness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {proposals.length > 0 ? (
          proposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))
        ) : (
          <p className="col-span-full text-center text-text-medium-gray">No published proposals found.</p>
        )}
      </div>
    </Layout>
  );
};

// getServerSideProps fetches data on each request to the server.
export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  const STRAPI_API_URL = 'http://localhost:1337/api/proposals';
  let proposals: StrapiProposal[] = [];
  let error: string | null = null;

  // console.log('[getServerSideProps] Attempting to fetch from Strapi:', STRAPI_API_URL);

  try {
    const response = await fetch(`${STRAPI_API_URL}?filters[publishedAt][$notNull]=true&populate=chooseEmployee`);
    
    // console.log('[getServerSideProps] Strapi API Response Status:', response.status);
    // console.log('[getServerSideProps] Strapi API Response OK:', response.ok);

    if (!response.ok) {
      throw new Error(`Strapi API returned status ${response.status}`);
    }
    const data = await response.json();
    
    // console.log('[getServerSideProps] Raw data from Strapi:', JSON.stringify(data, null, 2));
    
    proposals = data.data || [];

    // console.log('[getServerSideProps] Processed proposals array (before returning):', JSON.stringify(proposals, null, 2));

  } catch (err: any) {
    console.error('[getServerSideProps] Failed to fetch proposals from Strapi:', err);
    error = `Failed to load proposals: ${err.message}. Please ensure Strapi is running and accessible at ${STRAPI_API_URL}.`;
  }

  return {
    props: {
      proposals,
      error,
    },
  };
};

export default HomePage;