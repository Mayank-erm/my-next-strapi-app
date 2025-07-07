// src/hooks/useRecentlyViewed.ts - Custom hook for tracking recently viewed documents
import { useState, useEffect } from 'react';

interface ViewedDocument {
  id: number;
  unique_id: string;
  Document_Type: string;
  Client_Name: string;
  viewedAt: string;
}

const STORAGE_KEY = 'recentlyViewedDocuments';
const MAX_RECENT_ITEMS = 10;

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<ViewedDocument[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentlyViewed(parsed);
      }
    } catch (error) {
      console.error('Error loading recently viewed documents:', error);
    }
  }, []);

  // Save to localStorage whenever recentlyViewed changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
    } catch (error) {
      console.error('Error saving recently viewed documents:', error);
    }
  }, [recentlyViewed]);

  // Function to add a document to recently viewed
  const addToRecentlyViewed = (document: Omit<ViewedDocument, 'viewedAt'>) => {
    setRecentlyViewed(prev => {
      // Remove if already exists (to move to top)
      const filtered = prev.filter(item => item.id !== document.id);
      
      // Add to beginning with current timestamp
      const newItem: ViewedDocument = {
        ...document,
        viewedAt: new Date().toISOString()
      };
      
      const updated = [newItem, ...filtered];
      
      // Keep only the most recent items
      return updated.slice(0, MAX_RECENT_ITEMS);
    });
  };

  // Function to clear all recently viewed
  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
  };

  // Function to remove a specific item
  const removeFromRecentlyViewed = (id: number) => {
    setRecentlyViewed(prev => prev.filter(item => item.id !== id));
  };

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
    removeFromRecentlyViewed,
    count: recentlyViewed.length
  };
};

// Usage example in DocumentPreviewModal.tsx:
/*
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ proposal, onClose }) => {
  const { addToRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    // Track when document is opened
    if (proposal) {
      addToRecentlyViewed({
        id: proposal.id,
        unique_id: proposal.unique_id,
        Document_Type: proposal.Document_Type,
        Client_Name: proposal.Client_Name
      });
    }
  }, [proposal, addToRecentlyViewed]);

  // ... rest of component
};
*/