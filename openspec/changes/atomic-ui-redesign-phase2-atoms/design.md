# Design: Phase 2 — Core Atoms

## Technical Approach

10 standalone Angular atoms using Phase 1 CSS custom properties. Zero Material deps. Each atom gets its own directory under `src/app/components/atoms/` with a `.ts` file (template + logic), `.scss` file (token-only styles), and `.spec.ts` (tests). All components use signal-based inputs, inline HTML templates (existing project convention), and external SCSS for token-driven styling.

Dark mode is automatic — `.dark` ancestor overrides the CSS vars defined in `styles.css`. No component needs to know about dark mode.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|---|---|
| **Styling model** | SCSS files with `var(--token)` | Inline Tailwind classes, CSS Modules | Tailwind can't express `var(--color-accent)` in v4's `@apply` context without workarounds. SCSS + `var()` is the most direct path to Phase 1 tokens. |
| **Component structure** | Single `.ts` + `.scss` per atom | Separate `.html` for each | Inline templates in `.ts` match existing project convention (every existing atom uses inline templates). SCSS externalized to stay within 4kB component style budget. |
| **Form control pattern** | Controlled components (`value` input + `valueChange` output) | `ControlValueAccessor` + `ngModel` | CVA adds complexity for atoms that only some molecules will use via reactive forms. Simple I/O pairs keep atoms framework-agnostic. |
| **Spinner in Button** | `ng-content="ui-spinner"` slot | Always render SpinnerAtom internally | Consumer may want custom loading indicator. Content projection makes Button composable without coupling to SpinnerAtom's API. |
| **SelectAtom dropdown** | Inline DOM + CSS (no CDK Overlay) | `@angular/cdk/overlay` | Zero CDK import rule. Inline dropdown with absolute positioning covers the 3 use cases in this ERP. |

## Data Flow

```
User Event → Component Handler → Signal/Binding Update → Change Detection → Template Re-render
                                    ↓
                              Output emit → Parent Component
```

