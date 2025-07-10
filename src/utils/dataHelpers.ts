// src/utils/dataHelpers.ts - FIXED VERSION WITH SAFE DATA EXTRACTION
import { StrapiProposal } from '@/types/strapi';

/**
 * Safely extracts proposal data from various sources (Strapi API, MeiliSearch, etc.)
 * with comprehensive error handling and fallbacks
 */
export function extractProposalData(data: any): Partial<StrapiProposal> {
  if (!data) {
    console.warn('extractProposalData: No data provided');
    return {};
  }

  try {
    // Handle different data structures
    let sourceData = data;
    
    // If it's a Strapi API response, extract attributes
    if (data.attributes) {
      sourceData = { ...data.attributes, id: data.id };
    }
    
    // If it's nested further (some Strapi responses)
    if (data.data && data.data.attributes) {
      sourceData = { ...data.data.attributes, id: data.data.id };
    }

    // Safe getter function with fallbacks
    const safeGet = (key: string, fallback: any = '') => {
      return sourceData[key] ?? fallback;
    };

    // Safe number getter
    const safeGetNumber = (key: string, fallback: number = 0): number => {
      const value = sourceData[key];
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? fallback : parsed;
      }
      return fallback;
    };

    // Safe date getter
    const safeGetDate = (key: string, fallback?: string): string => {
      const value = sourceData[key];
      if (typeof value === 'string' && value) {
        // Validate it's a proper date
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return value;
        }
      }
      return fallback || new Date().toISOString();
    };

    // Extract unique identifier with multiple fallbacks
    const getUniqueId = (): string => {
      return safeGet('unique_id') || 
             safeGet('Unique_Id') || 
             safeGet('SF_Number') || 
             safeGet('proposalName') ||
             safeGet('documentId') ||
             (sourceData.id ? `doc-${sourceData.id}` : 'unknown');
    };

    // Extract and return the proposal data
    const extractedData: Partial<StrapiProposal> = {
      // Core identifiers
      id: safeGetNumber('id'),
      documentId: safeGet('documentId') || safeGet('id', '').toString(),
      unique_id: getUniqueId(),
      SF_Number: safeGet('SF_Number') || getUniqueId(),
      proposalName: safeGet('proposalName') || getUniqueId(),

      // Client information
      Client_Name: safeGet('Client_Name', 'Unknown Client'),
      Client_Type: safeGet('Client_Type'),
      Client_Contact: safeGet('Client_Contact'),
      Client_Contact_Title: safeGet('Client_Contact_Title'),
      Client_Journey: safeGet('Client_Journey'),

      // Document information
      Document_Type: safeGet('Document_Type', 'Document'),
      Document_Sub_Type: safeGet('Document_Sub_Type'),
      Document_Value_Range: safeGet('Document_Value_Range'),
      Document_Outcome: safeGet('Document_Outcome'),

      // Geographic and organizational
      Industry: safeGet('Industry', 'General'),
      Sub_Industry: safeGet('Sub_Industry'),
      Service: safeGet('Service'),
      Sub_Service: safeGet('Sub_Service'),
      Business_Unit: safeGet('Business_Unit'),
      Region: safeGet('Region', 'Global'),
      Country: safeGet('Country'),
      State: safeGet('State'),
      City: safeGet('City'),

      // Personnel
      Author: safeGet('Author'),
      PIC: safeGet('PIC'),
      PM: safeGet('PM'),

      // Metadata
      Keywords: safeGet('Keywords'),
      Commercial_Program: safeGet('Commercial_Program'),
      Competitors: safeGet('Competitors'),

      // Complex fields with safe defaults
      Project_Team: sourceData.Project_Team || null,
      SMEs: sourceData.SMEs || null,
      Pursuit_Team: sourceData.Pursuit_Team || null,
      Description: Array.isArray(sourceData.Description) ? sourceData.Description : [],
      Attachments: sourceData.Attachments || null,

      // Dates with safe parsing
      createdAt: safeGetDate('createdAt'),
      updatedAt: safeGetDate('updatedAt'),
      publishedAt: safeGetDate('publishedAt'),
      Last_Stage_Change_Date: safeGetDate('Last_Stage_Change_Date', safeGetDate('updatedAt')),

      // Numeric values
      value: safeGetNumber('value', 0),

      // Document URL will be handled by getBestDocumentUrl
      documentUrl: safeGet('documentUrl', ''),
    };

    console.log('✅ Successfully extracted proposal data:', {
      id: extractedData.id,
      unique_id: extractedData.unique_id,
      Client_Name: extractedData.Client_Name,
      Document_Type: extractedData.Document_Type
    });

    return extractedData;

  } catch (error) {
    console.error('❌ Error extracting proposal data:', error, data);
    
    // Return minimal fallback data
    return {
      id: 0,
      documentId: '0',
      unique_id: 'error-document',
      SF_Number: 'error-document',
      proposalName: 'Error Processing Document',
      Client_Name: 'Error Processing Client',
      Document_Type: 'Document',
      Industry: 'General',
      Region: 'Global',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      Last_Stage_Change_Date: new Date().toISOString(),
      value: 0,
      documentUrl: '',
      Description: [],
      Project_Team: null,
      SMEs: null,
      Pursuit_Team: null,
      Attachments: null,
      Client_Type: '',
      Client_Contact: '',
      Client_Contact_Title: '',
      Client_Journey: '',
      Document_Sub_Type: '',
      Document_Value_Range: '',
      Document_Outcome: '',
      Sub_Industry: '',
      Service: '',
      Sub_Service: '',
      Business_Unit: '',
      Country: '',
      State: '',
      City: '',
      Author: '',
      PIC: '',
      PM: '',
      Keywords: '',
      Commercial_Program: '',
      Competitors: '',
    };
  }
}

