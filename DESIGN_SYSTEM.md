# Beehive Books — Design System

> **Rule #1:** Read this file before touching any UI. Every design decision must reference these rules.
> Use this document as the prompt context when asking Claude to do UI work.

---

## Brand Identity

**Vibe:** Dark, warm, premium — like a late-night indie bookshop. Cozy but confident.
**Not:** Cold, clinical, corporate, or generic SaaS.
**Competitive bar:** Better-looking than Royal Road (low bar). Approaching Kindle/Wattpad quality.

---

## Colour Palette

### Core colours (hardcoded — do not use Tailwind semantic tokens for these)

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-yellow` | `#FFC300` | Primary accent — CTAs, active states, highlights, links |
| `brand-yellow-hover` | `#FFD040` | Hover state for yellow elements |
| `bg-base` | `#141414` | Page background |
| `bg-surface` | `#1c1c1c` | Cards, modals, panels |
| `bg-elevated` | `#252525` | Sidebar, elevated surfaces, input backgrounds |
| `bg-subtle` | `#2a2a2a` | Borders, dividers, inactive backgrounds |
| `text-primary` | `white` / `text-white` | Headings, primary content |
| `text-body` | `text-white/90` | Body text minimum |
| `text-muted` | `text-white/70` | Secondary/supporting text minimum |
| `text-placeholder` | `text-white/30` | Input placeholders only |
| `text-disabled` | `text-white/30` | Disabled states only |

### Text opacity rules (ENFORCED — never go below these)
- **Headings:** `text-white` (100%)
- **Body text:** `text-white/90` minimum
- **Secondary/muted text:** `text-white/70` minimum
- **Labels, captions:** `text-white/60` minimum
- **Placeholders:** `text-white/30` acceptable
- **Disabled:** `text-white/30` acceptable
- ❌ **Never:** `text-white/40` or lower for actual readable content

### Semantic colours
- **Success:** `text-green-400` / `bg-green-400/10`
- **Error:** `text-red-400` / `bg-red-900/20 border-red-500/20`
- **Warning:** `text-yellow-400` / `bg-yellow-400/10`
- **Info:** `text-blue-400` / `bg-blue-400/10`
- **Premium:** `text-[#FFC300]` with `bg-yellow-500/10 border-yellow-500/30`

---

## Typography

### Font families
- **Headings/UI labels:** `mainFont` (custom class — apply to headings, nav labels, button text)
- **Body/reading:** `font-sans` (Geist Sans — default)
- **Code:** `font-mono` (Geist Mono)

### Scale (use these — don't invent sizes)
| Class | Usage |
|-------|-------|
| `text-xs` | Captions, timestamps, badges |
| `text-sm` | Body text, labels, form inputs |
| `text-base` | Default body |
| `text-lg` | Section subheadings |
| `text-xl` | Page subheadings, card titles |
| `text-2xl` | Page headings |
| `text-3xl` | Hero headings |
| `text-4xl+` | Landing page only |

### Font weight
- `font-medium` — labels, nav items
- `font-semibold` — subheadings, emphasis
- `font-bold` — headings, CTAs, key UI text

---

## Spacing & Layout

### Max content widths
| Context | Max width |
|---------|-----------|
| Reading content (chapter reader) | `max-w-2xl` (672px) |
| Forms, auth pages | `max-w-md` (448px) |
| Standard page content | `max-w-4xl` (896px) |
| Wide pages (explore, library grids) | `max-w-6xl` (1152px) |
| Full-width sections | `max-w-7xl` (1280px) |

**Rule:** Every page must have a `max-w-*` constraint. Content must never stretch full-width on large monitors.

### Sidebar widths
- **Collapsed (icon only):** `w-20` (80px) — md screens
- **Compact:** `w-64` (256px) — lg screens
- **Standard:** `w-72` (288px) — xl screens
- **Wide:** `w-80` (320px) — 2xl screens

### Padding scale
- **Page padding:** `px-4` mobile → `px-6` tablet → `px-8` desktop
- **Card padding:** `p-4` compact, `p-6` standard, `p-8` spacious
- **Section gaps:** `gap-4` tight, `gap-6` standard, `gap-8` loose, `gap-12` section breaks

---

## Border Radius

| Class | Usage |
|-------|-------|
| `rounded-lg` (10px) | Default — cards, inputs, buttons |
| `rounded-xl` (12px) | Prominent cards, modals, panels |
| `rounded-2xl` (16px) | Hero cards, feature panels |
| `rounded-full` | Avatars, pill badges, circular buttons |

---

## Borders & Dividers

- **Standard border:** `border border-[#2a2a2a]`
- **Subtle divider:** `border-t border-[#2a2a2a]`
- **Active/focus ring:** `ring-1 ring-[#FFC300]/30`
- **Premium border:** `border border-yellow-500/30`
- **Hover border:** `hover:border-[#FFC300]/40`

---

## Component Patterns

### Cards
```
bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl
hover: hover:border-[#FFC300]/20 transition-colors
```

### Inputs
```
bg-[#252525] border border-[#2a2a2a] rounded-xl px-4 py-3
text-white placeholder-white/30
focus: focus:outline-none focus:ring-1 focus:ring-[#FFC300]/30
```

