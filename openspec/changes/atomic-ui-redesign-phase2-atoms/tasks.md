# Tasks: Phase 2 — Core Atoms

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~2,300–3,700 (30 new files, zero modified) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Foundation → PR 2: Form + Composite → PR 3: Tests |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

```
Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High
```

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation atoms (Badge, Spinner, Divider, Skeleton, Avatar) | PR 1 | main branch; zero deps, fully parallel |
| 2 | Form + Composite atoms (Input, Select, Toggle, Button, Card) | PR 2 | main after PR 1; tokens only, no atom→atom imports |
| 3 | Tests + build verification for all 10 atoms | PR 3 | main after PR 2 |

## Phase 1: Foundation Atoms

- [x] 1.1 Create `badge.component.ts` + `.scss` — status/success/warning/error, counter pill, dot indicator, role="status"
- [x] 1.2 Create `spinner.component.ts` + `.scss` — sm/md/lg, CSS-only rotate animation, role="progressbar"
- [x] 1.3 Create `divider.component.ts` + `.scss` — horizontal/vertical, label slot, role="separator"
- [x] 1.4 Create `skeleton.component.ts` + `.scss` — text/card/table-row/circle, pulse anim, aria-busy
- [x] 1.5 Create `avatar.component.ts` + `.scss` — img+initials fallback, sm/md/lg, error handling

## Phase 2: Form Atoms

- [x] 2.1 Create `input.component.ts` + `.scss` — text/number/textarea/password, floating label, error, clearable
- [x] 2.2 Create `select.component.ts` + `.scss` — searchable dropdown, filtered options, role="listbox"
- [x] 2.3 Create `toggle.component.ts` + `.scss` — role="switch", animated knob 44x24, Space key toggle

## Phase 3: Composite Atoms

- [x] 3.1 Create `button.component.ts` + `.scss` — 5 variants, sm/md/lg, loading ng-content slot, disabled
- [x] 3.2 Create `card.component.ts` + `.scss` — [card-header/content/footer] slots, hover shadow lift

## Phase 4: Tests + Build Verify

- [x] 4.1 Write specs: Badge, Spinner, Divider, Skeleton, Avatar — happy path, edge case, dark mode
- [x] 4.2 Write specs: Input, Select, Toggle — I/O contracts, disabled, a11y ARIA
- [x] 4.3 Write specs: Button, Card — variant CSS, loading slot, slot rendering
- [x] 4.4 `npx tsc --noEmit` + `npm run build` — TypeScript + build pass with 0 errors
