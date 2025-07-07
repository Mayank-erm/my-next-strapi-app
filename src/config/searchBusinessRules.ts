// src/config/searchBusinessRules.ts

/**
 * @file This file centralizes business rules and configurations for MeiliSearch.
 * It defines which attributes are generally searchable, which are displayed,
 * and allows for easy management of search behavior across the application.
 */

// Define the attributes that MeiliSearch should search by default for general queries.
// These are typically all relevant metadata fields that users might type text for.
// Excludes: SF_Number, Document_Outcome as per requirements.
export const MEILI_SEARCH_SEARCHABLE_ATTRIBUTES: string[] = [
  'Unique_Id', 
  'Document_Type',
  'Document_Sub_Type',
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
  // ADDED based on MeiliSearch error message's "Available searchable attributes"
  'Attachments_Names',
  'Opportunity_Confidentiality',
  'Pursuit_Team_Names',
  'SF_Number', 
  'Client_Name', // Removed from EXCLUDED, now included as searchable
];

// Define attributes that might be useful for display in concise search results (e.g., autocomplete suggestions).
// This doesn't dictate what's searchable, but what gets returned for display purposes.
export const MEILI_SEARCH_DISPLAY_ATTRIBUTES: string[] = [
  'id',
  'Unique_Id', 
  'SF_Number', 
  'Client_Name', // Display with correct casing
  'Document_Type',
  'Document_Sub_Type',
  'Document_Outcome', 
  'Industry',
  'Region',
  'publishedAt',
  
  // Include snake_case versions if your MeiliSearch index returns them directly for display
  'document_type',
  'document_sub_type',
  'client_name', // Keep for display if it might come as snake_case from MeiliSearch hit
  'region',
];

// Define attributes that should specifically NOT be searched on by users via general text search
// (e.g., they are sensitive, or handled only by specific filters).
export const MEILI_SEARCH_EXCLUDED_FROM_GENERAL_SEARCH: string[] = [
  'SF_Number',
  // 'Client_Name', // REMOVED: No longer excluded from general search
  // 'Document_Outcome', // Keep excluded as per previous instruction
];

// Helper function to dynamically get the attributes to search on,
// filtering out any explicitly excluded ones.
export const getSearchableAttributes = (): string[] => {
  const allPotentialSearchable = [
    'Unique_Id', 
    'Document_Type',
    'Document_Sub_Type',
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
    'Document_Value_Range', 

    // VERIFIED based on MeiliSearch fields and "Available searchable attributes"
    'Attachments_Names',
    'Opportunity_Confidentiality',
    'Pursuit_Team_Names',
    'SF_Number', 
    'Client_Name', // Corrected casing, will now be included based on exclusion list
    'Document_Outcome', 

    // Remove obsolete snake_case attributes for searching if they are not actual fields
    // 'opportunity_number', 
    // 'proposal_name', 
    // 'client_name', // REMOVED: Use 'Client_Name' instead
    // 'service_line', // REMOVED: Use 'Service' instead
  ];

  return allPotentialSearchable.filter(attr =>
    !MEILI_SEARCH_EXCLUDED_FROM_GENERAL_SEARCH.includes(attr) &&
    !MEILI_SEARCH_EXCLUDED_FROM_GENERAL_SEARCH.includes(
      attr.replace(/_([a-z])/g, (g) => g[1].toUpperCase()) 
    ) &&
    !MEILI_SEARCH_EXCLUDED_FROM_GENERAL_SEARCH.includes(
      attr.replace(/([A-Z])/g, "_$1").toLowerCase() 
    )
  );
};