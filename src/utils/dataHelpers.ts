// src/utils/dataHelpers.ts - ENHANCED WITH ATTACHMENT SUPPORT

import { StrapiProposal, StrapiAttachment } from '@/types/strapi';

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

// Helper to process attachments from Strapi response
const processAttachments = (attachments: any): StrapiAttachment[] | null => {
  if (!attachments) return null;
  
  // Handle both array and single attachment
  const attachmentArray = Array.isArray(attachments) ? attachments : [attachments];
  
  return attachmentArray.map((attachment: any) => {
    // Handle nested data structure from Strapi
    const data = attachment.attributes || attachment;
    
    return {
      id: attachment.id || data.id || Math.random(),
      name: data.name || 'Unknown Document',
      alternativeText: data.alternativeText || null,
      caption: data.caption || null,
      width: data.width || null,
      height: data.height || null,
      formats: data.formats || null,
      hash: data.hash || 'unknown',
      ext: data.ext || '.pdf',
      mime: data.mime || 'application/pdf',
      size: data.size || 0,
      url: data.url || `/uploads/${data.hash || 'unknown'}${data.ext || '.pdf'}`,
      previewUrl: data.previewUrl || null,
      provider: data.provider || 'local',
      provider_metadata: data.provider_metadata || null,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      // Enhanced metadata
      documentType: data.documentType || 'primary',
      category: data.category || null,
      tags: data.tags || [],
      downloadCount: data.downloadCount || 0,
      lastAccessed: data.lastAccessed || null,
    } as StrapiAttachment;
  });
};

