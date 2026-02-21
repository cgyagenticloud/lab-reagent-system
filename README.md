# Lab Reagent Management System 🧪

A production-quality reagent tracking system for PhD research labs, built on Cloudflare's edge platform.

## Architecture

```
┌──────────────────┐    ┌─────────────────────┐    ┌──────────┐
│  Static Frontend │───▶│ Cloudflare Pages     │───▶│          │
│  (Bootstrap 5)   │    │ Functions (API)      │    │ D1 (SQL) │
│  HTML + JS       │    │ /api/*               │    │          │
└──────────────────┘    └─────────────────────┘    └──────────┘
```

- **Frontend**: Static HTML + vanilla JS served via Cloudflare Pages
- **API**: Cloudflare Pages Functions (serverless, edge-deployed)
- **Database**: Cloudflare D1 (SQLite-compatible, globally distributed)

## Features

- 📊 **Dashboard** — Stats, low-stock alerts, expiration warnings, category breakdown, recent usage
- 🧪 **Reagent CRUD** — Full create/read/update/delete with search & multi-filter
- 📉 **Usage Logging** — Track who used what, with auto stock decrement
- 🛒 **Order Tracking** — Record orders, mark received (auto-updates stock)
- 🏷️ **Categories** — Color-coded categories with reagent counts
- 👥 **User Management** — Lab members with roles
- 📱 **Responsive UI** — Bootstrap 5, works on mobile

## Deployment

```bash
# Install dependencies
npm install

# Create D1 database
npx wrangler d1 create lab-reagents-db
# Update wrangler.toml with the database_id

# Apply schema and seed data
npx wrangler d1 execute lab-reagents-db --remote --file=schema.sql
npx wrangler d1 execute lab-reagents-db --remote --file=seed.sql

# Deploy
npx wrangler pages deploy public/ --project-name=lab-reagent-system
```

## Local Development

```bash
npx wrangler pages dev public/
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Bootstrap 5.3, Vanilla JS |
| API | Cloudflare Pages Functions |
| Database | Cloudflare D1 (SQLite) |
| CDN | Cloudflare Pages (global edge) |
