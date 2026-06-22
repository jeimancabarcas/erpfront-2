# Tasks: Phase 1 Foundation — Design Token System

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~200 (package.json -1, styles.css +180) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

```
Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low
```

## Phase 1: Token Infrastructure

- [x] 1.1 Remove `@boxicons/core: "^1.0.6"` from `package.json` dependencies; run `npm install`
- [x] 1.2 Add `@theme` block to `src/styles.css` — 11 `--color-*` families with light hex values
- [x] 1.3 Add `--font-*`, `--text-*` (8 sizes), `--spacing-*` (12 values, 4px grid), `--radius-*` (5 levels) to `@theme`
- [x] 1.4 Add `--shadow-*` (4 elevations), `--ease-*` (3 easings), and duration tokens to `@theme`

## Phase 2: Dark Mode & Base Styles

- [x] 2.1 Add `@variant dark (&:where(.dark, .dark *))` with color and shadow overrides (dark values)
- [x] 2.2 Add `@layer base` — body, h1–h6, ::selection, scrollbar (WebKit + thin), :focus-visible

## Phase 3: Verification

- [x] 3.1 `npm run build` passes with 0 errors; verify `@boxicons/core` absent from lock file
- [ ] 3.2 Load 3 pages (dashboard, inventory, sales) — no layout shift vs baseline
- [ ] 3.3 Toggle `.dark` class via DevTools on `<html>` — verify all colors switch correctly
- [ ] 3.4 WCAG contrast audit: verify text-primary/bg (≥4.5:1), accent/bg (≥3:1), flag any borderline pairings
