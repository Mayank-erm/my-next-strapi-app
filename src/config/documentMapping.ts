// src/config/documentMapping.ts - UPDATED WITH ATTACHMENTS SUPPORT

import { StrapiAttachment } from '@/types/strapi';

// Enhanced helper function for attachment-based document URLs
export const getDocumentUrl = (attachment: StrapiAttachment): string => {
  // For Strapi attachments with direct URLs
  if (attachment.url && attachment.url.startsWith('/uploads/')) {
    return attachment.url; // Direct URL from Strapi
  }
  
  // For local development, construct URL based on upload folder
  if (attachment.hash && attachment.ext) {
    return `/uploads/${attachment.hash}${attachment.ext}`;
  }
  
  // Fallback: use the URL as-is if it's a full path
  if (attachment.url && attachment.url.startsWith('http')) {
    return attachment.url;
  }
  
  // Last resort: construct from base uploads path
  return `/uploads/${attachment.name || 'unknown'}`;
};

// Legacy function for backward compatibility (keep for now)
export const getLegacyDocumentUrl = (SF_Number: string, documentId: string): string => {
  if (!documentId) {
    // Fallback for local test documents if no documentId
    if (SF_Number?.includes("Excel")) {
      return '/uploads/test_excel.xlsx'; // Updated path
    } else if (SF_Number?.includes("Word")) {
      return '/uploads/test_word.docx';
    } else if (SF_Number?.includes("PPT")) {
      return '/uploads/test_ppt.pptx';
    }
    return '/uploads/test_pdf.pdf';
  }

  // For documents with IDs, construct path
  return `/uploads/${documentId}`;
};

// Helper to get the best document URL from a proposal
export const getBestDocumentUrl = (proposal: any): string => {
  // First, try to get from attachments
  if (proposal.Attachments && Array.isArray(proposal.Attachments) && proposal.Attachments.length > 0) {
    const primaryAttachment = proposal.Attachments.find((att: any) => att.documentType === 'primary') 
      || proposal.Attachments[0];
    return getDocumentUrl(primaryAttachment);
  }
  
  // Fallback to legacy method
  return getLegacyDocumentUrl(proposal.SF_Number || proposal.unique_id, proposal.documentId);
};

// Configuration for different environments
export const UPLOAD_CONFIG = {
  // Base path for uploads (can be environment-specific)
  basePath: process.env.NODE_ENV === 'production' 
    ? '/uploads' 
    : '/uploads',
  
  // Maximum file size (50MB)
  maxFileSize: 50 * 1024 * 1024,
  
  // Allowed file types
  allowedTypes: [
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
    'video/mp4',
    'audio/mp3',
  ],
  
  // File extensions mapping
  extensions: {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'text/html': '.html',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'audio/mp3': '.mp3',
  }
};