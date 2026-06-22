# Design Tokens Specification — Phase 1 Foundation

## Purpose

The design token system — colors, typography, spacing, radii, shadows, transitions — defined in Tailwind CSS v4 `@theme` within `src/styles.css`. Single source of truth for all UI components across the entire redesign.

## Requirements

### FR1: Design Token System

Tokens SHALL be defined in Tailwind v4 `@theme` block within `src/styles.css`. All tokens MUST be referenceable via Tailwind utility classes and CSS custom properties (e.g., `bg-surface`, `text-primary`, `shadow-md`, `rounded-lg`).

| Token Domain | Count | Scope |
|-------------|-------|-------|
| Color | 11 families | Light + dark via CSS custom property reassignment |
| Typography | 8 sizes × 5 weights | Inter font stack |
| Spacing | 12 values | 4px grid (4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80) |
| Border radius | 5 tokens | sm (6px), md (12px), lg (16px), xl (24px), pill (9999px) |
| Shadow | 4 elevations | Soft UI — light + dark |
| Transition | 3 durations + 3 easings | 150ms, 200ms, 300ms, 500ms + cubic-bezier |

#### Scenario: Token definition in @theme
- GIVEN `styles.css` is compiled by Tailwind
- WHEN the `@theme` block is processed
- THEN it MUST define all 11 color families, 12 spacing values, 5 radii, 4 elevations, 8 font sizes, and transition tokens

#### Scenario: Component references token
- GIVEN a component template uses `class="bg-surface text-primary rounded-lg shadow-md"`
- WHEN the page renders
- THEN all values MUST resolve from `@theme` (not raw CSS)

#### Scenario: Token change propagates globally
- GIVEN a single token value is updated in `@theme`
- WHEN the project rebuilds
- THEN every component referencing that token MUST reflect the new value automatically

### FR2: Color Palette

The palette MUST define 11 color families. Light values in `@theme`, dark values reassigned in `.dark { }` block. All colors MUST be referenceable via Tailwind utilities.

| Token | Light | Dark | WCAG Target |
|-------|-------|------|-------------|
| `bg` | `#F9FAFB` | `#111827` | — |
| `surface` | `#FFFFFF` | `#1F2937` | — |
| `text-primary` | `#111827` | `#F9FAFB` | AA 4.5:1 |
| `text-secondary` | `#6B7280` | `#9CA3AF` | AA 4.5:1 |
| `border` | `#F3F4F6` | `#374151` | — |
| `accent` | `#4F46E5` | `#6366F1` | AA 4.5:1 |
| `accent-hover` | `#6366F1` | `#818CF8` | AA 4.5:1 |
| `success` | `#10B981` | `#10B981` | AA 4.5:1 |
| `warning` | `#F59E0B` | `#F59E0B` | AA 4.5:1 |
| `error` | `#EF4444` | `#EF4444` | AA 4.5:1 |
| `interactive-active` | `#F3F4F6` | `#374151` | — |

#### Scenario: Light palette on default load
- GIVEN the `<html>` element has no `.dark` class
- WHEN using `bg-bg` or `text-primary`
- THEN light variant values MUST apply (`#F9FAFB` background, `#111827` text)

#### Scenario: Dark palette activates on .dark class
- GIVEN the `<html>` element has `class="dark"`
- WHEN any color token is used
- THEN the dark variant MUST apply (e.g., `#111827` background, `#F9FAFB` text)

#### Scenario: Accent renders correctly
- GIVEN a primary button uses `bg-accent`
- WHEN rendered in light mode
- THEN background MUST be `#4F46E5`

#### Scenario: Status colors are distinguishable
- GIVEN success, warning, and error tokens are displayed side by side
- WHEN visually inspected
- THEN each SHALL be clearly distinguishable from the others (green/amber/red)

#### Scenario: WCAG contrast verification
- GIVEN text-primary (`#111827`) on bg (`#F9FAFB`)
- WHEN contrast ratio is computed
- THEN it MUST meet WCAG AA (≥ 4.5:1 for body text, ≥ 3:1 for large text)

### FR3: Typography Scale

Font family: Inter (primary), system-ui (fallback). Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold).

