# FitQuest — Codex Agent Instructions

## Project Overview

FitQuest is a fitness PWA built with **React + Ionic + Tailwind CSS v4 + TypeScript + Vite**.
Source of truth for visual styling: `tailwind.config.js` and `src/app/styles/global.css`.

---

## CRITICAL: No Arbitrary Values

**NEVER use Tailwind bracket syntax (`-[...]`) for visual properties.**
This is the single most important rule. Every `shadow-[...]`, `rounded-[...]`, `text-[...]`, `tracking-[...]`, `bg-[#...]`, `bg-[linear-gradient(...)]` you write creates technical debt that must be manually cleaned up.

### What is FORBIDDEN

```tsx
// ❌ ALL of these are forbidden
className="shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
className="rounded-[1.5rem]"
className="text-[0.95rem]"
className="text-[2rem]"
className="tracking-[0.24em]"
className="tracking-[-0.06em]"
className="leading-[1.02]"
className="bg-[#d7f9f1]"
className="bg-[linear-gradient(180deg,...)]"
className="max-w-[24rem]"
className="min-h-[42rem]"
className="top-[2.6rem]"
className="grid-cols-[1.08fr_0.92fr]"
className="w-[min(560px,92vw)]"
className="h-[calc(100vh-4rem)]"
className="transition-[width]"
className="ring-offset-[color:var(--background)]"
className="z-[9999]"
className="border-[3px]"
```

### What to use INSTEAD

| Category | Use theme tokens / CSS classes | Reference |
|----------|-------------------------------|-----------|
| **Font size** | `text-2xs` `text-caption` `text-description` `text-body` `text-label` `text-card-title` `text-section-title` `text-subtitle` `text-screen-title` `text-highlight` `text-display` | `tailwind.config.js` → `fontSize` |
| **Letter spacing** | `tracking-tight` `tracking-normal` `tracking-wide` `tracking-caps` `tracking-caps-wide` `tracking-tighter` | `tailwind.config.js` → `letterSpacing` |
| **Border radius** | `rounded-sm` `rounded-md` `rounded-lg` `rounded-xl` `rounded-2xl` `rounded-3xl` `rounded-full` | `tailwind.config.js` → `borderRadius` |
| **Shadows** | `shadow-soft` `shadow-card` `shadow-elevated` `shadow-float` `shadow-overlay` `shadow-deep` `shadow-dramatic` `shadow-btn-*` `shadow-glow-*` `shadow-badge` `shadow-ring-focus` | `tailwind.config.js` → `boxShadow` |
| **Z-index** | `z-10` `z-20` `z-30` `z-40` `z-50` `z-modal` `z-dropdown` `z-tooltip` `z-toast` | `tailwind.config.js` → `zIndex` |
| **Max width** | `max-w-sm` `max-w-md` `max-w-lg` ... `max-w-modal` `max-w-modal-lg` `max-w-modal-xl` `max-w-toast` `max-w-drawer` `max-w-popover` `max-w-chat-bubble` `max-w-prose-xs` | `tailwind.config.js` → `maxWidth` |
| **Transitions** | `transition-width` `transition-height` `transition-interactive` `transition-colors` `transition-all` `transition-transform` | `tailwind.config.js` → `transitionProperty` |
| **Spacing (w/h/m/p)** | Use the numeric scale: `w-80` (320px), `h-14` (56px), `p-4` (16px). TW v4 supports any number including decimals. | Tailwind spacing = N × 0.25rem |
| **Gradients** | Create a CSS class in `global.css` under `@layer components` | See `fq-login-bg`, `fq-progress-*` examples |
| **Complex layouts** | Use `fq-grid-*` CSS classes or create new ones | `global.css` → grid layout presets |
| **Viewport heights** | `fq-h-page`, `fq-h-modal-*`, `fq-max-h-panel`, `fq-min-h-page` | `global.css` → viewport heights |
| **Safe area** | `fq-pb-safe-tabs`, `fq-quick-actions-fab` | `global.css` → safe area spacing |

### How to handle cases not covered by tokens

1. **If a standard Tailwind utility exists** → use it (e.g. `max-w-md`, `rounded-full`, `leading-relaxed`)
2. **If a token exists in tailwind.config.js** → use it (e.g. `shadow-card`, `text-description`)
3. **If a CSS class exists in global.css** → use it (e.g. `fq-login-bg`, `fq-grid-main-sidebar`)
4. **If none of the above** → create a new semantic CSS class in `global.css` with `@apply` or raw CSS, then reference the class name in JSX. **Never inline the arbitrary value.**

---

