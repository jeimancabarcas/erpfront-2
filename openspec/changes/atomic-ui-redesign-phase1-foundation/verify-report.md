# Verification Report — Phase 1 Foundation

**Change**: `atomic-ui-redesign-phase1-foundation`
**Date**: 2026-06-22
**Status**: **PARTIAL** — passes build + 8/11 FRs, but 3 FRs have issues requiring correction

---

## Build & Lint Results

| Check | Result | Details |
|-------|--------|---------|
| `ng build` | ✅ **0 errors, 0 failures** | 6 warnings (pre-existing — 5× NG8107 optional chaining in `purchase-order-detail-dialog`, 1× bundle budget 500 kB exceeded at 590 kB) |
| `npx tsc --noEmit` | ✅ **0 errors** | Clean compilation |
| `@boxicons/core` in `package.json` | ✅ **Absent** | Not in dependencies or devDependencies |
| `@boxicons/core` in `node_modules` | ✅ **Absent** | `npm ls` shows empty |
| Project-wide `boxicons` references | ✅ **None** | Zero matches in `.ts`, `.html`, `.css`, `.js` |

---

## FR Coverage

| FR | Result | Evidence |
|----|--------|----------|
| **FR1**: `@theme` block with all 6 token categories | ✅ **PASS** | Lines 10–81 contain color (11 families), typography (sans+mono), spacing (12 values), radius (5 levels), shadows (4 elevations), transitions (4 durations + 3 easings) |
| **FR2**: 11 color families with light + dark values | ❌ **FAIL** | All 11 families present in `@theme`. **But 2 color values deviate from spec**: (1) `--color-accent-hover` light is `#4338CA` — spec says `#6366F1`. (2) Dark `--color-accent` is `#818CF8` / `--color-accent-hover` is `#6366F1` — **swapped** per spec (should be `#6366F1` / `#818CF8`). |
| **FR3**: Typography — Inter, 8 sizes, 5 weights | ⚠️ **PARTIAL** | Inter font stack ✅. All 8 sizes defined ✅. 5 weight tokens defined ✅. **But** per-size line-height and letter-spacing values from spec table (e.g., `text-xs` → 1rem line-height, 0.01em tracking) are NOT paired with `--text-*` tokens — only bare rem values. Line-heights defined separately as `--leading-*`. |
| **FR4**: Spacing — 12 values on 4px grid | ✅ **PASS** | `--spacing-1` through `--spacing-20` = 12 values, all multiples of 0.25rem (4px base). Values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80px. |
| **FR5**: Border radius — 5 levels | ✅ **PASS** | `--radius-sm` (6px), `--radius-md` (12px), `--radius-lg` (16px), `--radius-xl` (24px), `--radius-pill` (9999px). |
| **FR6**: Shadows — 4 soft UI elevations | ❌ **FAIL** | Light shadows match spec exactly ✅. **Dark shadow opacities are significantly wrong**: Implementation uses `rgba(0,0,0,0.3)` / `rgba(0,0,0,0.2)` — design spec says `rgba(0,0,0,0.08)` / `rgba(0,0,0,0.10)` (sm), `0.08`/`0.06` (md/lg/xl). ±3× higher than specified. |
| **FR7**: Transition durations + easings | ❌ **FAIL** | All 4 duration tokens present ✅. **Easing tokens mismatch**: `--ease-spring` (`cubic-bezier(0.34, 1.56, 0.64, 1)`) is NOT in spec/design. Missing: `--ease-default` and `--ease-in`. Only `--ease-out` and `--ease-in-out` match the design. |
| **FR8**: Dark mode — `@variant dark` + `.dark` class | ✅ **PASS** | `@variant dark (&:where(.dark, .dark *))` at line 99 ✅. `.dark { }` block correctly overrides all 8 color vars + 4 shadow vars. |
| **FR9**: Global styles in `@layer base` | ⚠️ **PARTIAL** | Body defaults ✅, selection ✅, WebKit scrollbar ✅, focus-visible ✅. **Missing**: h5/h6 heading levels (only h1–h4 defined), Firefox `* { scrollbar-width: thin; scrollbar-color: ... }` not implemented. |
| **FR10**: `@boxicons/core` removed | ✅ **PASS** | Fully removed from package.json, node_modules, and all source files. Build passes with 0 errors. |
| **FR11**: Backward compatibility | ✅ **PASS** | Build passes with 0 errors. No component template files modified (verified against spec). Only `styles.css` changed. |