Each atom is a presentation component: inputs in, events out. No service injection, no async pipes, no side effects. State is managed by the parent through Angular bindings.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/components/atoms/button/button.component.ts` | Create | ButtonAtom standalone component |
| `src/app/components/atoms/button/button.component.scss` | Create | Button token-driven styles |
| `src/app/components/atoms/input/input.component.ts` | Create | InputAtom standalone component |
| `src/app/components/atoms/input/input.component.scss` | Create | Input token-driven styles |
| `src/app/components/atoms/select/select.component.ts` | Create | SelectAtom with dropdown |
| `src/app/components/atoms/select/select.component.scss` | Create | Select token-driven styles |
| `src/app/components/atoms/card/card.component.ts` | Create | CardAtom with content slots |
| `src/app/components/atoms/card/card.component.scss` | Create | Card token-driven styles |
| `src/app/components/atoms/badge/badge.component.ts` | Create | BadgeAtom status/counter/dot |
| `src/app/components/atoms/badge/badge.component.scss` | Create | Badge token-driven styles |
| `src/app/components/atoms/avatar/avatar.component.ts` | Create | AvatarAtom with img+fallback |
| `src/app/components/atoms/avatar/avatar.component.scss` | Create | Avatar token-driven styles |
| `src/app/components/atoms/skeleton/skeleton.component.ts` | Create | SkeletonAtom loading placeholder |
| `src/app/components/atoms/skeleton/skeleton.component.scss` | Create | Skeleton pulse animation |
| `src/app/components/atoms/divider/divider.component.ts` | Create | DividerAtom H/V with label |
| `src/app/components/atoms/divider/divider.component.scss` | Create | Divider token-driven styles |
| `src/app/components/atoms/spinner/spinner.component.ts` | Create | SpinnerAtom CSS-only spinner |
| `src/app/components/atoms/spinner/spinner.component.scss` | Create | Spinner rotation animation |
| `src/app/components/atoms/toggle/toggle.component.ts` | Create | ToggleAtom switch component |
| `src/app/components/atoms/toggle/toggle.component.scss` | Create | Toggle knob/track animation |

**20 files total** (10 `.ts` + 10 `.scss`). Tests created in sdd-tasks phase.

## Component API

| Atom | Selector | Inputs | Outputs | Slots |
|------|----------|--------|---------|-------|
| **ButtonAtom** | `ui-button` | `variant`, `size`, `disabled`, `loading`, `type`, `ariaLabel` | `clicked` | `ng-content` for spinner |
| **InputAtom** | `ui-input` | `type`, `label`, `placeholder`, `value`, `error`, `helperText`, `disabled`, `clearable` | `valueChange` | — |
| **SelectAtom** | `ui-select` | `options`, `value`, `searchable`, `label`, `error`, `disabled`, `placeholder` | `valueChange` | — |
| **CardAtom** | `ui-card` | `padding` | — | `[card-header]`, `[card-content]`, `[card-footer]` |
| **BadgeAtom** | `ui-badge` | `variant`, `status`, `count`, `size` | — | — |
| **AvatarAtom** | `ui-avatar` | `src`, `alt`, `initials`, `size` | — | — |
| **SkeletonAtom** | `ui-skeleton` | `variant`, `width`, `height` | — | — |
| **DividerAtom** | `ui-divider` | `direction`, `label`, `thickness` | — | — |
| **SpinnerAtom** | `ui-spinner` | `size` | — | — |
| **ToggleAtom** | `ui-toggle` | `checked`, `disabled` | `checkedChange` | — |

## Token Usage Map

| Token | Button | Input | Select | Card | Badge | Avatar | Skeleton | Divider | Spinner | Toggle |
|-------|--------|-------|--------|------|-------|--------|----------|---------|---------|--------|
| `--color-bg` | | bg | bg | | | | | | | |
| `--color-surface` | | | panel-bg | bg | | img-fallback | | | | knob |
| `--color-text-primary` | secondary-text | value-text | value-text | | | initials | | | | |
| `--color-text-secondary` | | label | label | | counter-text | | | label-text | | |
| `--color-border` | outline-bg | default-border | default-border | border | | | skeleton-bg | line | spinner-track | off-track |
| `--color-accent` | primary-bg | focus-ring | focus-ring | | | | | | spinner-arc | on-track |
| `--color-accent-hover` | hover-bg | | | | | | | | | |
| `--color-success` | | | | | status-bg | | | | | |
| `--color-warning` | | | | | status-bg | | | | | |
| `--color-error` | danger-bg | error-border | error-border | | status-bg | | | | | |
| `--color-interactive-active` | | | option-hover | | | | | | | |
| `--shadow-sm` | | | | elevation | | | | | | knob-shadow |
| `--shadow-md` | | | panel-shadow | hover-elevation | | | | | | |
| `--radius-sm` | | | | | | | | | | |
| `--radius-md` | | | panel-radius | | | | card-radius | | | |
| `--radius-xl` | | | | border-radius | | | | | | |
| `--radius-pill` | shape | | | | shape | shape | circle | | | |
| `--spacing-1` | | | | | padding | | | | | |
| `--spacing-2` | | | | | | | | | | |
| `--spacing-3` | sm-padding | | | | | | | | | |
| `--spacing-4` | md-padding | | | | | | | | | track-h |
| `--spacing-6` | lg-padding | | | padding | | | | | | |
| `--duration-fast` | transition | transition | transition | | | | | | | transition |
| `--duration-base` | | | | | | | | | | |
| `--duration-slow` | | | | | | | | | rotation | |
| `--duration-xslow` | | | | | | | pulse | | | |
| `--ease-out` | | | | | | | | | | slide |
| `--ease-default` | | | | | | | | | | |
| `--font-sans` | font | font | font | font | font | font | | | | |
| `--text-xs` | | | | | | | | | | |
| `--text-sm` | sm-font | | | | sm-font | | | | | |
| `--text-base` | md-font | value-font | value-font | | | | | | | |
| `--text-lg` | lg-font | | | | | lg-font | | | | |

## CSS Architecture Pattern

Every atom's `.scss` file follows this structure:

```scss
// 1. Host layout
:host { display: inline-block; }

