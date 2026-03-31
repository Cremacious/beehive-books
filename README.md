# Beehive Books

A social writing platform for authors and readers — write, collaborate, and discover stories.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)
![Deployed on Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)
![License](https://img.shields.io/badge/License-All_Rights_Reserved-red)

**Live:** [beehive-books.app](https://www.beehive-books.app) &nbsp;|&nbsp; **Version:** 1.0.0-beta.2

> ⚠️ Currently in active development. Not yet open for public registration.

---

## What is Beehive Books?

Beehive Books is a community-driven writing platform built for writers who want more than just a document editor. It combines a rich writing experience with social discovery, collaborative tools, and community features.

**For writers:**
- Write and publish books with a full-featured rich text editor (TipTap)
- Organize chapters into collections with drag-and-drop reordering
- Track word count per chapter and across your entire library
- Export your work as EPUB, PDF, or DOCX
- Control who sees your work with granular privacy settings

**For readers:**
- Discover public books on the Explore page
- Follow authors and track reading progress
- Leave comments on books and chapters
- Build and share curated reading lists

**For collaborators (Hives):**
- Co-author books with a team inside a shared Hive workspace
- Collaborative outline board, world-building wiki, and annotations
- Word goals, activity feed (Buzz Board), and member management

**For community:**
- Book clubs with discussions and shared reading lists
- Writing prompts with community entries and likes
- Friends system with activity feed

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui + Radix UI |
| Database | Neon (serverless Postgres) |
| ORM | Drizzle ORM |
| Auth | better-auth |
| Editor | TipTap v3 |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Image Uploads | Cloudinary |
| Payments | Stripe |
| Rate Limiting | Upstash Redis |
| Email | Resend |
| i18n | next-intl (EN, ES, FR, DE, PT) |
| Testing | Playwright |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) database (free tier works)
- A [Cloudinary](https://cloudinary.com) account (free tier works)
- A [better-auth](https://better-auth.com) compatible setup
- Optional: [Stripe](https://stripe.com), [Resend](https://resend.com), [Upstash](https://upstash.com)

### Installation

```bash
git clone https://github.com/Cremacious/beehive-books.git
cd beehive-books
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) section below for all required values.

### Database Setup

```bash
# Push schema to your database
npx drizzle-kit push
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database (Neon)
DATABASE_URL=

# Auth (better-auth)
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_AUTH_CLIENT_ID=
GOOGLE_AUTH_CLIENT_SECRET=

# Cloudinary (image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Stripe (payments - optional for dev)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Upstash Redis (rate limiting - optional for dev)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Resend (email - optional for dev)
RESEND_API_KEY=

# Email verification toggle
REQUIRE_EMAIL_VERIFICATION=false
```

> **Note:** Rate limiting, payments, and email are disabled in development by default. You only need `DATABASE_URL`, `BETTER_AUTH_SECRET`, and Cloudinary credentials to run the app locally.

---

## Project Structure

```
beehive-books/
├── app/
│   └── [locale]/
│       ├── (app)/          # Authenticated app routes
│       │   ├── home/       # Dashboard/feed
│       │   ├── library/    # User's books
│       │   ├── explore/    # Public discovery
│       │   ├── books/      # Book detail + reading
│       │   ├── hive/       # Collaborative writing spaces
│       │   ├── clubs/      # Book clubs
│       │   └── settings/   # User settings
│       └── (auth)/         # Auth pages (sign-in, sign-up, etc.)
├── components/             # Reusable UI components
├── db/
│   ├── schema.ts           # Drizzle schema (all tables)
│   └── index.ts            # DB client
├── lib/
│   ├── actions/            # Server actions
│   ├── auth.ts             # better-auth configuration
│   ├── rate-limit.ts       # Upstash rate limiters
│   └── stripe.ts           # Stripe client
├── messages/               # i18n translation files
└── public/                 # Static assets
```

---

## Key Architectural Decisions

- **Server Actions** — all mutations go through Next.js server actions, not API routes (except Stripe webhooks and auth)
- **Cursor-based pagination** — explore/search uses timestamp cursors, not offset pagination
- **Rate limiting** — all write actions and search endpoints are rate-limited via Upstash Redis
- **Privacy model** — books and content have three visibility levels: Private, Friends, Public. A separate `explorable` flag controls appearance on the public Explore page.
- **Email verification** — toggled via `REQUIRE_EMAIL_VERIFICATION` env var. Disable for local dev.

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npx drizzle-kit push # Push schema changes to database
npx drizzle-kit studio # Open Drizzle Studio (DB browser)
npx playwright test  # Run E2E tests
```

---

## Screenshots

Screenshots and demo GIF coming soon. Visit [beehive-books.app](https://www.beehive-books.app) to see the live app.

---

## Roadmap

Active development is tracked via [GitHub Issues](https://github.com/Cremacious/beehive-books/issues). Current focus areas:

- UI/design system overhaul
- Seed data + Playwright test suite
- Public/guest access (no-auth explore)
- Phase 3 features: favourites, read tracking, user bio

---

## Contributing

This project is currently solo-developed. Contributions are not open at this time but may be in the future.

If you find a bug or have a feature suggestion, please [open an issue](https://github.com/Cremacious/beehive-books/issues).

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.

---

## License

© 2026 Chris Mackall. All rights reserved.

---

## Contact

Built by **Chris Mackall** — a self-taught developer building tools for writers.

- GitHub: [@Cremacious](https://github.com/Cremacious)
- Live app: [beehive-books.app](https://www.beehive-books.app)
