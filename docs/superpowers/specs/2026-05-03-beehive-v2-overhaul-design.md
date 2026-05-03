# Beehive Books v2 Overhaul Design

Date: 2026-05-03

## Product Thesis

Beehive Books v2 is a writer-first author studio with community around the edges. It should compete more directly with writing and planning tools like Google Docs, Scrivener, and Notion-style author workspaces than with social reading sites on day one.

The Royal Road-style discovery layer still matters, but it should support the writing product instead of defining it. Explore, comments, clubs, reading lists, Sparks, profiles, and public discovery should exist at launch and grow as usage grows. The daily-use core is writing, planning, importing, editing, co-writing, feedback, publishing, and export.

## Approved Direction

Use Approach 2.5: new product architecture, schema preservation, selective code reuse.

v1 is a working prototype and reference implementation. It proves the domain and contains reusable pieces, but it should not dictate v2 structure. Preserve the current database schema and user data. Reuse existing code only when review shows it is clean enough and fits the v2 architecture. Rebuild the app shell, workspace UX, route organization, mobile UX, design consistency, feature boundaries, premium gates, and testability.

## Architecture

v2 preserves the current Drizzle/Postgres schema and user records while rebuilding the product around four layers:

1. App shell: simplified global navigation, responsive desktop/mobile layout, ad-aware and premium-aware placements.
2. Project workspace: adaptive book workspace with Draft, Plan, World, Collaborate, Publish, and Export surfaces.
3. Community layer: contextual discovery plus one Community destination containing Explore, Clubs, Sparks, Reading Lists, Friends, and public profiles.
4. Domain services: reusable server-side modules for auth/session, permissions, books, chapters, comments, collaboration, exports, premium gates, notifications, imports, and entitlement checks.

Existing code can be reused only after review. The goal is not to preserve v1 structure. The goal is to preserve user data and proven behavior while giving the product a new center of gravity.

## Navigation Model

Use workspace-first navigation.

Global navigation should be simple:

- Home
- Studio
- Library
- Community
- Profile / Settings
- Admin, only when relevant

Most writing tools live inside each book/project workspace instead of appearing as equal global destinations. This makes the app feel focused and professional while still keeping Community one click away.

## Home

Home is a balanced command center.

The main area should help the writer continue their active work: current project, recent chapter, word progress, draft status, and next writing action. Supporting panels should show what changed while they were away: collaborator activity, comments, reader signals, notifications, and small discovery/community moments.

The first action should usually be continue writing, but the user should also immediately know what is happening in their community.

## Project Workspace

Each book/project workspace is adaptive.

New or empty books open with planning guidance:

- premise
- genre/category
- outline
- characters/world notes
- first chapter call to action

Active books open draft-first:

- chapter list
- editor
- notes
- word progress
- comments
- collaborators
- version/export/publish actions

Users can pin their preferred default workspace surface. This gives beginners structure without slowing down writers who already have momentum.

## Community and Discovery

Use contextual discovery with a clear Community doorway.

Discovery should not compete with writing in the main shell, but it must not feel hidden because public hosting and reader feedback are part of Beehive's identity.

Community contains Explore, Clubs, Sparks, Reading Lists, Friends, and public profiles. Home can show small community panels. Project workspaces can show contextual prompts such as publish chapter, request beta feedback, share to community, or view reader comments.

## Visual Design

Retain the current black, dark gray, yellow, and white palette. Preserve the dark, warm, premium late-night indie bookshop mood from `DESIGN_SYSTEM.md`.

Add a tactile paper UI direction:

- thin stacked cards
- subtle bottom-border depth on cards and buttons
- darker lower edges or inset shadows that make surfaces feel like stacked sheets
- restrained construction-paper grit textures on selected backgrounds

The texture must stay low contrast and must never interfere with readability. The effect should feel handmade, warm, and writerly, not noisy, grungy, or skeuomorphic. The combined visual identity is dark indie bookshop plus stacked paper studio.

## Mobile UX

Mobile should not be a squeezed desktop.

Mobile should prioritize:

- quick writing continuation
- clean reading
- notifications
- comments
- project switching
- lightweight planning
- focused import/export review screens

Deep, layout-heavy tools should use focused screens rather than trying to show the full desktop workspace at once.

## Data and Schema

v2 must preserve existing user data and the current Drizzle/Postgres schema unless a migration is explicitly planned and tested. Existing tables for users, auth, books, chapters, collections, comments, reading progress, reading lists, social, prompts, clubs, hives, notifications, admin, and premium billing remain the durable source of truth.

Schema changes are allowed only when they support the v2 product model and are backward-compatible where possible. Likely additions may include:

- project preferences
- pinned workspace default
- ad/premium entitlement metadata
- export history
- version history
- workspace activity aggregation
- richer collaboration and beta-reader states

Any schema migration must include migration notes, seed/test data impact, rollback consideration, coverage for affected user flows, and no destructive changes to user writing content.

Existing v1 data should appear naturally in v2 workspaces. Books become projects, chapters remain chapters, hives/collab features map into workspace collaboration, and public/social data appears under Community.

## Import and Repair

v2 needs a reliable manuscript import pipeline. Existing v1 import issues, such as chapter body text landing in chapter titles or missing content, are known defects to design against.

