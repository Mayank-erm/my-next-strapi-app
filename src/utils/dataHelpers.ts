// src/utils/dataHelpers.ts

import { StrapiProposal } from '@/types/strapi';

// Function to parse monetary range string into a number (taking the lower bound for filtering)
const parseValueRange = (rangeStr: string | undefined | null): number => {
  if (!rangeStr) return 0;
  const match = rangeStr.match(/^(\d+)([KM]?)/i); // Extract number and K/M suffix
  if (match) {
    let value = parseFloat(match[1]);
    const suffix = match[2]?.toUpperCase();
    if (suffix === 'K') value *= 1000;
    if (suffix === 'M') value *= 1000000;
    return value;
  }
  return 0; // Default to 0 if parsing fails
};

// Helper to extract data regardless of Strapi 'attributes' nesting and convert Document_Value_Range to number
// Ensures no 'undefined' values are passed for JSON serialization
export const extractProposalData = (item: any): Omit<StrapiProposal, 'id' | 'documentId'> => {
  const data = item.attributes || item; // Use attributes if present (Strapi API), otherwise the item itself (MeiliSearch hit)

  // Explicitly convert undefined to null or empty string for all optional/potentially missing fields
  return {
    unique_id: data.Unique_Id || data.SF_Number || '', // Use empty string for better serialization/display
    SF_Number: data.SF_Number || data.Unique_Id || '',
    Client_Name: data.Client_Name || '',
    Client_Type: data.Client_Type || '',
    Client_Contact: data.Client_Contact || '',
    Client_Contact_Title: data.Client_Contact_Title || '',
    Client_Journey: data.Client_Journey || '',
    Document_Type: data.Document_Type || '',
    Document_Sub_Type: data.Document_Sub_Type || '',
    Document_Value_Range: data.Document_Value_Range || '',
    Document_Outcome: data.Document_Outcome || '',
    Last_Stage_Change_Date: data.Last_Stage_Change_Date || '',
    Industry: data.Industry || '',
    Sub_Industry: data.Sub_Industry || '',
    Service: data.Service || '',
    Sub_Service: data.Sub_Service || '',
    Business_Unit: data.Business_Unit || '',
    Region: data.Region || '',
    Country: data.Country || '',
    State: data.State || '',
    City: data.City || '',
    Author: data.Author || '',
    PIC: data.PIC || '',
    PM: data.PM || '',
    Keywords: data.Keywords || '',
    Commercial_Program: data.Commercial_Program || '',
    // For nullable fields, convert undefined to null
    Project_Team: data.Project_Team ?? null,
    SMEs: data.SMEs ?? null,
    Competitors: data.Competitors || '',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    publishedAt: data.publishedAt || new Date().toISOString(),
    Description: data.Description || [],
    documentUrl: data.url ?? null, // Use data.url as the direct document URL if available, otherwise null
    value: parseValueRange(data.Document_Value_Range),
    proposalName: data.proposalName || data.SF_Number || data.Unique_Id || '',
    
    // Include other optional fields from the centralized interface
    Attachments: data.Attachments ?? null,
    Pursuit_Team: data.Pursuit_Team ?? null,
    opportunityNumber: data.opportunityNumber || '',
    opportunity_number: data.opportunity_number || '',
    proposal_name: data.proposal_name || '',
    client_name: data.client_name || '',
    service_line: data.service_line || '',
    region: data.region || '',
    document_type: data.document_type || '',
    document_sub_type: data.document_sub_type || '',
  };
};