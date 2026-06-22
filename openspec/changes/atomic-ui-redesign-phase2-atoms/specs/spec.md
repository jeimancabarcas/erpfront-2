# Phase 2 — Core Atoms Specification

## Purpose

10 standalone Angular atoms. Zero Material deps. Phase 1 tokens. Dark mode + a11y.

## Functional Requirements

### FR1: ButtonAtom — `<ui-button>`
variant (primary|secondary|outline|ghost|icon), size (sm|md|lg), disabled, loading, type, ariaLabel → clicked

- GIVEN default WHEN rendered THEN pill, --color-accent bg, white text
- GIVEN disabled WHEN clicked THEN clicked not emitted AND aria-disabled="true"
- GIVEN loading WHEN rendered THEN spinner, disabled, aria-busy="true"

### FR2: InputAtom — `<ui-input>`
type (text|number|textarea|password), label, placeholder, value, error, helperText, disabled, clearable → valueChange

- GIVEN user types WHEN value changes THEN valueChange emits
- GIVEN error WHEN rendered THEN error visible AND aria-describedby linked
- GIVEN clearable WHEN clear clicked THEN value resets AND emits ""

### FR3: SelectAtom — `<ui-select>`
options (Array<{value,label}>), value, searchable, label, error, disabled, placeholder → valueChange

- GIVEN options WHEN selected THEN valueChange emits chosen value
- GIVEN disabled WHEN clicked THEN dropdown stays closed
- GIVEN searchable WHEN user types THEN options filter AND role="listbox"

### FR4: CardAtom — `<ui-card>`
padding (sm|md|lg). Slots: header, content, footer via ng-content.

- GIVEN card with header/content/footer WHEN rendered THEN all three visible
- GIVEN card WHEN hovered THEN shadow lifts (--shadow-sm → --shadow-md)
- GIVEN dark parent WHEN rendered THEN surface/border/shadow use `.dark` tokens

### FR5: BadgeAtom — `<ui-badge>`
variant (status|counter|dot), status (success|warning|error), count, size (sm|md).

- GIVEN status=success WHEN rendered THEN --color-success bg AND role="status"
- GIVEN counter count=5 WHEN rendered THEN "5" in pill shape
- GIVEN variant=dot WHEN rendered THEN small colored circle

### FR6: AvatarAtom — `<ui-avatar>`
src, alt, initials, size (sm|md|lg).

- GIVEN valid src WHEN loaded THEN image in circle with alt text
- GIVEN no src WITH initials WHEN rendered THEN initials as fallback
- GIVEN broken src WHEN load fails THEN initials fallback

### FR7: SkeletonAtom — `<ui-skeleton>`
variant (text|card|table-row|circle), width, height.

- GIVEN variant=text WHEN rendered THEN animated line, --color-border bg, aria-busy="true"
- GIVEN variant=circle WHEN rendered THEN circular shape
- GIVEN custom width/height WHEN applied THEN dimensions respected

### FR8: DividerAtom — `<ui-divider>`
direction (horizontal|vertical), label, thickness.

- GIVEN horizontal default WHEN rendered THEN full-width line, --color-border
- GIVEN vertical WHEN rendered THEN full-height line
- GIVEN label WHEN rendered THEN text centered on divider

### FR9: SpinnerAtom — `<ui-spinner>`
size (sm|md|lg).

- GIVEN default WHEN rendered THEN spin animation, --color-accent, role="progressbar"
- GIVEN size=sm WHEN rendered THEN 16px diameter
- GIVEN rendered THEN aria-label="Loading" present

### FR10: ToggleAtom — `<ui-toggle>`
checked, disabled → checkedChange.

- GIVEN checked=false WHEN clicked THEN slides on, checkedChange=true, aria-checked="true"
- GIVEN disabled WHEN clicked THEN no state change
- GIVEN focused WHEN Space pressed THEN toggles state

## Non-Functional Requirements

### NFR1: Dark Mode
MUST render in light/dark via `.dark` parent. All colors MUST use Phase 1 CSS vars. Zero hex values.

### NFR2: Token-Only Styling
Every visual property MUST use Phase 1 tokens (`--color-*`, `--spacing-*`, `--radius-*`, `--shadow-*`). No arbitrary values.

### NFR3: Accessibility
All atoms MUST support keyboard nav (Tab, Enter, Space, Arrow), ARIA roles, focus-visible ring via `--color-accent`, and aria-describedby for errors.

### NFR4: Bundle Size
Each atom SHOULD be tree-shakeable. No atom MAY import from `@angular/material` or `@angular/cdk`.

### NFR5: Performance
Animations MUST use CSS transforms/opacity AND respect `prefers-reduced-motion`.

## Acceptance Criteria

- [ ] All 10 atoms render correctly in light and dark modes
- [ ] All atoms pass keyboard-only navigation (no mouse)
- [ ] Zero `@angular/material` or `@angular/cdk` imports in atom source files
- [ ] Grep for hex color values in atom files reports 0 (all via tokens)
- [ ] Component contracts match the inputs/outputs tables above
- [ ] Each atom has unit tests covering happy path, disabled/error state, and edge case