### Primary button (CTA)
```
bg-[#FFC300] text-black font-bold rounded-full py-3 px-6
hover: hover:bg-[#FFD040]
disabled: disabled:opacity-50 disabled:cursor-not-allowed
```

### Secondary button
```
bg-transparent border border-[#2a2a2a] text-white rounded-xl py-2 px-4
hover: hover:border-[#FFC300]/40 hover:text-[#FFC300]
```

### Ghost button
```
text-white/70 rounded-lg px-3 py-2
hover: hover:text-white hover:bg-white/5
```

### Destructive button
```
text-red-400 border border-red-500/20 rounded-xl
hover: hover:bg-red-400/10
```

### Badge
```
text-xs font-medium px-2 py-0.5 rounded-full
Standard: bg-[#2a2a2a] text-white/70
Premium: bg-yellow-500/10 text-[#FFC300] border border-yellow-500/20
New: bg-green-500/10 text-green-400 border border-green-500/20
Hot: bg-orange-500/10 text-orange-400 border border-orange-500/20
```

### Empty states
- Always explain what the feature does — not just "nothing here"
- Include a CTA button
- Use bee-themed language where natural
- Tone: friendly, encouraging, explains the value

---

## Responsive Breakpoints

| Breakpoint | Width | Notes |
|------------|-------|-------|
| default | 0+ | Mobile first |
| `sm` | 640px | Large phone |
| `md` | 768px | Tablet / sidebar appears |
| `lg` | 1024px | Laptop — sidebar expands |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large monitor |

### Screen targets to test
- 16" laptop (1440×900) — primary dev screen
- 27" 1080p monitor
- 32" 1440p monitor
- Mobile (390px — iPhone 15)

---

## Animations & Transitions

- **Default transition:** `transition-colors duration-200`
- **Hover lift:** `hover:-translate-y-0.5 transition-transform`
- **Skeleton loader:** `animate-pulse bg-[#2a2a2a] rounded`
- **Spinner:** `animate-spin` on Lucide `Loader2`
- **Page transitions:** subtle fade — `animate-in fade-in duration-200`

**Rule:** Every interactive element must have a hover state. No naked buttons.

---

## Avatars

Every avatar must handle 3 states — no exceptions:
1. **Loading:** circular `animate-pulse bg-[#2a2a2a]` skeleton
2. **Loaded:** `<Image>` with `rounded-full object-cover`
3. **Fallback:** initials in a coloured circle — never a broken image icon

```
Ring: ring-2 ring-[#FFC300]/20
Size sm: w-7 h-7
Size md: w-9 h-9 (default)
Size lg: w-12 h-12
Size xl: w-16 h-16
```

---

## Icons

- **Library:** Lucide React (already installed)
- **Size:** `w-4 h-4` small, `w-5 h-5` default, `w-6 h-6` large
- **Colour:** inherit from text colour — don't hardcode icon colours
- **Decorative icons:** add `aria-hidden="true"`

---

## Page Structure Template

Every authenticated page follows this structure:

```tsx
<div className="flex-1 flex flex-col min-h-screen bg-[#141414]">
  {/* Page header */}
  <div className="border-b border-[#2a2a2a] px-6 py-4">
    <h1 className="text-xl font-bold text-white mainFont">Page Title</h1>
  </div>

  {/* Page content */}
  <div className="flex-1 px-4 md:px-6 lg:px-8 py-6 max-w-6xl mx-auto w-full">
    {/* content */}
  </div>
</div>
```

---

## Back Button Pattern

Back buttons are required on all drill-down pages (book detail, chapter, hive sub-pages, etc.).

```tsx
<button className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
  <ChevronLeft className="w-4 h-4" />
  Back to Library
</button>
```

- **Placement:** top-left, before the page heading
- **Label:** always contextual — "Back to Library", "Back to Explore", not just "Back"
- **Min touch target:** 44px height on mobile
- **Not needed on:** Home, Explore, Library, Hive (top-level nav items)

---

## Touch Targets (Mobile)

- **Minimum:** 44×44px for all interactive elements
- **Buttons:** `min-h-[44px]` on mobile
- **Links in nav:** `min-h-[44px]`
- **Icon-only buttons:** wrap in `p-2` minimum

---

## Rules for Claude Code UI Prompts

When asking Claude to build or redesign UI, always include:

1. Reference this file: *"Follow DESIGN_SYSTEM.md"*
2. Specify the page/component
3. Specify the screen sizes to target
4. Reference the vibe: *"dark, warm, late-night bookshop feel"*
5. Use the exact colour tokens from this doc

**Never:**
- Let Claude use light mode colours or white backgrounds
- Let Claude invent new colours outside this palette
- Accept `text-white/40` or lower on readable content
- Accept components without hover states
- Accept layouts without `max-w-*` constraints

---

## Checklist — Before Shipping Any UI

- [ ] All text meets minimum opacity rules
- [ ] Every interactive element has a hover state
- [ ] Page has `max-w-*` constraint
- [ ] Responsive — tested at mobile, laptop, desktop widths
- [ ] Avatars handle all 3 states (loading, loaded, fallback)
- [ ] Back button present on drill-down pages
- [ ] Empty states explain the feature with a CTA
- [ ] Touch targets ≥ 44px on mobile