| Size | Value | Line Height | Letter Spacing |
|------|-------|-------------|----------------|
| xs | 0.75rem | 1rem | 0.01em |
| sm | 0.875rem | 1.25rem | 0.005em |
| base | 1rem | 1.5rem | 0 |
| lg | 1.125rem | 1.75rem | 0 |
| xl | 1.25rem | 1.75rem | -0.01em |
| 2xl | 1.5rem | 2rem | -0.01em |
| 3xl | 1.875rem | 2.25rem | -0.02em |
| 4xl | 2.25rem | 2.5rem | -0.02em |

#### Scenario: Inter is the primary font
- GIVEN the application loads
- WHEN inspecting `<body>` computed `font-family`
- THEN `Inter` MUST be first priority before `system-ui`

#### Scenario: All five weights render distinctly
- GIVEN elements with `font-normal`, `font-medium`, `font-semibold`, `font-bold`, `font-extrabold`
- WHEN rendered
- THEN each weight MUST produce a visually distinct stroke thickness (no faux-bold)

#### Scenario: All eight sizes match spec
- GIVEN elements use `text-xs` through `text-4xl`
- WHEN computed `font-size` is measured
- THEN each MUST match its specified rem value (±1px tolerance)

### FR4: Spacing System

Spacing follows a 4px grid (converted to rem). Twelve values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80px.

#### Scenario: Grid unit is 4px
- GIVEN a container uses `gap-4`
- WHEN measured
- THEN the gap MUST be exactly 16px (4 × 4px base unit)

#### Scenario: All values available as utilities
- GIVEN components use `p-3` and `m-10`
- WHEN rendered
- THEN `p-3` MUST be 12px and `m-10` MUST be 40px

#### Scenario: Increments are consistent
- GIVEN elements with `p-1` through `p-6` are measured
- WHEN comparing consecutive values
- THEN each step MUST differ by exactly 4px

### FR5: Border Radius Tokens

Four named radii + pill: `sm` (6px), `md` (12px), `lg` (16px), `xl` (24px), `pill` (9999px).

#### Scenario: Default card radius
- GIVEN a Card component uses `rounded-md`
- WHEN computed `border-radius` is read
- THEN it MUST be 12px

#### Scenario: Pill radius for search bars and badges
- GIVEN a search input uses `rounded-pill`
- WHEN rendered
- THEN border-radius MUST be 9999px (fully rounded ends)

#### Scenario: Small radius for compact elements
- GIVEN a badge uses `rounded-sm`
- WHEN inspected
- THEN border-radius MUST be 6px

### FR6: Shadow System

Soft UI style — ultra-diffused, low opacity. Four elevation levels with dark mode variants.

| Elevation | Light shadows | Dark shadows (higher opacity) |
|-----------|--------------|-------------------------------|
| sm | `0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)` | Increased opacity for dark bg |
| md | `0 4px 6px rgba(0,0,0,0.02), 0 2px 4px rgba(0,0,0,0.02)` | Increased opacity for dark bg |
| lg | `0 10px 15px rgba(0,0,0,0.02), 0 4px 6px rgba(0,0,0,0.02)` | Increased opacity for dark bg |
| xl | `0 20px 25px rgba(0,0,0,0.02), 0 8px 10px rgba(0,0,0,0.02)` | Increased opacity for dark bg |

#### Scenario: Shadow-md in light mode
- GIVEN an elevated card uses `shadow-md`
- WHEN the page renders in light mode
- THEN `box-shadow` MUST match the md specification

#### Scenario: Dark mode shadows are more visible
- GIVEN a card uses `shadow-md` and `.dark` is active
- WHEN inspected
- THEN shadow opacity MUST be higher than the light variant to remain visible on `#1F2937`

#### Scenario: Elevation hierarchy is perceptible
- GIVEN four elements with `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`
- WHEN compared visually
- THEN each level MUST appear progressively deeper

### FR7: Transition Tokens

Durations: 150ms, 200ms, 300ms, 500ms. Easing: standard smooth curves (cubic-bezier).

#### Scenario: Duration 200ms on hover
- GIVEN a button has `transition-colors duration-200`
- WHEN the user hovers
- THEN the color transition MUST complete in approximately 200ms

#### Scenario: Easing produces smooth animation
- GIVEN an element with `transition-all`
- WHEN its state changes
- THEN the animation MUST follow the defined easing curve (no linear or jerky movement)

