# Design Spec: Donation Links Module

## Overview
This module introduces a "Donation Links" section on the main page where visitors can easily find and click verified links to make donations. The module is fully manageable by an administrator/moderator through a private admin panel. 

## Data Model (Supabase)
We will create a new table called `donation_links`.

**Schema:**
- `id`: uuid, primary key, auto-generated
- `title`: text, required (e.g., "Cruz Roja")
- `description`: text, required (Brief description of the cause/destination)
- `url`: text, required (The actual donation link)
- `image_url`: text, nullable (Manual override for the organization's logo)
- `is_active`: boolean, default `true` (Used to soft-delete or hide links)
- `created_at`: timestamp with time zone, default `now()`
- `updated_at`: timestamp with time zone, default `now()`

## Architecture & Components

### 1. Admin Panel (Moderator View)
A protected route (e.g., `/admin/donations` or integrated into the existing admin dashboard) will be created to manage these links.

**Features:**
- **List View:** A table showing all donation links (both active and inactive).
- **Quick Toggle:** A switch/toggle button directly on the list view to easily flip the `is_active` status of any link without editing the full record.
- **Add/Edit Form:** A form allowing the admin to input the Title, Description, and URL. It includes an optional `image_url` field.

### 2. Public Main Page UI
A new React component `DonationLinksGrid` will be added to the main page.

**Features:**
- **Data Fetching:** The component will query Supabase for records where `is_active = true`.
- **Layout:** A responsive Grid (1 column on mobile, 2 on tablet, 3-4 on desktop).
- **Card Design:** 
  - Each card represents one donation link.
  - **Logo Handling (Auto-fallback):** The card displays an image at the top. If `image_url` is provided in the database, it uses that. If `image_url` is `null` or empty, the frontend automatically falls back to fetching the favicon using a service like `https://www.google.com/s2/favicons?domain=<parsed_domain>&sz=128`.
  - Displays the `title` (bold) and `description`.
  - A prominent "Donate" button at the bottom of the card that opens the `url` in a new tab (`target="_blank"`, `rel="noopener noreferrer"`).

## Security & Data Flow
- **Row Level Security (RLS):** 
  - `SELECT`: Public access allowed (anyone can read).
  - `INSERT`, `UPDATE`, `DELETE`: Restricted to authenticated admins/moderators only.
- The UI filters active links on the client or server component, but RLS will also ensure only safe data is manipulable.

## Scope Check & Self-Review
- TBDs/Placeholders: None.
- Internal Consistency: The fallback logic correctly covers the requirement for automatic icons while preserving the database schema flexibility.
- Scope: The scope is well-bounded to a single table and its associated CRUD UI and public display grid. It is ready for an implementation plan.
