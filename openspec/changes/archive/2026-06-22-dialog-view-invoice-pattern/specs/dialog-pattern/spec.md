# Delta Spec: dialog-pattern (MODIFIED)

## Overview

Reverses REQ-8 icon approach, promotes REQ-4/REQ-5 from P1→P0, adds layout structure (REQ-11) and Tailwind consistency (REQ-12). REQ-9 (ARIA) preserved unchanged.

## Modified Requirements

### REQ-4: Loading State [P1 → P0]

**Table row change**:
| ID | Priority | Rule |
|----|----------|------|
| REQ-4 | P0 | `loading` signal (boolean); show loading indicator (spinner/skeleton) while `true` |

(Previously: P1 priority, `<mat-spinner>` specific icon)

### REQ-5: Error State [P1 → P0]

**Table row change**:
| ID | Priority | Rule |
|----|----------|------|
| REQ-5 | P0 | `errorMsg` signal (`string \| null`); dismissible error banner when non-null |

(Previously: P1 priority)

### REQ-8: Icon Approach [Reversed]

**Table row change**:
| ID | Priority | Rule |
|----|----------|------|
| REQ-8 | P1 | Icons via `<span class="material-icons">` only — `<mat-icon>` PROHIBITED |

(Previously: `<mat-icon>` only, `<span class="material-icons">` PROHIBITED. Reversed by user decision — `dialog-view-invoice-pattern`.)

### Updated Scenario: REQ-4 / REQ-5 — Loading and error flow

- **GIVEN** a dialog that fetches data on init
- **WHEN** the fetch is in progress
- **THEN** `loading()` is `true` and a loading indicator is shown
- **WHEN** the fetch fails
- **THEN** `loading()` is `false`, `errorMsg` is set, and the dismissible banner appears

(Previously: referenced `<mat-spinner>` explicitly; now generic to support any loading indicator)

## New Requirements

### REQ-11: Dialog Layout Structure [P0]

**Table row to add**:
| ID | Priority | Rule |
|----|----------|------|
| REQ-11 | P0 | Dialog MUST use header-body-footer layout: header with title + optional status badge + close button, scrollable content body, footer with action/CTA buttons |

#### Scenario: Header-body-footer renders correctly
- **GIVEN** a dialog component
- **WHEN** it renders
- **THEN** header contains title, optional status badge, and close button with `aria-label`
- **AND** content body is scrollable below header
- **AND** footer contains CTAs aligned to end
- **AND** header/footer remain fixed when body scrolls

#### Scenario: Overflow content
- **GIVEN** a dialog with content exceeding viewport
- **WHEN** the dialog renders
- **THEN** only the content body scrolls
- **AND** header and footer stay visible (fixed, non-scrolling)

### REQ-12: Tailwind Styling Consistency [P0]

**Table row to add**:
| ID | Priority | Rule |
|----|----------|------|
| REQ-12 | P0 | Dialog MUST apply `rounded-[32px]`, `shadow-2xl`, `max-h-[95vh]`, and CSS scrollbar styling on the content body |

#### Scenario: Styling applied on render
- **GIVEN** a dialog component
- **WHEN** inspected
- **THEN** container has `rounded-[32px]`, `shadow-2xl`, `max-h-[95vh]`
- **AND** content body uses custom scrollbar (thin, styled track/thumb)

## Preserved (no change)

- **REQ-9**: ARIA labels on close buttons — unchanged.
