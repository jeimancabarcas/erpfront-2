# Design: Phase 1 Foundation — Design Token System

## Technical Approach

Define all visual primitives in Tailwind CSS v4's `@theme` block within `src/styles.css`. Color and shadow tokens are CSS custom properties (via `--color-*`, `--shadow-*` semantic namespacing) so dark mode can override them by reassigning the same properties under a `.dark` selector. Typography, spacing, and radii use static Tailwind theme values — no dark variants needed. The `@variant dark` directive enables `dark:` utility classes across all components. Existing pages are completely untouched; no component templates or page styles change.

## Token Architecture

```
styles.css
├── @import 'tailwindcss'
├── @import "@angular/material/..."
│
├── @theme {                          ← ~200 lines of token definitions
│   --color-*          (11 families — light values only)
│   --font-*           (Inter, system-ui)
│   --text-*           (8 sizes × line-height + letter-spacing)
│   --spacing-*        (12 values, 4px grid)
│   --radius-*         (5 values: 6, 12, 16, 24, 9999 px)
│   --shadow-*         (4 elevations — light values only)
│   --ease-*           (3 cubic-bezier curves)
│   --animate-*        (4 duration tokens)
│   --default-*        (font-family, line-height, font-weight)
│ }
│
│
├── @variant dark (&:where(.dark, .dark *)) {
│   --color-bg, --color-surface …   ← Reassign 11 color vars
│   --shadow-sm, --shadow-md …      ← Reassign 4 shadow vars
│ }
│
│
├── @layer base {
│   body { }                         ← font-family, bg, text, antialias
│   h1–h6 { }                        ← sizes from type scale
│   ::selection { }
│   ::-webkit-scrollbar { … }        ← WebKit thin scrollbar
│   * { scrollbar-width: thin }      ← Firefox thin scrollbar
│   :focus-visible { outline }       ← Unified focus ring
│ }
```

**Key motivation for CSS custom properties**: Tailwind v4 `@theme` generates both utility classes (`bg-surface`) AND CSS custom properties (`var(--color-surface)`). By putting light values in `@theme` and overriding in `.dark`, ALL consumers — Tailwind utilities, Angular component styles, inline `style` bindings — switch theme with a single `.dark` class on `<html>`. No selector specificity battles, no `!important`.

## Architecture Decisions

### Decision: All in `styles.css` vs. separate token files

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Single `styles.css` | One file to maintain, Angular loads it once | **Chosen** — explicit constraint from spec |
| `_tokens.css` partial | Import chain complexity, no build benefit with Tailwind v4 | Rejected — Tailwind already processes via PostCSS |

### Decision: `@variant dark` vs. `.dark` hardcoded overrides

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `@variant dark` | Enables `dark:bg-surface` utilities in templates, CSS-only | **Chosen** — unlocks dark utility classes for all future phases |
| Hand-written `.dark` block | Works but requires manual token reassignment in EVERY component | Rejected — no dark utility support |

### Decision: Inter from Google Fonts CDN vs. self-hosted

Inter is already loaded in `index.html` via Google Fonts CDN (400, 500, 600, 700, 800). CDN is adequate — Inter is stable, caching is universal, and this removes a build-time dependency. Self-hosting would add ~200KB to the bundle for no measurable performance gain given the existing CDN link.

## Color System

All values use Tailwind v4 `--color-{name}` notation. Light values defined in `@theme`, dark values reassigned in `.dark { }`.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-bg` | `#F9FAFB` | `#111827` | Page background |
| `--color-surface` | `#FFFFFF` | `#1F2937` | Cards, modals, dropdowns |
| `--color-text-primary` | `#111827` | `#F9FAFB` | Body text, headings |
| `--color-text-secondary` | `#6B7280` | `#9CA3AF` | Labels, captions, muted text |
| `--color-border` | `#F3F4F6` | `#374151` | Dividers, borders, strokes |
| `--color-accent` | `#4F46E5` | `#6366F1` | Primary buttons, links, active states |
| `--color-accent-hover` | `#6366F1` | `#818CF8` | Accent hover state |
| `--color-success` | `#10B981` | `#10B981` | Status: success indicator |
| `--color-warning` | `#F59E0B` | `#F59E0B` | Status: warning indicator |
| `--color-error` | `#EF4444` | `#EF4444` | Status: error indicator |
| `--color-interactive-active` | `#F3F4F6` | `#374151` | Active/pressed state on interactive elements |