---

## Token Audit

| Token Domain | Specified | Implemented | Delta |
|-------------|-----------|-------------|-------|
| Color families | 11 | 11 | ✅ Count correct, **2 values wrong** (see FR2) |
| Typography sizes | 8 | 8 | ✅ Count correct, **line-height/tracking metadata missing** |
| Font weights | 5 | 5 | ✅ |
| Spacing values | 12 | 12 | ✅ Values match |
| Border radius | 5 | 5 | ✅ Values match |
| Shadow elevations | 4 | 4 | ✅ Count correct, **dark opacities wrong** (see FR6) |
| Durations | 4 | 4 | ✅ |
| Easings | 3+ | 3 | ⚠️ **Wrong set** — missing 2 spec curves, 1 extra `ease-spring` |

---

## Issues Found

### Critical (value correctness)

1. **FR2: `--color-accent-hover` light value is `#4338CA`, spec says `#6366F1`**
   - `styles.css` line 18: `--color-accent-hover: #4338CA;`
   - Should be: `--color-accent-hover: #6366F1;`

2. **FR2: Dark `--color-accent` / `--color-accent-hover` values are swapped**
   - Line 91: `--color-accent: #818CF8;` → should be `#6366F1`
   - Line 92: `--color-accent-hover: #6366F1;` → should be `#818CF8`

3. **FR6: Dark shadow opacities are ~3× higher than specified**
   - All `.dark` `--shadow-*` use `rgba(0,0,0,0.3/0.2)` — design says `rgba(0,0,0,0.08/0.10)` for sm and `0.08/0.06` for md/lg/xl
   - Lines 93–96

### Moderate (completeness)

4. **FR3: `--text-*` tokens missing paired line-height and letter-spacing metadata**
   - All 8 text tokens are bare `0.75rem`, `0.875rem`, etc.
   - Spec requires each size to include `line-height` and `letter-spacing` (e.g., `--text-xs: 0.75rem 1rem 0.01em;`)

5. **FR7: Easing token set doesn't match design**
   - Missing: `--ease-default: cubic-bezier(0.4, 0, 0.2, 1)` and/or `--ease-in: cubic-bezier(0.4, 0, 1, 1)`
   - Extra: `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` — not in spec or design

6. **FR9: Only h1–h4 defined, h5 and h6 missing**
   - Spec says h1–h6 should have descending font sizes

7. **FR9: Firefox scrollbar styling (`scrollbar-width: thin`) missing**
   - Design specifies `* { scrollbar-width: thin; scrollbar-color: var(--color-border) transparent; }` — not implemented

### Pre-existing (not introduced by Phase 1)

8. **Build warnings**: 5× NG8107 (optional chaining on non-nullable types) + 1× bundle budget exceeded — these exist in the codebase independently of Phase 1 changes.

---

## Summary

```
Status: PARTIAL
Next:  fixes-required
```

**8 of 11 FRs** pass fully (FR1, FR4, FR5, FR8, FR10, FR11) or partially (FR3, FR9). **3 FRs fail** on value correctness (FR2, FR6, FR7).

The build is clean (0 errors) and `@boxicons/core` is successfully removed. The core infrastructure (`@theme`, `.dark`, `@variant dark`, `@layer base`) is in place. The failures are isolated to:
- **Wrong color hex values** (`accent-hover` light, dark accent/accent-hover swap)
- **Wrong dark shadow opacities** (3× higher than designed)
- **Wrong easing tokens** (set doesn't match design)

These are fixable corrections — not architectural issues.
