# Proposal: Fix Button Hover Styles

## Intent

The reusable `<ui-button>` atom (30+ usages) has three visual defects:
1. **Hover**: thick inner-border artifact instead of subtle background transition
2. **Vertical centering**: content misaligned when host height is overridden via Tailwind
3. **Style inconsistency**: pervasive `!important` overrides signal default variant/size gaps

## Scope

### In Scope
- Fix hover: remove border artifacts, ensure smooth background-only transitions
- Fix vertical centering: align content correctly with and without host height overrides
- Normalize border model: switch to `border: none` baseline, keep explicit border on outline variant only
- Scope CSS transitions to `background-color` and `color` only
- Validate across all 5 variants × 3 sizes

### Out of Scope
- Adding variants or sizes
- Replacing inline Tailwind overrides with new props (separate change)
- Template structure or loading spinner changes

## Capabilities

### Modified Capabilities
- **button-atom**: hover behavior, vertical alignment, border model, and transition scoping

## Approach

**SCSS-only fix** to `button.component.scss`:
1. Replace `border: 1px solid transparent` with `border: none`; outline variant keeps explicit `border`
2. Add `height: 100%` to `.button` so it fills host when Tailwind overrides host dimensions
3. Narrow transitions from 4 properties to `background-color, color` (drop `border-color, box-shadow`)
4. Add `vertical-align: middle` to `:host` to prevent baseline shift from `line-height: 0`
5. Add computed-style assertions to spec for hover states

Zero template/TS changes — fixes propagate automatically.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/components/atoms/button/button.component.scss` | Modified | Border, transitions, height, host alignment |
| `src/app/components/atoms/button/button.component.spec.ts` | Modified | Hover-state computed-style assertions |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Outline variant loses visible border | Low | Explicit border on outline only |
| `height: 100%` conflicts with icon variant fixed dimensions | Low | Icon rules already set explicit width/height |
| Host `!h-*` + `height: 100%` creates unexpected tall buttons | Medium | Test with common overrides (`!h-10`, `!h-12`, `!h-14`) |

## Rollback Plan

`git revert` — single-file SCSS change, no template or TS modifications.

## Dependencies

- None

## Success Criteria

- [ ] Primary hover: smooth background darkening, no border artifact
- [ ] Content vertically centered across all variant×size combos, with/without host overrides
- [ ] All 5 variants × 3 sizes pass visual inspection
- [ ] Existing unit tests pass; new computed-style assertions added
- [ ] No dark-mode regressions