### WCAG Contrast Compliance

| Pairing | Ratio | Small Text ≥4.5:1 | Large Text ≥3:1 |
|---------|-------|:---:|:---:|
| text-primary on bg | 16.8:1 | ✅ AAA | ✅ AAA |
| text-primary on surface | 17.0:1 | ✅ AAA | ✅ AAA |
| text-secondary on bg | 4.6:1 | ✅ AA | ✅ AAA |
| text-secondary on surface | 4.7:1 | ✅ AA | ✅ AAA |
| accent on bg (light) | 6.0:1 | ✅ AA | ✅ AAA |
| accent on surface (light) | 6.3:1 | ✅ AA | ✅ AAA |
| accent on bg (dark) | 3.9:1 | ❌ | ✅ AA |
| accent-hover on bg (light) | 4.5:1 | ✅ AA | ✅ AAA |
| error on bg | 3.6:1 | ❌ | ✅ AA |
| success on bg | 2.4:1 | ❌ | ❌ |
| warning on bg | 2.1:1 | ❌ | ❌ |

**Risk flag**: Status colors (success, warning, error) fail AA against `bg` and `surface` — they are indicator-only in Phase 1. Any text inside a status badge MUST use `text-white` or `text-primary` overlay, never the status color as foreground. Accent in dark mode (3.9:1) fails AA for small text — flag for Phase 2 button/button-text design.

### Color Cascade

```
@theme                          .dark
──color-bg: #F9FAFB             ──color-bg: #111827
──color-surface: #FFFFFF        ──color-surface: #1F2937
──color-text-primary: #111827   ──color-text-primary: #F9FAFB
       ↓                                ↓
Tailwind utility: bg-bg        Tailwind utility: dark:bg-bg
CSS var: var(--color-bg)       CSS var: var(--color-bg)  ← same name, value swapped
```

## Typography

Already set via `index.html`: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">`

No font-face declarations needed — CDN handles it. All 5 weights (400/500/600/700/800) are real weights, not faux-bold.

```
@theme {
  --font-*: "Inter", "system-ui", sans-serif;    // default font stack
  --font-mono: "SF Mono", "Fira Code", monospace; // optional
}
```

| Token | Size | Line Height | Letter Spacing |
|-------|------|-------------|----------------|
| `--text-xs` | 0.75rem (12px) | 1rem | 0.01em |
| `--text-sm` | 0.875rem (14px) | 1.25rem | 0.005em |
| `--text-base` | 1rem (16px) | 1.5rem | 0 |
| `--text-lg` | 1.125rem (18px) | 1.75rem | 0 |
| `--text-xl` | 1.25rem (20px) | 1.75rem | -0.01em |
| `--text-2xl` | 1.5rem (24px) | 2rem | -0.01em |
| `--text-3xl` | 1.875rem (30px) | 2.25rem | -0.02em |
| `--text-4xl` | 2.25rem (36px) | 2.5rem | -0.02em |

## Spacing

4px grid base (1 unit = 4px → 0.25rem). Tailwind v4 maps `--spacing-{n}` where n = pixel value.

| --spacing | px | rem | Typical use |
|-----------|----|-----|-------------|
| 4 | 4px | 0.25rem | Icon inset |
| 8 | 8px | 0.5rem | Tight padding |
| 12 | 12px | 0.75rem | Dense gap |
| 16 | 16px | 1rem | Standard padding |
| 20 | 20px | 1.25rem | Section inset |
| 24 | 24px | 1.5rem | Card padding |
| 32 | 32px | 2rem | Section margin |
| 40 | 40px | 2.5rem | Page section |
| 48 | 48px | 3rem | Large gap |
| 56 | 56px | 3.5rem | Header/footer |
| 64 | 64px | 4rem | Page padding |
| 80 | 80px | 5rem | Hero section |

## Border Radius

| --radius | Value | Usage |
|----------|-------|-------|
| `--radius-sm` | 6px | Badges, small labels |
| `--radius-md` | 12px | Cards, dialogs default |
| `--radius-lg` | 16px | Larger cards, modals |
| `--radius-xl` | 24px | Search bars, containers |
| `--radius-pill` | 9999px | Pills, tags, search inputs |

