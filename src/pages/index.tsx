// src/pages/index.tsx (UPDATED: Removed Content Type pills, improved sort/view buttons)
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Carousel from '@/components/Carousel';
import ProposalCard from '@/components/ProposalCard';
import Pagination from '@/components/Pagination';
import { GetServerSideProps } from 'next';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

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
  totalProposals: number;
  currentPage: number;
  latestProposals: StrapiProposal[];
  error?: string | null;
}

const ITEMS_PER_PAGE = 8;

const HomePage: React.FC<HomePageProps> = ({ proposals, totalProposals, currentPage, latestProposals, error }) => {
  const totalPages = Math.ceil(totalProposals / ITEMS_PER_PAGE);
  const [activeView, setActiveView] = useState('grid'); // State for grid/list view toggle

  const handlePageChange = (page: number) => {
    window.location.href = `/?page=${page}`;
  };

  return (
    <Layout>
      <Carousel latestProposals={latestProposals} />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {/* Filter and Sort Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-text-dark-gray mb-4 sm:mb-0">Popular resources</h2>
        <div className="flex items-center space-x-4 text-text-medium-gray text-sm flex-wrap">
          {/* Removed Content Type Pills - filtering for content type is now solely in the Filter By sidebar */}
          {/* The "All Types" dropdown is no longer needed here */}

          <span className="font-semibold">Sort by:</span>
          <div className="relative">
            <select
              className="p-2 border rounded-lg bg-white appearance-none pr-8 cursor-pointer
                         focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:border-transparent"
            >
              <option>Published Date</option>
              <option>Client Name</option>
              <option>Opportunity Number</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDownIcon className="h-4 w-4" />
            </div>
          </div>
          
          {/* Grid/List view toggle buttons with active states */}
          <div className="flex space-x-2 ml-auto sm:ml-0 mt-2 sm:mt-0">
            <button
              onClick={() => setActiveView('grid')}
              className={`p-2 border rounded-lg text-gray-700 transition-colors
                          ${activeView === 'grid' ? 'bg-strapi-green-light text-white shadow-sm' : 'bg-white hover:bg-gray-100'}
                          focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM13 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
              </svg>
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`p-2 border rounded-lg text-gray-700 transition-colors
                          ${activeView === 'list' ? 'bg-strapi-green-light text-white shadow-sm' : 'bg-white hover:bg-gray-100'}
                          focus:outline-none focus:ring-2 focus:ring-strapi-green-light focus:ring-offset-2`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {proposals.length > 0 ? (
          proposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-500">
            <span className="text-6xl mb-4" role="img" aria-label="No results">🔍</span>
            <p className="text-xl font-medium">No published proposals found matching your criteria.</p>
            <p className="text-md mt-2">Try adjusting your filters or search terms.</p>
          </div>
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
  let latestProposals: StrapiProposal[] = [];
  let error: string | null = null;

  const page = parseInt(context.query.page as string || '1');
  const pageSize = ITEMS_PER_PAGE;
  const start = (page - 1) * pageSize;

  try {
    // Fetch paginated data for popular resources
    const proposalsResponse = await fetch(`${STRAPI_API_URL}?filters[publishedAt][$notNull]=true&populate=chooseEmployee&pagination[start]=${start}&pagination[limit]=${pageSize}`);
    
    if (!proposalsResponse.ok) {
      throw new Error(`Strapi proposals API returned status ${proposalsResponse.status}`);
    }
    const proposalsData = await proposalsResponse.json();
    
    proposals = proposalsData.data || [];
    totalProposals = proposalsData.meta?.pagination?.total || 0;

    // Fetch latest 2 proposals for carousel
    const latestProposalsResponse = await fetch(`${STRAPI_API_URL}?sort=publishedAt:desc&pagination[limit]=2`);
    if (!latestProposalsResponse.ok) {
      console.warn(`Strapi latest proposals API returned status ${latestProposalsResponse.status}. Carousel might not show latest data.`);
      latestProposals = [];
    } else {
      const latestData = await latestProposalsResponse.json();
      latestProposals = latestData.data || [];
    }

  } catch (err: any) {
    console.error('[getServerSideProps] Failed to fetch data from Strapi:', err);
    error = `Failed to load data: ${err.message}. Please ensure Strapi is running and accessible at ${STRAPI_API_URL}.`;
  }

  return {
    props: {
      proposals,
      totalProposals,
      currentPage: page,
      latestProposals,
      error,
    },
  };
};

export default HomePage;