Imports should support common author sources:

- `.docx`
- `.txt`
- `.md`
- pasted rich text
- eventually EPUB/imported public-domain sources if still useful

The import flow should not immediately commit messy parsed results. It should include a review step:

1. Upload or paste manuscript.
2. Parse into detected title, chapters, sections, and content.
3. Show an import preview with editable chapter boundaries and titles.
4. Flag suspicious results such as very long chapter titles, empty chapters, duplicated headings, or huge unassigned content blocks.
5. Let the user merge, split, rename, or reassign sections before saving.
6. Save only after confirmation.

For v1 data that imported badly, v2 should include repair tools where practical: detect suspicious chapters, suggest title/body cleanup, and allow bulk correction without losing text.

Testing should include fixture documents for clean `.docx`, messy `.docx`, plain text with inconsistent chapter headings, public-domain style text, pasted content with odd formatting, and very large manuscripts.

Basic import should be free. Advanced import/repair, export formats, and versioned import history can be premium features.

## Testing and CI

v2 should be built so tests are natural to add and maintain. The architecture should separate domain logic from UI enough that permission checks, premium gates, import parsing, export generation, validators, and server helpers can be unit tested.

Playwright should cover critical user journeys:

- sign up, onboarding, and sign in
- create book/project
- import manuscript and review parsed chapters
- write/edit chapter
- plan/worldbuilding workflow
- publish/share to Community
- comments/feedback
- premium gating and upgrade
- ad visibility for free users and absence for premium users
- mobile layout smoke tests

Jest or Vitest should cover:

- import parsing heuristics
- permissions
- premium entitlements
- schema-safe domain helpers
- validation
- pricing/limit calculations
- export helpers where feasible

GitHub Actions should eventually run lint, typecheck, unit tests, Playwright smoke tests, and fuller E2E on main or pre-release branches.

## Optimization and Operations

v2 should be built with cost control and performance in mind from the beginning.

Performance priorities:

- Keep editor, export tools, import tools, and rich collaboration features out of the initial Home bundle.
- Prefer server components and server actions where they reduce client JavaScript.
- Use client components only for interactive surfaces: editor, sortable lists, drawers, comments, notifications, workspace panels.
- Use cursor pagination for Community/Explore feeds.
- Lazy-load heavy tools like TipTap, DOCX/PDF/EPUB export, import preview, charts, and collaboration panels.
- Optimize Cloudinary image usage with consistent cover sizes, responsive transformations, placeholders, and upload limits.
- Make mobile flows first-class, not afterthought responsive wrappers.

Cost-control priorities:

- Free user limits should reduce runaway storage, import, and export usage.
- Ads should subsidize free users but not appear in writing/editor focus surfaces.
- Premium should unlock heavier cost features: advanced exports, version history depth, larger storage, more projects/books, larger collaboration spaces.
- Add guardrails for import size, image upload size, export frequency, and rate-limited write actions.
- Track infra-sensitive events: imports, exports, image uploads, editor saves, feed loads, and notification fanout.

Operations:

- Add basic app health checks and admin visibility for failed imports/exports.
- Log import/export failures in a way that helps diagnose user issues without exposing manuscript content.
- Keep Stripe/web subscriptions and future Apple/Google app subscriptions behind an entitlement layer so UI checks do not care where the user paid.
- Prepare for GitHub Actions but do not block v2 design on perfect CI from day one.

## Monetization

Launch with one paid tier: Plus.

Recommended launch pricing:

- Free: ads, 2 active books/projects, basic editor/planning, basic import, basic publishing/community, comments, limited storage/media.
- Plus: $7.99/month or $59/year. Ad-free, higher or unlimited book limits, EPUB/PDF/DOCX exports, version history, richer planning/worldbuilding, better import/repair tools, and more storage/media.

Do not launch a Pro/Studio tier unless Plus is already a fantastic product. A higher tier can be considered later for advanced collaboration, beta-reader workflows, analytics, larger hives/teams, and priority publishing/export features.

Premium gates should be generous but clear:

- Do not block basic writing.
- Do not block basic publishing.
- Do not block comments.
- Do not block basic community participation.
- Gate expensive or heavy features: advanced exports, repeated large imports, deep version history, large media storage, advanced analytics, and bigger collaboration spaces.

Use ads as free-tier subsidy and premium pressure, not as the core business. Place ads outside writing focus surfaces: Home side panels, Community, Explore, public profiles, reading lists, and between feed sections.

## Rollout

Recommended rollout order:

1. Build the new shell and Home command center.
2. Build the adaptive project workspace.
3. Rebuild/import core writing flows.
4. Add Community doorway and contextual discovery.
5. Add Plus gates and ads.
6. Harden imports/exports.
7. Add Playwright smoke tests and CI.
8. Prepare mobile app shell/export path.

## Open Implementation Notes

- Evaluate existing auth, billing, editor, export, upload, permissions, and server-action code before reusing it.
- Treat import quality as a launch-critical workflow.
- Keep `DESIGN_SYSTEM.md` as the palette source, then extend it with the stacked paper studio direction.
- Use v1 behavior as a checklist so working functionality does not disappear by accident.
