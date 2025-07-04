// src/config/documentMapping.ts

// Helper function to determine the document URL based on SF_Number and documentId.
// This function can be expanded with more sophisticated mapping logic if needed.
export const getDocumentUrl = (SF_Number: string, documentId: string): string => {
  if (!documentId) {
    // Fallback for local test documents if no documentId (or documentUrl) is provided by Strapi/MeiliSearch
    if (SF_Number?.includes("Excel")) {
      return '/documents/test_excel.xlsx - ESRS S3.csv'; // Example Excel mapping
    } else if (SF_Number?.includes("Word")) {
      return '/documents/test_word.docx'; // Example Word mapping
    } else if (SF_Number?.includes("PPT")) {
      return '/documents/test_ppt.pptx'; // Example PPT mapping
    }
    // Default to PDF if no specific mapping or documentId
    return '/documents/test_pdf.pdf';
  }

  // In a real application, you might construct the URL using the documentId
  // For example: `http://your-strapi-backend/uploads/${documentId}.pdf`
  // For this example, we'll use a placeholder structure.
  // Assuming documentId directly relates to a file name or a path segment
  // If your Strapi provides a direct documentUrl, that should be preferred.
  // For now, let's just return a mock URL if documentId is present,
  // or use the SF_Number based mapping as a fallback if documentId is not useful for direct URL construction here.

  // Placeholder logic: If documentId is present, assume a generic URL pattern.
  // This needs to be adjusted based on your actual Strapi file serving setup.
  if (documentId) {
    // Example: If documentId is a direct file name or can be used to construct a direct link
    // return `http://localhost:1337/uploads/${documentId}`; // Adjust based on your actual upload path
    // For now, we stick to local mocks with SF_Number if documentId doesn't immediately form a URL
    if (SF_Number?.includes("Excel")) return `/documents/test_excel.xlsx - ESRS S3.csv`;
    else if (SF_Number?.includes("Word")) return `/documents/test_word.docx`;
    else if (SF_Number?.includes("PPT")) return `/documents/test_ppt.pptx`;
    else return `/documents/test_pdf.pdf`;
  }

  return '/documents/test_pdf.pdf'; // Default fallback
};