// 2. Component class styles using var(--token) — NO raw values
.button {
  background: var(--color-accent);
  border-radius: var(--radius-pill);
  transition: background var(--duration-fast) var(--ease-default);
  
  &:hover { background: var(--color-accent-hover); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

// 3. Size variants
.button--sm { padding: var(--spacing-2) var(--spacing-3); font-size: var(--text-sm); }
.button--md { padding: var(--spacing-3) var(--spacing-4); font-size: var(--text-base); }
.button--lg { padding: var(--spacing-4) var(--spacing-6); font-size: var(--text-lg); }

// 4. prefers-reduced-motion
@media (prefers-reduced-motion: reduce) {
  .button { transition: none; }
}
```

## Dependencies

- **ButtonAtom → SpinnerAtom**: Button's loading state renders `<ui-spinner>` via content projection (`ng-content select="[ui-spinner]"`), not hard import. This keeps ButtonAtom tree-shakeable when loading is unused.
- **All atoms → Phase 1 tokens**: Every visual property references `var(--token)`. Zero inline hex/rgba values.
- **All atoms → CommonModule**: For `ngClass` bindings (variant/size class computation).

No atom imports from `@angular/material`, `@angular/cdk`, or any other atom.

## Testing Strategy

Unit tests per spec (created in sdd-tasks/sdd-apply). Key assertions per atom:

| Atom | Unit Tests |
|------|-----------|
| Button | Click emits; disabled blocks click; loading shows aria-busy; variants apply correct CSS |
| Input | Typing emits valueChange; error shows aria-describedby; clearable resets value |
| Select | Option click emits value; searchable filters options; disabled keeps dropdown closed |
| Card | Content slots render; hover applies shadow-md; dark parent inherits tokens |
| Badge | Status variant applies correct color; counter shows count; dot renders small circle |
| Avatar | Image loads with alt; broken img falls back to initials; sizes apply correctly |
| Skeleton | Variants apply correct shape; custom width/height respected; aria-busy present |
| Divider | Horizontal vs vertical class; label renders centered |
| Spinner | Size applies correct dimensions; role="progressbar"; aria-label present |
| Toggle | Click toggles checkedChange; disabled blocks toggle; Space key toggles |

## Accessibility

| Pattern | Implementation |
|---------|---------------|
| Button | `<button>` native, `[attr.aria-label]`, `[attr.aria-disabled]`, `[attr.aria-busy]` |
| Input | `<label>` with `for`, `[attr.aria-describedby]` for error, `[attr.aria-invalid]` |
| Select | `role="listbox"`, `role="option"`, `[attr.aria-selected]`, keyboard arrows |
| Card | `role="region"` if interactive, `tabindex="0"` if action card |
| Badge | `role="status"` for status dot, `aria-label` for counter |
| Avatar | `[attr.alt]` on `<img>`, `[attr.aria-label]` for initials fallback |
| Skeleton | `aria-busy="true"`, `aria-label="Loading"` |
| Divider | `role="separator"`, `[attr.aria-orientation]` |
| Spinner | `role="progressbar"`, `aria-label="Loading"`, `aria-valuetext` for size |
| Toggle | `role="switch"`, `[attr.aria-checked]`, keyboard Space to toggle |

## Key Implementation Details

**ButtonAtom**: Renders `<button>`. Loading state disables button and uses `<ng-content select="[ui-spinner]">` slot. If slot empty, uses CSS-only spinner. Variants: `primary` (accent bg), `secondary` (surface bg, accent border), `outline` (transparent, accent border), `ghost` (transparent), `icon` (square, equal padding).

**InputAtom**: Floating label pattern — label starts inside input area, floats up on focus or when value is non-empty. Uses `:focus-within` on host for focus ring. Clear button appears only when `clearable` + has value.

**SelectAtom**: Dropdown opens below trigger on click. Options filtered by search input when `searchable`. Click outside closes dropdown. Arrow keys navigate options. Escape closes.

**ToggleAtom**: Fixed 44×24px track with 20px knob. `transform: translateX(20px)` for checked position. CSS transition on `translateX` property. `role="switch"` with `aria-checked` binding.

## Migration / Rollout

No migration required. Atoms are new files — existing code continues using Material components. Molecules (Phase 3) will start consuming these atoms. Phase 5 swaps page-level imports globally.

## Open Questions

- None identified at design time.

---

## Appendix: Component States Summary

| Atom | States |
|------|--------|
| Button | default, hover, active, focus-visible, disabled, loading |
| Input | default, focus, filled, error, disabled |
| Select | closed, open, option-hover, option-selected, disabled, search-active, empty-options |
| Card | default, hover |
| Badge | per-variant + per-status-color |
| Avatar | image-loaded, image-failed, no-src (initials) |
| Skeleton | animated (CSS only) |
| Divider | horizontal, vertical, with-label |
| Spinner | spinning (CSS only) |
| Toggle | off, on, disabled-off, disabled-on, focus-visible |
