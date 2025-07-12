// src/config/apiConfig.ts

/**
 * @file This file centralizes all API-related configuration details.
 * Using a single source for API constants makes it easier to manage
 * and update endpoints, keys, and other settings across the application.
 */

// MeiliSearch Configuration
export const MEILISEARCH_HOST = 'https://ms-710c634cf8ae-26528.lon.meilisearch.io';
export const MEILISEARCH_API_KEY = '89ebfcd885b07a82f0dca202a786aab4bf11be07'; // Consider using environment variables for production

// Strapi API Configuration
// Updated to include 'populate=*' to ensure all nested relations are fetched
// Changed 'localhost' to '127.0.0.1' for potential environment compatibility issues
export const STRAPI_API_URL = 'https://enduring-thrill-157cd6ce3b.strapiapp.com/api/document-stores?populate=*';