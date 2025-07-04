// src/types/strapi.d.ts

// Centralized and comprehensive StrapiProposal interface
export interface StrapiProposal {
  id: number;
  documentId: string;
  unique_id: string; // The primary unique identifier
  SF_Number: string; // Used as a fallback or for specific display needs
  Client_Name: string;
  Client_Type: string;
  Client_Contact: string;
  Client_Contact_Title: string;
  Client_Journey: string;
  Document_Type: string;
  Document_Sub_Type: string;
  Document_Value_Range: string; // String range from Strapi/MeiliSearch
  Document_Outcome: string;
  Last_Stage_Change_Date: string;
  Industry: string;
  Sub_Industry: string;
  Service: string;
  Sub_Service: string;
  Business_Unit: string;
  Region: string;
  Country: string;
  State: string;
  City: string;
  Author: string;
  PIC: string;
  PM: string;
  Keywords: string;
  Commercial_Program: string;
  Project_Team: string | null; // Based on payload, often a string like "Project Team F"
  SMEs: string | null; // Based on payload, often a string like "Sahil Jain"
  Competitors: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  Description: any[]; // Rich text array
  documentUrl?: string; // Optional URL for direct document access
  value: number; // Numeric value parsed from Document_Value_Range, for filtering
  proposalName?: string; // Often derived from SF_Number or Unique_Id
  
  // New fields from the comprehensive payload
  Attachments: any[] | null; // Array of attachment objects, or null
  Pursuit_Team: any[] | null; // Array of pursuit team member objects, or null

  // Optional properties that might come from MeiliSearch or old schema definitions
  opportunityNumber?: string;
  opportunity_number?: string;
  
  // Other snake_case fields that might be indexed by MeiliSearch
  proposal_name?: string;
  client_name?: string;
  service_line?: string;
  region?: string;
  document_type?: string;
  document_sub_type?: string;
}