## Typography Rules

- **Max font size is 18px** (`text-screen-title` / `text-display`). Never go larger.
- ~92% of text should be 12-14px (`text-caption`, `text-description`, `text-body`).
- Font family is **Inter** — do not change or add other fonts.
- Use semantic font size tokens, not pixel/rem values.
- For uppercase labels: combine `uppercase` with `tracking-caps` or `tracking-caps-wide`.

---

## Opacity Rules

Use only these standard increments for opacity modifiers: `/5`, `/10`, `/15`, `/20`, `/25`, `/30`, `/35`, `/40`, `/50`, `/60`, `/70`, `/80`, `/85`, `/90`, `/95`.

```tsx
// ❌ Forbidden
className="bg-primary/8"
className="bg-primary/12"
className="bg-white/72"
className="bg-white/82"

// ✅ Correct
className="bg-primary/10"
className="bg-primary/15"
className="bg-white/70"
className="bg-white/80"
```

---

## Sizing Shorthand

Use `size-*` for equal width and height instead of `h-* w-*`:

```tsx
// ❌ Verbose
className="h-10 w-10"
// ✅ Concise
className="size-10"
```

---

## Component Patterns

### Decorative Elements (blurs/glows)
- Use `hidden lg:block` to hide on mobile — do not clutter mobile with decorative blurs.
- Use `pointer-events-none absolute` for positioning.
- Standard negative offsets: `-left-16`, `-top-16`, not `left-[-4rem]`.

### Responsive Strategy
- **Mobile-first**: start with mobile styles, add `sm:`, `md:`, `lg:`, `xl:` breakpoints.
- Mobile should be clean and simple — remove visual noise (gradients, glows, complex shadows).
- Desktop can be richer with cards, panels, and decorative elements.

### Cards / Surfaces
- Use `shadow-card` for standard cards, `shadow-elevated` for raised, `shadow-deep` for prominent.
- Use `rounded-xl` or `rounded-2xl` for cards. Never `rounded-[1.5rem]` or `rounded-[2rem]`.
- Borders: `border border-border/70` is the standard pattern.

### Forms
- Input height: `h-14` (56px) for prominent inputs, `h-10` (40px) for standard.
- Input radius: `rounded-2xl` for on-brand, `rounded-lg` for standard.
- Focus states: use default Tailwind `focus-visible:ring-2` — do not customize with arbitrary ring-offset colors.

---

## File Organization

| File | Purpose |
|------|---------|
| `tailwind.config.js` | Theme tokens (fonts, shadows, radii, z-index, maxWidth, transitions) |
| `src/app/styles/global.css` | CSS custom properties, semantic utility classes (`.fq-*`), keyframes |
| `src/shared/ui/` | Reusable UI primitives (FqButton, FqCard, FqInput, etc.) |
| `src/features/` | Feature-specific pages and components |

---

## Before Submitting Code

Run this self-check:

```bash
# Must return ZERO results (excluding data-[] selectors)
grep -roh '[a-z-]*-\[[^]]*\]' src/ --include='*.tsx' --include='*.css' | grep -v '^data-\[' | sort -u
```

If any results appear, replace those patterns with theme tokens or CSS classes before committing.

---

## Quick Reference: Common Mappings

| Instead of | Use |
|------------|-----|
| `text-[0.75rem]` | `text-caption` |
| `text-[0.875rem]` | `text-body` |
| `text-[1rem]` | `text-section-title` |
| `text-[1.125rem]` | `text-screen-title` |
| `tracking-[0.14em]` | `tracking-caps` |
| `tracking-[0.16em]` | `tracking-caps-wide` |
| `tracking-[-0.02em]` | `tracking-tight` |
| `rounded-[12px]` / `rounded-[14px]` | `rounded-xl` |
| `rounded-[16px]` – `rounded-[24px]` | `rounded-2xl` |
| `shadow-[0_4px_12px_...]` | `shadow-card` |
| `shadow-[0_8px_20px_...]` | `shadow-elevated` |
| `shadow-[0_12px_28px_...]` | `shadow-float` |
| `z-[60]` | `z-modal` |
| `z-[80]` | `z-dropdown` |
| `z-[90]` | `z-toast` |
| `w-[320px]` | `w-80` |
| `h-[56px]` | `h-14` |
| `max-w-[560px]` | `max-w-modal` or `max-w-xl` |
| `transition-[width]` | `transition-width` |
| `bg-[linear-gradient(...)]` | Create `.fq-*` class in `global.css` |
| `grid-cols-[complex]` | Use `fq-grid-*` class from `global.css` |