/**
 * Safely converts any value to a string representation
 */
export function safeToString(value: any, fallback: string = ''): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  
  return String(value);
}

/**
 * Safely extracts a numeric value from any input
 */
export function safeToNumber(value: any, fallback: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  
  return fallback;
}

/**
 * Safely extracts a date string from any input
 */
export function safeToDate(value: any, fallback?: string): string {
  if (typeof value === 'string' && value.trim()) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return value;
    }
  }
  
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString();
  }
  
  return fallback || new Date().toISOString();
}

/**
 * Validates if a proposal object has the minimum required fields
 */
export function isValidProposal(proposal: any): proposal is StrapiProposal {
  return (
    proposal &&
    (typeof proposal.id === 'number' || typeof proposal.id === 'string') &&
    typeof proposal.unique_id === 'string' &&
    typeof proposal.Client_Name === 'string' &&
    typeof proposal.Document_Type === 'string'
  );
}

/**
 * Cleans and normalizes proposal data for consistent display
 */
export function normalizeProposalData(proposal: Partial<StrapiProposal>): StrapiProposal {
  const normalized: StrapiProposal = {
    // Required fields with safe defaults
    id: safeToNumber(proposal.id, 0),
    documentId: safeToString(proposal.documentId || proposal.id, '0'),
    unique_id: safeToString(proposal.unique_id, 'unknown'),
    SF_Number: safeToString(proposal.SF_Number || proposal.unique_id, ''),
    proposalName: safeToString(proposal.proposalName || proposal.unique_id, ''),
    
    // Client fields
    Client_Name: safeToString(proposal.Client_Name, 'Unknown Client'),
    Client_Type: safeToString(proposal.Client_Type),
    Client_Contact: safeToString(proposal.Client_Contact),
    Client_Contact_Title: safeToString(proposal.Client_Contact_Title),
    Client_Journey: safeToString(proposal.Client_Journey),
    
    // Document fields
    Document_Type: safeToString(proposal.Document_Type, 'Document'),
    Document_Sub_Type: safeToString(proposal.Document_Sub_Type),
    Document_Value_Range: safeToString(proposal.Document_Value_Range),
    Document_Outcome: safeToString(proposal.Document_Outcome),
    
    // Geographic and organizational
    Industry: safeToString(proposal.Industry, 'General'),
    Sub_Industry: safeToString(proposal.Sub_Industry),
    Service: safeToString(proposal.Service),
    Sub_Service: safeToString(proposal.Sub_Service),
    Business_Unit: safeToString(proposal.Business_Unit),
    Region: safeToString(proposal.Region, 'Global'),
    Country: safeToString(proposal.Country),
    State: safeToString(proposal.State),
    City: safeToString(proposal.City),
    
    // Personnel
    Author: safeToString(proposal.Author),
    PIC: safeToString(proposal.PIC),
    PM: safeToString(proposal.PM),
    
    // Metadata
    Keywords: safeToString(proposal.Keywords),
    Commercial_Program: safeToString(proposal.Commercial_Program),
    Competitors: safeToString(proposal.Competitors),
    
    // Complex fields
    Project_Team: proposal.Project_Team || null,
    SMEs: proposal.SMEs || null,
    Pursuit_Team: proposal.Pursuit_Team || null,
    Description: Array.isArray(proposal.Description) ? proposal.Description : [],
    Attachments: proposal.Attachments || null,
    
    // Dates
    createdAt: safeToDate(proposal.createdAt),
    updatedAt: safeToDate(proposal.updatedAt),
    publishedAt: safeToDate(proposal.publishedAt),
    Last_Stage_Change_Date: safeToDate(proposal.Last_Stage_Change_Date || proposal.updatedAt),
    
    // Numeric and URL
    value: safeToNumber(proposal.value, 0),
    documentUrl: safeToString(proposal.documentUrl),
  };
  
  return normalized;
}