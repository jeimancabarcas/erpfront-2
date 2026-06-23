# Design: Searchable Select with Footer Slot

## Technical Approach

Extend `SelectAtom` (ui-select) with async search support, footer action slot, and enhanced option rendering. All new inputs/outputs are optional — zero breakage for 15 existing consumers. Parent owns debounce and API orchestration via `switchMap`; component stays dumb and reactive.

## Architecture Decisions

### Decision: `searchChange` output vs `asyncSearch` callback input

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `asyncSearch(query) => Observable` | Component manages subscriptions, race conditions, error handling | ❌ Rejected — couples component to RxJS lifecycle |
| `searchChange` output + parent-managed `loading`/`options` | Parent owns debounce/switchMap/error; component just renders | ✅ Chosen — matches existing `search-bar` pattern, keeps SelectAtom dumb |

**Rationale**: The parent knows which service to call and how to map results. An injected callback would require the component to manage subscriptions, reset `highlightedIndex` on response, and handle errors — all concerns the parent already handles.

### Decision: Loading state placement

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Replace options list with full spinner | Content disappears; jarring UX | ❌ Rejected |
| Spinner above/hiding options while loading | Clear state transition | ✅ Chosen — spinner replaces options container, footer stays visible |

**Rationale**: When `loading()` is true, the options area shows a centered spinner. The footer button remains visible so the user can still trigger footer actions (e.g., "Crear nuevo") while results load.

### Decision: Show subtitle via `showSubtitle` gate

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Auto-render subtitle if present | Inconsistent visual layout across consumers | ❌ Rejected |
| Explicit `showSubtitle` input | Consumer opts in; backward-compat guaranteed | ✅ Chosen |

**Rationale**: `<ui-select>` is used for simple label-only selects (15 callers). Auto-rendering subtitle would break their visual alignment. `showSubtitle` is opt-in.

## Data Flow

```
User types in search input
  → onSearchInput(event)    sets searchQuery + emits searchChange.emit(query)
  → Parent                  debounces (switchMap), calls API, sets loading=true
  → Parent                  sets options() + loading=false on response
  → SelectAtom              renders filteredOptions() or spinner/empty state
  → User clicks option      selectOption() → value.set() → parent formControl updates
  → User clicks footer      footerAction.emit() → parent opens dialog/navigates
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/app/components/atoms/select/select.component.ts` | Modify | Add inputs, outputs, template sections, `onSearchInput` |
| `src/app/components/atoms/select/select.component.spec.ts` | Modify | Add tests for loading, footer, emptyText, subtitle, searchChange |
| `src/app/components/organisms/general-invoice-form-dialog/general-invoice-form-dialog.component.ts` | Modify | Replace customer + product search with `ui-select` |
| `src/app/components/molecules/patient-search/patient-search.component.ts` | Modify | Replace matAutocomplete with `ui-select` |
| `src/app/components/organisms/adjustment-form-dialog/adjustment-form-dialog.component.ts` | Modify | Replace matAutocomplete invoice search with `ui-select` |

## Interfaces / Contracts

```typescript
// Extended option interface
export interface SelectOption {
  value: string;
  label: string;
  subtitle?: string;   // NEW: e.g., taxId, category, document number
  icon?: string;       // NEW: optional icon name
}

// NEW inputs (all optional — backward compatible)
loading: boolean;              // Show spinner while parent fetches
emptyText: string;             // Custom empty state message (default: 'Sin resultados')
footerLabel: string;           // Footer button label (hidden when empty)
showSubtitle: boolean;         // Render option.label + option.subtitle

// NEW outputs
searchChange = output<string>();     // Emits raw query on keystroke
footerAction = output<void>();       // Emits on footer button click

// NEW method
onSearchInput(event: Event): void;   // Sets searchQuery + emits searchChange
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `searchChange` emits on input | Dispatch input event on search input, expect output emit |
| Unit | Loading spinner visible/hidden | Set `loading=true`, assert spinner element; set `false`, assert hidden |
| Unit | Footer renders and emits | Set `footerLabel`, assert button renders; click, expect `footerAction` emit |
| Unit | Empty text customization | Set `emptyText`, filter to no results, assert custom text renders |
| Unit | Subtitle display | Set `showSubtitle=true` + options with subtitle, assert subtitle renders in DOM |
| Unit | Backward compat | All 12 existing tests pass unchanged — no new input changes default behavior |

## Migration / Rollout

No data migration. Sequential per-consumer migration after `ui-select` is extended:

1. **general-invoice-form-dialog** — Replace customer search + product search inline dropdowns
2. **patient-search** — Replace matAutocomplete, remove Material module imports
3. **adjustment-form-dialog** — Replace matAutocomplete invoice search, remove Material module imports

Each consumer can be merged independently. The `ui-select` extension ships first; consumers update in follow-up commits.

**Race condition handling**: Parent MUST use `switchMap` or equivalent to cancel in-flight requests when a new `searchChange` fires. Example pattern documented in parent consumer code, not in the atom.

## Open Questions

- None — all decisions align with exploration and proposal
