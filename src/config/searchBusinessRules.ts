// src/config/searchBusinessRules.ts

/**
 * @file This file centralizes business rules and configurations for MeiliSearch.
 * It defines which attributes are generally searchable, which are displayed,
 * and allows for easy management of search behavior across the application.
 */

// Define the attributes that MeiliSearch should search by default for general queries.
// These are typically all relevant metadata fields that users might type text for.
// Excludes: SF_Number, Client_Name, Document_Outcome as per requirements.
export const MEILI_SEARCH_SEARCHABLE_ATTRIBUTES: string[] = [
  'unique_id',
  'Document_Type',
  'Document_Sub_Type',
  'Last_Stage_Change_Date', // While a date, could be searched as text part
  'Industry',
  'Sub_Industry',
  'Service',
  'Sub_Service',
  'Business_Unit',
  'Region',
  'Country',
  'State',
  'City',
  'Author',
  'PIC',
  'PM',
  'Keywords',
  'Commercial_Program',
  'Project_Team',
  'SMEs',
  'Competitors',
  'Description', // Important for full-text search within description content
  // Note: 'Document_Value_Range' could be included if users might search for "50K" as text,
  // but it's typically handled by range filters. For general text search, we'll omit.
];

// Define attributes that might be useful for display in concise search results (e.g., autocomplete suggestions).
// This doesn't dictate what's searchable, but what gets returned for display purposes.
export const MEILI_SEARCH_DISPLAY_ATTRIBUTES: string[] = [
  'id',
  'unique_id',
  'SF_Number', // Keep for display if needed as fallback in UI, but not for searching
  'Client_Name', // Keep for display if needed, but not for searching
  'Document_Type',
  'Document_Sub_Type',
  'Document_Outcome', // Keep for display if needed, but not for searching
  'Industry',
  'Region',
  'publishedAt',
  'proposalName',
  // Include snake_case versions if your MeiliSearch index returns them directly for display
  'document_type',
  'document_sub_type',
  'client_name',
  'region',
];

// Define attributes that should specifically NOT be searched on by users via general text search
// (e.g., they are sensitive, or handled only by specific filters).
export const MEILI_SEARCH_EXCLUDED_FROM_GENERAL_SEARCH: string[] = [
  'SF_Number',
  'Client_Name',
  'Document_Outcome',
];

// Helper function to dynamically get the attributes to search on,
// filtering out any explicitly excluded ones.
export const getSearchableAttributes = (): string[] => {
  // MeiliSearch's default behavior is to search ALL `displayedAttributes` if `attributesToSearchOn` is not specified.
  // To explicitly control, we list them all here and filter out excluded ones.
  // This list should be a superset of fields that you *want* to be searched.
  const allPotentialSearchable = [
    // Direct fields from StrapiProposal that are likely in MeiliSearch
    'unique_id',
    'Document_Type',
    'Document_Sub_Type',
    'Last_Stage_Change_Date',
    'Industry',
    'Sub_Industry',
    'Service',
    'Sub_Service',
    'Business_Unit',
    'Region',
    'Country',
    'State',
    'City',
    'Author',
    'PIC',
    'PM',
    'Keywords',
    'Commercial_Program',
    'Project_Team',
    'SMEs',
    'Competitors',
    'Description', // The full rich text content
    'Document_Value_Range', // If user searches "50K"
    'publishedAt', // If user searches "2024"

    // Include potential snake_case versions MeiliSearch might use for full text search
    'opportunity_number', // If SF_Number maps to this in Meili
    'proposal_name',
    'client_name', // If it's used in general search
    'service_line',
    'document_type',
    'document_sub_type',
  ];

  return allPotentialSearchable.filter(attr => 
    !MEILI_SEARCH_EXCLUDED_FROM_GENERAL_SEARCH.includes(attr) &&
    !MEILI_SEARCH_EXCLUDED_FROM_GENERAL_SEARCH.includes(
      attr.replace(/_([a-z])/g, (g) => g[1].toUpperCase()) // Convert snake_case to CamelCase to check against exclusion list
    ) &&
    !MEILI_SEARCH_EXCLUDED_FROM_GENERAL_SEARCH.includes(
      attr.replace(/([A-Z])/g, "_$1").toLowerCase() // Convert CamelCase to snake_case to check against exclusion list
    )
  );
};