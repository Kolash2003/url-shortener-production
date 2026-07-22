# snip.dev — URL Shortener & Link Management Platform

A modern, developer-focused URL shortener with analytics, QR code generation, and link management — built with React, TypeScript, and Tailwind CSS.

## Features

- **URL Shortening** — Instantly shorten long URLs with custom or auto-generated aliases
- **Link Analytics** — Track clicks, referrers, devices, browsers, and geography per link
- **QR Code Generation** — Generate and download QR codes for any short link
- **Bulk Link Management** — Edit, duplicate, delete, tag, deactivate, and export links
- **Search & Filter** — Filter links by status, tags, or keyword
- **API Access** — Developer API keys for programmatic link creation
- **Notifications** — Real-time alerts for milestones, expiring links, and exports
- **Settings** — Profile, link defaults, and notification preferences

## Routes

| Route | Description |
|---|---|
| `/` | Landing page — hero, features, how it works, pricing preview, footer |
| `/auth` | Login / sign-up page |
| `/pricing` | Pricing plans |
| `/dashboard` | Main dashboard — stats overview, quick shorten, recent links |
| `/dashboard/links` | Full link management table with bulk actions |
| `/dashboard/links/new` | Create a new short link with options (expiry, password, UTM, tags, QR) |
| `/dashboard/analytics/:slug` | Per-link analytics — click trends, devices, referrers, geography |
| `/dashboard/api` | API key management |
| `/dashboard/settings` | User settings — profile, link defaults, notifications |
| `/dashboard/qr` | QR codes gallery for all active links |

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — fast dev server and build
- **Tailwind CSS** + **shadcn/ui** — design system and components
- **React Router** — client-side routing
- **Recharts** — analytics charts
- **Framer Motion** — animations
- **Sonner** — toast notifications
- **React Query** — data fetching layer (ready for backend integration)

## Getting Started

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
src/
├── components/
│   ├── analytics/      # Analytics page components (charts, tables, geography)
│   ├── dashboard/      # Dashboard components (navbar, sidebar, stats, links table)
│   ├── landing/        # Landing page sections (hero, features, footer)
│   └── ui/             # shadcn/ui primitives
├── context/
│   └── LinksContext.tsx # Global link state management
├── hooks/              # Custom React hooks
├── pages/              # Route-level page components
└── lib/                # Utility functions
```

## License

MIT
