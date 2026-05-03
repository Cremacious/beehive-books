# Beehive Books v2 Plan Set

The v2 design is too broad for one executable implementation plan. It spans app shell, workspace UX, imports, community, monetization, performance, and CI. Implement it as a series of independently verifiable plans.

## Plan Sequence

1. `2026-05-03-v2-foundation-shell-plan.md`
   - Build the v2 shell foundation, tactile paper design utilities, simplified navigation, route skeletons, and Playwright shell smoke coverage.
   - No schema changes.

2. `v2-adaptive-project-workspace-plan.md`
   - Build the book/project workspace with adaptive plan-first and draft-first defaults.
   - Reuse existing books/chapters data and editor code after review.

3. `v2-import-repair-plan.md`
   - Build manuscript import parsing, preview, suspicious-result detection, and repair surfaces.
   - Add fixture-driven parser tests and Playwright import review coverage.

4. `v2-community-doorway-plan.md`
   - Reorganize Explore, Clubs, Sparks, Reading Lists, Friends, and profiles under Community.
   - Add contextual discovery links from Home and project workspaces.

5. `v2-plus-entitlements-ads-plan.md`
   - Add a central entitlement layer for free/Plus limits, ad visibility, export gates, import repair gates, and future app-store subscriptions.

6. `v2-optimization-ci-plan.md`
   - Add bundle/performance guardrails, GitHub Actions, Playwright smoke separation, and operational logging for import/export failures.

Each plan should be written and reviewed before implementation begins. The first executable plan is the foundation shell plan.
