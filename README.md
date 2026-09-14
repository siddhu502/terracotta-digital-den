# Remix of Remix of Digital Delights Hub (04)

*"Build a fully functional digital product marketplace web application (like an Etsy for PDFs) with a built-in Admin Management Section. Use a clean, modern aesthetic with warm terracotta accents, nice spacing, and a responsive layout.

Core Architecture & Pages:

Public Marketplace Home:

Header with logo, search bar, and navigation links (Marketplace, Admin Portal).

Hero section with a search filter.

Product grid displaying product cards: image thumbnail, title, category, price, and an 'Instant Download' badge.

Clicking a product opens a detailed view modal or page showing the description, price, and a secure 'Buy Now' / 'Download' button.

Admin Section / Creator Dashboard (/admin):

A dedicated admin tab or page to manage digital inventory.

Product Upload Form: Fields for:

Product Title (text)

Category (dropdown: Planners, Resumes, Art Prints, Guides, Templates)

Price (number with currency symbol)

Description (textarea)

Cover Image Upload (file picker for JPG/PNG preview mockups)

PDF File Upload (file picker for the actual digital product PDF)

Inventory Table: A list showing all uploaded products with their title, price, category, and a button to delete or edit items.

Backend & Data Integration (Supabase):

Connect to Supabase to automatically generate tables for products (id, title, description, price, category, image_url, pdf_url, created_at).

Set up Supabase Storage buckets for both images and digital PDF files so uploads are securely stored and linked.

User Experience Flow:

When visitors browse the marketplace, they see data dynamically pulled from the Supabase productstable.

When the admin uploads a new PDF and image through the /admin dashboard, it automatically saves to Supabase storage and instantly populates onto the public marketplace grid."* Club

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://terracotta-digital-den.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ad95629c-0c14-47b3-b0eb-16139cf5a10f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