Tailwind v4 classes: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full` (maps to pill).

## Shadow System

Soft UI approach — ultra-low opacity, multi-layered for depth.

### Light Mode (in `@theme`)

| --shadow | Value |
|----------|-------|
| sm | `0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)` |
| md | `0 4px 6px rgba(0,0,0,0.02), 0 2px 4px rgba(0,0,0,0.02)` |
| lg | `0 10px 15px rgba(0,0,0,0.02), 0 4px 6px rgba(0,0,0,0.02)` |
| xl | `0 20px 25px rgba(0,0,0,0.02), 0 8px 10px rgba(0,0,0,0.02)` |

### Dark Mode (in `.dark { }` overrides)

Dark shadows need higher opacity to be perceptible on `#1F2937`. Layer opacity scaled ~3× to compensate for the darker background eating shadow falloff.

| --shadow | Value |
|----------|-------|
| sm (dark) | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.10)` |
| md (dark) | `0 4px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)` |
| lg (dark) | `0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.06)` |
| xl (dark) | `0 20px 25px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.06)` |

## Transition / Easing

```
@theme {
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);   /* standard */
  --ease-in:     cubic-bezier(0.4, 0, 1, 1);       /* entrance */
  --ease-out:    cubic-bezier(0, 0, 0.2, 1);        /* exit */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);     /* bidirectional = default */
}
```

| Duration | When to use |
|----------|-------------|
| 150ms | Hover states, micro-interactions (button press) |
| 200ms | Default transition (color changes, bg swap) |
| 300ms | Panel slide, dropdown open |
| 500ms | Modal open, page transition, larger motion |

Usage pattern: `transition-colors duration-200 ease-out` on interactive elements. 150ms for instant feedback (button hover), 200ms for color/surface transitions, 300ms+ for spatial motion.

## Global Styles (`@layer base`)

```css
@layer base {
  body {
    font-family: var(--font-family-sans);
    background-color: var(--color-bg);
    color: var(--color-text-primary);
    line-height: var(--default-line-height);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 { font-weight: 600; }

  ::selection {
    background-color: var(--color-accent);
    color: #ffffff;
  }

  * { scrollbar-width: thin; scrollbar-color: var(--color-border) transparent; }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 3px;
  }

  :focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
}
```

## Dark Mode Mechanism

```css
@variant dark (&:where(.dark, .dark *));
```

This single directive enables `dark:` utility classes across ALL component templates in future phases. For Phase 1, the `.dark` class overrides only CSS custom properties — existing components see no change because they don't reference `var(--color-*)` yet.

**Testing**: Set `.dark` on `<html>` via browser DevTools. No JS toggle until Phase 6.

**CSS-only caveat**: `prefers-color-scheme` is NOT used as the default — light mode always renders first. This avoids flash-of-wrong-theme and keeps Phase 1 purely infrastructure. The `media` query variant can be added in Phase 6 alongside the JS toggle.

## Backward Compatibility

Phase 1 modifies only `styles.css`. All 29 pages remain identical because:
- No component template changes
- `@import '@angular/material/prebuilt-themes/indigo-pink.css'` remains — Material still renders
- Existing arbitrary Tailwind classes (`rounded-[28px]`, `shadow-[0_8px_30px_rgb(0,0,0,0.03)]`) are independent of `@theme` tokens — they continue to work unchanged
- `@boxicons/core` removal is safe: unused dependency, zero imports in codebase

**Testing plan**:
1. `ng build` — 0 errors, 0 warnings
2. Verify `@boxicons/core` absent from `package.json` and no remaining imports
3. Load 3 representative pages (dashboard, inventory, sales) — no layout shift vs. baseline
4. Toggle `.dark` in DevTools — colors should switch, all content still readable
5. WCAG spot-check: text-primary on bg, text-secondary on bg, accent on bg

## Bundle Size Estimate

| Change | Size Impact |
|--------|-------------|
| `@theme` block + globals | ~4.2KB uncompressed (~1.6KB gzip) |
| `.dark` override block | ~0.8KB uncompressed (~0.3KB gzip) |
| `@boxicons/core` removed | **-31.2KB** from bundle |
| **Net CSS impact** | **~5KB increase** (before gzip removal offset) |
| **Net bundle impact** | **≈ -25KB** (gzip: net negative) |

The 5KB budget is easily met. The `@boxicons/core` removal actually makes the bundle smaller overall.