### FR8: Dark Mode Infrastructure

`@variant dark (&:where(.dark, .dark *))` in `styles.css`. The `.dark` class on `<html>` MUST trigger all color token dark variants.

#### Scenario: @variant dark directive exists
- GIVEN `styles.css` is parsed
- WHEN searching for `@variant dark`
- THEN the directive MUST exist with the Tailwind v4 selector

#### Scenario: .dark class switches all color tokens
- GIVEN the page is in light mode
- WHEN `document.documentElement.classList.add('dark')` is called
- THEN all tokens with dark variants MUST immediately switch to their dark values

#### Scenario: Light mode is default (no flash)
- GIVEN a user with dark mode preference
- WHEN the page loads before JavaScript
- THEN light theme MUST render (JS toggle comes in Phase 6 — CSS infrastructure only in Phase 1)

### FR9: Global Styles

Body defaults, heading scale, and scrollbar styling in `@layer base`.

#### Scenario: Body defaults applied
- GIVEN the application renders
- WHEN inspecting `<body>` computed styles
- THEN `font-family` MUST start with Inter, `background-color` MUST be `bg`, `color` MUST be `text-primary`

#### Scenario: Heading scale is proportional
- GIVEN `<h1>` through `<h6>` elements
- WHEN font sizes are compared
- THEN each heading level MUST be smaller than the previous, following a descending scale

#### Scenario: Custom scrollbar visible
- GIVEN scrollable content
- WHEN the scrollbar appears
- THEN it MUST use the thin styled variant with border-radius and color tokens

### FR10: Dead Dependency Removal

`@boxicons/core` MUST be removed from `package.json`.

#### Scenario: Removed from package.json
- GIVEN `package.json`
- WHEN searching `dependencies` or `devDependencies`
- THEN `@boxicons/core` MUST NOT be present

#### Scenario: No remaining imports
- GIVEN a project-wide search for `boxicons`
- WHEN searching all `.ts`, `.html`, `.css`, `.js` files
- THEN zero references MUST be found

#### Scenario: Build succeeds after removal
- GIVEN `@boxicons/core` is removed
- WHEN `ng build` runs
- THEN the build MUST complete with 0 errors

### FR11: Backward Compatibility

Phase 1 MUST NOT break existing functionality. All Angular Material components MUST still render.

#### Scenario: Material components render normally
- GIVEN a page that uses `mat-table`, `mat-form-field`, or `mat-button`
- WHEN the page loads after Phase 1 changes
- THEN all Material components MUST render with their original styles

#### Scenario: Build is clean
- GIVEN the project builds
- WHEN `ng build` runs
- THEN 0 errors and 0 warnings MUST be produced

#### Scenario: No unintended layout shift
- GIVEN an existing page is loaded
- WHEN compared visually to a pre-Phase 1 baseline
- THEN layout, spacing, and position MUST be identical

## Acceptance Criteria

| FR | Criterion |
|----|-----------|
| FR1 | `@theme` block in `styles.css` with all 6 token categories |
| FR2 | 11 color families with light values in `@theme` and dark overrides in `.dark` |
| FR3 | Inter loaded, 8 sizes × 5 weights available as Tailwind utilities |
| FR4 | 12 spacing values, all multiples of 4px base |
| FR5 | 5 radius tokens producing correct pixel values |
| FR6 | 4 shadow levels, dark mode variants with increased opacity |
| FR7 | Duration and easing tokens defined |
| FR8 | `@variant dark` directive; `.dark` toggles all color tokens |
| FR9 | Body init, heading scale, styled scrollbar in `@layer base` |
| FR10 | `@boxicons/core` absent, 0 build errors |
| FR11 | 0 build errors, existing pages render without regression |

## Non-functional Requirements

- **Performance**: Design tokens MUST NOT increase CSS bundle size by more than 5KB over baseline.
- **Maintainability**: Token naming MUST follow `{semantic-role}` convention (e.g., `surface`, `text-primary`, `accent-hover`). No hex values outside `@theme`.
- **Accessibility**: Color contrast MUST meet WCAG AA (4.5:1 for body text <18px, 3:1 for large text ≥18px bold or ≥24px). Verify with automated tooling.
