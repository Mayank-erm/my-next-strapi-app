// src/types/strapi.d.ts - UPDATED WITH ENHANCED ATTACHMENTS SUPPORT

// Enhanced Attachment interface for better file handling
export interface StrapiAttachment {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number; // Size in bytes
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
  // Additional metadata for document management
  documentType?: 'primary' | 'supporting' | 'reference';
  category?: string;
  tags?: string[];
  downloadCount?: number;
  lastAccessed?: string;
}

export interface StrapiImageFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  path?: string;
  url: string;
}

// Team member interface for pursuit teams
export interface StrapiTeamMember {
  id: number;
  name: string;
  email?: string;
  role?: string;
  department?: string;
  expertise?: string[];
  avatar?: StrapiAttachment;
  createdAt: string;
  updatedAt: string;
}

// Enhanced and comprehensive StrapiProposal interface
export interface StrapiProposal {
  // Core identification
  id: number;
  documentId: string;
  unique_id: string; // The primary unique identifier
  SF_Number: string; // Salesforce number or legacy identifier

  // Client information
  Client_Name: string;
  Client_Type: string;
  Client_Contact: string;
  Client_Contact_Title: string;
  Client_Journey: string;

  // Document classification
  Document_Type: string;
  Document_Sub_Type: string;
  Document_Value_Range: string; // String range from Strapi/MeiliSearch
  Document_Outcome: string;
  Last_Stage_Change_Date: string;

  // Industry and service classification
  Industry: string;
  Sub_Industry: string;
  Service: string;
  Sub_Service: string;
  Business_Unit: string;

  // Geographic information
  Region: string;
  Country: string;
  State: string;
  City: string;

  // Team and responsibility
  Author: string;
  PIC: string; // Person in Charge
  PM: string; // Project Manager
  
  // Content and metadata
  Keywords: string;
  Commercial_Program: string;
  Competitors: string;

  // Team structures - Enhanced with proper typing
  Project_Team: StrapiTeamMember[] | string | null;
  SMEs: StrapiTeamMember[] | string | null; // Subject Matter Experts
  Pursuit_Team: StrapiTeamMember[] | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt: string;

  // Rich content
  Description: any[]; // Rich text array from Strapi
  
  // ENHANCED: File attachments with full support
  Attachments: StrapiAttachment[] | null;

  // Document access and URLs
  documentUrl?: string; // Primary document URL
  documentPath?: string; // Local file path
  
  // Computed fields
  value: number; // Numeric value parsed from Document_Value_Range, for filtering
  proposalName?: string; // Often derived from SF_Number or Unique_Id

  // Legacy and compatibility fields
  opportunityNumber?: string;
  opportunity_number?: string;
  proposal_name?: string;
  client_name?: string;
  service_line?: string;
  region?: string;
  document_type?: string;
  document_sub_type?: string;

  // Additional metadata for enhanced functionality
  viewCount?: number;
  downloadCount?: number;
  rating?: number;
  ratingCount?: number;
  lastViewed?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  
  // Privacy and access control
  confidentialityLevel?: 'public' | 'internal' | 'confidential' | 'restricted';
  accessPermissions?: string[];
  
  // Document lifecycle
  status?: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  reviewDate?: string;
  expiryDate?: string;
  
  // Search and discovery
  searchableContent?: string; // Extracted text content for search indexing
  relatedDocuments?: number[]; // IDs of related proposals
  
  // Workflow and approvals
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalDate?: string;
  rejectionReason?: string;
}

// Response wrapper interfaces for API calls
export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Error response interface
export interface StrapiError {
  status: number;
  name: string;
  message: string;
  details?: any;
}

// Search and filter interfaces
export interface DocumentFilter {
  documentType?: string[];
  industry?: string[];
  region?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  valueRange?: {
    min: number;
    max: number;
  };
  author?: string[];
  status?: string[];
  confidentialityLevel?: string[];
}

export interface DocumentSearchResult {
  proposals: StrapiProposal[];
  totalCount: number;
  facets?: {
    [key: string]: { [value: string]: number };
  };
  searchTime?: number;
}

// File upload and management interfaces
export interface FileUploadRequest {
  files: File[];
  documentId: number;
  category?: string;
  documentType?: 'primary' | 'supporting' | 'reference';
  metadata?: {
    description?: string;
    tags?: string[];
  };
}

export interface FileUploadResponse {
  success: boolean;
  attachments: StrapiAttachment[];
  errors?: string[];
}

// User interaction interfaces
export interface DocumentRating {
  id: number;
  documentId: number;
  userId: string;
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: string;
}

export interface DocumentView {
  id: number;
  documentId: number;
  userId: string;
  viewedAt: string;
  duration?: number; // Time spent viewing in seconds
  source?: 'search' | 'direct' | 'related'; // How they found the document
}

// Bulk operations
export interface BulkOperation {
  action: 'archive' | 'delete' | 'export' | 'move' | 'update_status';
  documentIds: number[];
  parameters?: {
    [key: string]: any;
  };
}

export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  errors: {
    documentId: number;
    error: string;
  }[];
  results?: any[];
}

// Analytics and reporting
export interface DocumentAnalytics {
  documentId: number;
  views: number;
  downloads: number;
  shares: number;
  avgRating: number;
  ratingCount: number;
  topKeywords: string[];
  viewTrends: {
    date: string;
    views: number;
  }[];
  userEngagement: {
    totalUsers: number;
    returningUsers: number;
    avgSessionDuration: number;
  };
}

// Export interface for different formats
export interface DocumentExport {
  format: 'pdf' | 'docx' | 'excel' | 'csv' | 'json';
  documentIds: number[];
  includeAttachments: boolean;
  includeMetadata: boolean;
  customFields?: string[];
}

// Notification and subscription interfaces
export interface DocumentSubscription {
  id: number;
  userId: string;
  documentId?: number;
  filters?: DocumentFilter;
  notificationTypes: ('new_document' | 'document_updated' | 'document_shared')[];
  frequency: 'immediate' | 'daily' | 'weekly';
  isActive: boolean;
  createdAt: string;
}

export interface DocumentNotification {
  id: number;
  userId: string;
  type: 'new_document' | 'document_updated' | 'document_shared' | 'document_expired';
  documentId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}