// Helper to process team members from Strapi response
const processTeamMembers = (teamData: any): any => {
  if (!teamData) return null;
  
  // If it's a string, return as-is for backward compatibility
  if (typeof teamData === 'string') return teamData;
  
  // If it's an array, process team members
  if (Array.isArray(teamData)) {
    return teamData.map((member: any) => {
      const data = member.attributes || member;
      return {
        id: member.id || data.id,
        name: data.name || 'Unknown',
        email: data.email || null,
        role: data.role || null,
        department: data.department || null,
        expertise: data.expertise || [],
        avatar: data.avatar ? processAttachments([data.avatar])?.[0] : null,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    });
  }
  
  return teamData;
};

// Enhanced helper to extract data with full attachment support
export const extractProposalData = (item: any): Omit<StrapiProposal, 'id' | 'documentId'> => {
  const data = item.attributes || item; // Use attributes if present (Strapi API), otherwise the item itself (MeiliSearch hit)

  // Process attachments from the data
  const processedAttachments = data.Attachments ? processAttachments(data.Attachments) : null;

  // Enhanced data extraction with all fields
  return {
    unique_id: data.Unique_Id || data.unique_id || data.SF_Number || '',
    SF_Number: data.SF_Number || data.Unique_Id || data.unique_id || '',
    
    // Client information
    Client_Name: data.Client_Name || '',
    Client_Type: data.Client_Type || '',
    Client_Contact: data.Client_Contact || '',
    Client_Contact_Title: data.Client_Contact_Title || '',
    Client_Journey: data.Client_Journey || '',
    
    // Document classification
    Document_Type: data.Document_Type || '',
    Document_Sub_Type: data.Document_Sub_Type || '',
    Document_Value_Range: data.Document_Value_Range || '',
    Document_Outcome: data.Document_Outcome || '',
    Last_Stage_Change_Date: data.Last_Stage_Change_Date || '',
    
    // Industry and service
    Industry: data.Industry || '',
    Sub_Industry: data.Sub_Industry || '',
    Service: data.Service || '',
    Sub_Service: data.Sub_Service || '',
    Business_Unit: data.Business_Unit || '',
    
    // Geographic
    Region: data.Region || '',
    Country: data.Country || '',
    State: data.State || '',
    City: data.City || '',
    
    // Team and responsibility
    Author: data.Author || '',
    PIC: data.PIC || '',
    PM: data.PM || '',
    
    // Content and metadata
    Keywords: data.Keywords || '',
    Commercial_Program: data.Commercial_Program || '',
    Competitors: data.Competitors || '',
    
    // Enhanced team processing
    Project_Team: processTeamMembers(data.Project_Team),
    SMEs: processTeamMembers(data.SMEs),
    Pursuit_Team: processTeamMembers(data.Pursuit_Team),
    
    // Timestamps
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
    publishedAt: data.publishedAt || new Date().toISOString(),
    
    // Rich content
    Description: data.Description || [],
    
    // ENHANCED: Processed attachments
    Attachments: processedAttachments,
    
    // Document URLs - prefer attachment URLs if available
    documentUrl: processedAttachments?.[0]?.url || data.url || data.documentUrl || null,
    documentPath: data.documentPath || null,
    
    // Computed fields
    value: parseValueRange(data.Document_Value_Range),
    proposalName: data.proposalName || data.SF_Number || data.unique_id || '',
    
    // Enhanced metadata
    viewCount: data.viewCount || 0,
    downloadCount: data.downloadCount || 0,
    rating: data.rating || 0,
    ratingCount: data.ratingCount || 0,
    lastViewed: data.lastViewed || null,
    isFavorite: data.isFavorite || false,
    isArchived: data.isArchived || false,
    
    // Privacy and access
    confidentialityLevel: data.confidentialityLevel || 'internal',
    accessPermissions: data.accessPermissions || [],
    
    // Document lifecycle
    status: data.status || 'published',
    reviewDate: data.reviewDate || null,
    expiryDate: data.expiryDate || null,
    
    // Search optimization
    searchableContent: data.searchableContent || '',
    relatedDocuments: data.relatedDocuments || [],
    
    // Workflow
    approvalStatus: data.approvalStatus || 'approved',
    approvedBy: data.approvedBy || null,
    approvalDate: data.approvalDate || null,
    rejectionReason: data.rejectionReason || null,
    
    // Legacy compatibility fields
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

// Helper to get file type from attachment
export const getFileTypeFromAttachment = (attachment: StrapiAttachment): string => {
  const mimeType = attachment.mime.toLowerCase();
  const extension = attachment.ext.toLowerCase();
  
  if (mimeType.includes('pdf') || extension === '.pdf') return 'pdf';
  if (mimeType.includes('word') || extension.includes('doc')) return 'word';
  if (mimeType.includes('excel') || extension.includes('xls')) return 'excel';
  if (mimeType.includes('powerpoint') || extension.includes('ppt')) return 'powerpoint';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('video')) return 'video';
  if (mimeType.includes('audio')) return 'audio';
  if (mimeType.includes('text')) return 'text';
  if (extension === '.html' || extension === '.htm') return 'web';
  
  return 'unknown';
};

// Helper to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to get primary attachment (usually the first one)
export const getPrimaryAttachment = (proposal: StrapiProposal): StrapiAttachment | null => {
  if (!proposal.Attachments || proposal.Attachments.length === 0) return null;
  
  // Look for primary document type first
  const primaryDoc = proposal.Attachments.find(att => att.documentType === 'primary');
  if (primaryDoc) return primaryDoc;
  
  // Otherwise return the first attachment
  return proposal.Attachments[0];
};

// Helper to group attachments by type
export const groupAttachmentsByType = (attachments: StrapiAttachment[]) => {
  const grouped = {
    primary: [] as StrapiAttachment[],
    supporting: [] as StrapiAttachment[],
    reference: [] as StrapiAttachment[],
    other: [] as StrapiAttachment[],
  };
  
  attachments.forEach(attachment => {
    const type = attachment.documentType || 'other';
    if (type in grouped) {
      (grouped as any)[type].push(attachment);
    } else {
      grouped.other.push(attachment);
    }
  });
  
  return grouped;
};

// Helper to validate attachment before upload
export const validateAttachment = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'text/html',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/webm',
    'audio/mp3',
    'audio/wav',
    'audio/flac',
    'audio/aac',
    'audio/ogg',
  ];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 50MB limit' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported' };
  }
  
  return { valid: true };
};