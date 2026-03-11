# Beehive Books

**Beehive Books** is a full-stack social writing and reading platform where authors write, share, collaborate — and readers discover, follow, and engage with stories. Built for writers who want a community, not just a document editor.

🌐 **Live:** [beehive-books.app](https://www.beehive-books.app)

---

## Features

### Library & Writing

- **Rich text editor** powered by TipTap — write chapters with full formatting support
- **Chapter collections** — organize chapters into named groups (acts, parts, arcs) with drag-and-drop reordering
- **Draft status tracking** — mark books as First Draft through Completed
- **Privacy controls** — set books to Public, Friends-only, or Private per book
- **Explorable toggle** — opt individual books into the public Explore hub
- **Cover image uploads** — upload custom book covers via Cloudinary with live preview
- **Word count tracking** — auto-tracked per chapter and aggregated at the book level
- **Author notes** — attach a note to any chapter visible to readers before the content
- **Chapter navigation** — seamless prev/next reading with collection-aware labels

### Hives — Collaborative Writing Spaces

Hives are the core collaborative feature. A Hive is a shared writing project where members co-author a book together.


- **Buzz** — activity feed for hive updates
- **Outline** — collaborative story outline board
- **Wiki** — shared world-building wiki for lore, rules, and notes
- **Timeline** — story timeline planner
- **Word goals** — collaborative word count goals
- **Prompts** — writing prompts scoped to the hive
- **Activity log** — full history of hive events
- **Member management** — roles, invites, join requests, and settings

### Book Clubs

- Create and manage book clubs with custom privacy settings
- **Discussions** — threaded forum-style discussions with replies and likes
- **Club reading list** — shared reading list for the club
- **Member roles** — Owner, Moderator, and Member tiers
- **Invite system** — invite users directly or open to join requests
- **Tag-based discovery** — clubs are searchable by genre tags on the Explore page

### Writing Prompts

- Create timed prompts with a title, description, and end date
- Privacy controls — Public, Friends-only, or Private prompts
- **Prompt entries** — submit rich-text responses to any prompt
- **Entry comments** — comment and reply on entries with likes
- **Explore integration** — public prompts surface on the Explore hub

### Reading Lists

- Create curated reading lists with custom titles and descriptions
- Add, remove, and reorder books in a list
- Mark a "currently reading" book per list
- Privacy controls and public explore support

### Explore Hub

- **Central discovery page** with sections for Books, Clubs, Hives, Prompts, and Reading Lists
- Per-section search pages with filters (genre, category, tags)
- Friends-only content surfaces automatically when signed in
- Server-side cached results (5-minute TTL) — fast for all visitors

### Friend Feed

- Personalized activity feed showing what friends have published in the last 30 days
- Feed events: new books, new chapters, new clubs, club discussions, new prompts, new reading lists, new hives
- Sorted by recency with user attribution and direct links

### Friends & Social

- Send, accept, and decline friend requests
- View friend profiles at `/u/[username]`
- Friends-only privacy tier across all content types
- Friend-gated Explore results (Friends content only visible to actual friends)

### Notifications

- In-app notification bell with unread badge count
- Notifications for: new followers, friend requests, likes, comments, replies, club invites, hive invites, prompt invites, and more
- Mark all as read in one click
- Notification panel with direct links to the relevant content

### Profiles & Settings

- Public user profiles at `/u/[username]`
- **Profile settings** — update display name and avatar (Cloudinary-backed)
- **Privacy settings** — control profile and content visibility
- **Notification settings** — granular control over notification types
- **Account settings** — manage account details

### Auth & Onboarding

- Authentication via **Clerk** — sign up, sign in, session management
- Guided onboarding flow — choose a username and upload a profile photo before accessing the app
- Self-healing metadata sync — Clerk JWT is kept in sync with the database, making middleware auth essentially zero-cost after first login

### Premium Tier

- `premium` flag per user — unlockable for power users
- **Free accounts**: 1 book, 1 club, 1 hive, 1 reading list, 1 prompt
- **Premium accounts**: 8 of each resource type
- Centralized limits config in `lib/config/premium.config.ts` — easy to adjust

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Neon (PostgreSQL) via Drizzle ORM |
| Auth | Clerk |
| State | Zustand + React Query |
| Editor | TipTap |
| Drag & Drop | @dnd-kit |
| Images | Cloudinary |
| IDs | @paralleldrive/cuid2 |
| Deployment | Vercel |

---

## Project Structure

```
app/
  (auth)/          # Sign-in, sign-up, onboarding
  (app)/           # All authenticated routes
    feed/          # Friend activity feed
    explore/       # Public discovery hub
    library/       # Personal book library + reader
    write/         # Writing interface
    hive/          # Collaborative hive spaces
    clubs/         # Book clubs
    prompts/       # Writing prompts
    reading-lists/ # Curated reading lists
    friends/       # Friend management
    notifications/ # Notification center
    settings/      # Profile, privacy, account
    u/[username]/  # Public user profiles

components/        # All UI components
lib/
  actions/         # Server actions (data layer)
  stores/          # Zustand client stores
  types/           # Shared TypeScript types
  validations/     # Zod schemas
  config/          # App configuration (premium limits, etc.)
db/
  schema.ts        # Full Drizzle ORM schema
```

---

## Local Development

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Clerk](https://clerk.com) application
- A [Cloudinary](https://cloudinary.com) account

### Setup

```bash
git clone https://github.com/your-username/beehive-books-online.git
cd beehive-books-online
npm install
```

Create a `.env` file:

```env
DATABASE_URL=your_neon_connection_string

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Push the database schema:

```bash
npx drizzle-kit push
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
