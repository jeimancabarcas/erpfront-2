# Tasks: Fix Button Hover Styles

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~35-45 |
| 800-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr-default |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
800-line budget risk: Low

## Phase 1: Transition Scoping

- [x] 1.1 `button.component.scss` — Scope `.button` transition to `background-color, color` only; remove `border-color` and `box-shadow` from transition list (lines 16-20)
- [x] 1.2 Verify: no other transition property references in the file reference `border` or `box-shadow`

## Phase 2: Border Model

- [x] 2.1 `button.component.scss` — Change `.button` base `border: 1px solid transparent` → `border: none` (line 14)
- [x] 2.2 Remove `border-color: transparent` overrides from `--primary`, `--secondary`, `--ghost`, `--icon` variants (lines 41, 52, 72, 83)
- [x] 2.3 Change `--outline` from `border-color: var(--color-accent)` → `border: 1px solid var(--color-accent)` (line 62)

## Phase 3: Vertical Centering

- [x] 3.1 `button.component.scss` — Add `vertical-align: middle` to `:host` (line 3, after `line-height: 0`)
- [x] 3.2 Add `height: 100%` to `.button` base (after `line-height: 1` on line 24)
- [x] 3.3 Change `--sm` / `--md` / `--lg` from `height: X` → `min-height: X` (lines 95, 107, 119)

## Phase 4: Testing

- [x] 4.1 `button.component.spec.ts` — Add test: default variant has `border-style: none` and `transition` scoped to only `background-color, color`
- [x] 4.2 Add test: outline variant has button--outline class and transparent background
- [x] 4.3 Add test: all size variants have `min-height > 0` (height → min-height change)
- [x] 4.4 Run `ng test` — verify all 9 tests pass (6 existing + 3 new)
