# my-next-strapi-app

A professional document management and proposal search platform built with **Next.js**, **Strapi**, **MeiliSearch**, and **Tailwind CSS**.  
It features advanced search, filtering, document preview (with modal), ratings, bookmarking, and a modern responsive UI.

---

## Features

- **Full-text Search**: Powered by MeiliSearch for fast, faceted document search.
- **Document Preview Modal**: View and interact with documents in a high-z-index modal overlay.
- **Rich Filtering**: Filter by type, industry, region, business unit, client type, and more.
- **Responsive Layout**: Sidebar navigation, header, and footer adapt to all devices.
- **Carousel**: Highlights latest proposals.
- **Bookmarking**: Save favorite proposals.
- **Ratings & Comments**: Rate and comment on documents.
- **Download & Share**: Download individual or all attachments, copy share links.
- **Professional Design**: Uses ERM design system tokens and Tailwind CSS for a polished look.

---

## Tech Stack

- **Next.js** (React)
- **Strapi** (Headless CMS)
- **MeiliSearch** (Search engine)
- **Tailwind CSS** (Styling)
- **Heroicons** (Icons)
- **TypeScript** (Type safety)

---

## Project Structure

<details>
<summary>Click to expand</summary>

```
src/
  components/
    Carousel.tsx
    DescriptionPanel.tsx
    DescriptionView.tsx
    DocumentPreviewModal.tsx
    DocumentViewer.tsx
    Footer.tsx
    Header.tsx
    Layout.tsx
    Pagination.tsx
    ProposalCard.tsx
    Sidebar.tsx
    SidebarLink.tsx
    Toast.tsx
    UserDropdown.tsx
    cms/
  config/
    apiConfig.ts
    documentMapping.ts
    searchBusinessRules.ts
  design-system/
    tokens.ts
  hooks/
  pages/
    _app.tsx
    _document.tsx
    bookmarks.tsx
    content-management.tsx
    index.tsx
  styles/
    globals.css
    cms-page.css
    content-display.css
  types/
  utils/
```
</details>

---

## Usage Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-org/my-next-strapi-app.git
cd my-next-strapi-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and set the following:

```
NEXT_PUBLIC_MEILISEARCH_HOST=http://localhost:7700
NEXT_PUBLIC_MEILISEARCH_API_KEY=masterKey
STRAPI_API_URL=http://localhost:1337
```

Adjust the URLs and keys as per your setup.

### 4. Start Required Services

- **Strapi**:  
  Start your Strapi backend and ensure it is running and accessible at the URL above.

- **MeiliSearch**:  
  Start MeiliSearch and ensure your documents are indexed under the `document_stores` index.

### 5. Run the Next.js App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Customization

- **Design tokens**: See `src/design-system/tokens.ts` and `src/styles/globals.css`.
- **Document mapping**: See `src/config/documentMapping.ts`.
- **Search rules**: See `src/config/searchBusinessRules.ts`.

---

## Accessibility & Responsiveness

- Uses semantic HTML, keyboard navigation, and ARIA roles where appropriate.
- Fully responsive for desktop and mobile.

---

## Troubleshooting

- **Search index errors**:  
  If you see errors about missing facets or index, ensure your MeiliSearch index is correctly configured and populated.
- **Document modal z-index**:  
  The modal uses a very high z-index and special CSS to always appear above the header and other content.
- **Environment variables**:  
  Double-check your `.env.local` file and Strapi/MeiliSearch URLs.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request

---

## License

[MIT](LICENSE)
