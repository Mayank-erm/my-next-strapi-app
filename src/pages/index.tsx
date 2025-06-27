// src/pages/index.tsx (UPDATED)
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Carousel from '@/components/Carousel';
import ProposalCard from '@/components/ProposalCard';
import Pagination from '@/components/Pagination'; // Import Pagination component
import { GetServerSideProps } from 'next';

interface StrapiProposal {
  id: number;
  opportunityNumber: string;
  proposalName: string;
  clientName: string;
  pstatus: string;
  value: string | number;
  description?: any[] | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  proposedBy: string | null;
  chooseEmployee: number | null;
}

interface HomePageProps {
  proposals: StrapiProposal[];
  totalProposals: number; // Added to handle pagination
  currentPage: number; // Added to pass current page
  error?: string | null;
}

const ITEMS_PER_PAGE = 8; // Define how many proposals per page

const HomePage: React.FC<HomePageProps> = ({ proposals, totalProposals, currentPage, error }) => {
  const totalPages = Math.ceil(totalProposals / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    // This will trigger a new getServerSideProps call with the updated page
    window.location.href = `/?page=${page}`;
  };

  return (
    <Layout>
      <Carousel />

      <h2 className="text-2xl font-bold text-text-dark-gray mb-6">Popular resources</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

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
          <button className="p-2 border rounded-lg bg-white hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM13 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
            </svg>
          </button>
          <button className="p-2 border rounded-lg bg-white hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {proposals.length > 0 ? (
          proposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))
        ) : (
          <p className="col-span-full text-center text-text-medium-gray">No published proposals found.</p>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (context) => {
  const STRAPI_API_URL = 'http://localhost:1337/api/proposals';
  let proposals: StrapiProposal[] = [];
  let totalProposals = 0;
  let error: string | null = null;

  const page = parseInt(context.query.page as string || '1');
  const pageSize = ITEMS_PER_PAGE;
  const start = (page - 1) * pageSize;

  try {
    // Fetch paginated data
    const response = await fetch(`${STRAPI_API_URL}?filters[publishedAt][$notNull]=true&populate=chooseEmployee&pagination[start]=${start}&pagination[limit]=${pageSize}`);
    
    if (!response.ok) {
      throw new Error(`Strapi API returned status ${response.status}`);
    }
    const data = await response.json();
    
    proposals = data.data || [];
    totalProposals = data.meta?.pagination?.total || 0; // Get total from Strapi meta

  } catch (err: any) {
    console.error('[getServerSideProps] Failed to fetch proposals from Strapi:', err);
    error = `Failed to load proposals: ${err.message}. Please ensure Strapi is running and accessible at ${STRAPI_API_URL}.`;
  }

  return {
    props: {
      proposals,
      totalProposals,
      currentPage: page,
      error,
    },
  };
};

export default HomePage;