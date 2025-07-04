// src/config/apiConfig.ts

/**
 * @file This file centralizes all API-related configuration details.
 * Using a single source for API constants makes it easier to manage
 * and update endpoints, keys, and other settings across the application.
 */

// MeiliSearch Configuration
export const MEILISEARCH_HOST = 'http://localhost:7700';
export const MEILISEARCH_API_KEY = 'masterKey'; // Consider using environment variables for production

// Strapi API Configuration
// Updated to include 'populate=*' to ensure all nested relations are fetched
// Changed 'localhost' to '127.0.0.1' for potential environment compatibility issues
export const STRAPI_API_URL = 'http://127.0.0.1:1337/api/document-stores?populate=*';