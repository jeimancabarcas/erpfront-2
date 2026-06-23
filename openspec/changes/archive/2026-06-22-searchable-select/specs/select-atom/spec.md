# Delta for select-atom

## MODIFIED Requirements

### Requirement: Component API

MUST use `OnPush`, implement `CVA`, expose via signals:

| Input/Output | Type | Default |
|---|---|---|
| `label`, `placeholder`, `value`, `error`, `helperText` | `string` | `''` |
| `options` | `SelectOption[]` (value/label/subtitle/icon) | `[]` |
| `required`, `disabled`, `searchable` | `boolean` | `false` |
| `loading` | `boolean` | `false` |
| `emptyText` | `string` | `'Sin resultados'` |
| `footerLabel` | `string` | `''` |
| `showSubtitle` | `boolean` | `false` |
| `valueChange` | `output<string>` | — |
| `searchChange` | `output<string>` | — |
| `footerAction` | `output<void>` | — |

(Previously: table without `loading`, `emptyText`, `footerLabel`, `showSubtitle`, `searchChange`, `footerAction`; `SelectOption` only had `value`/`label`)

#### Scenario: Default renders label and trigger

- GIVEN `<ui-select label="Status" placeholder="Select..." [options]="opts">`
- WHEN rendered
- THEN label renders above trigger, trigger displays placeholder

#### Scenario: valueChange emits on selection

- GIVEN dropdown open
- WHEN user clicks option `"active"`
- THEN `valueChange` emits `"active"`, dropdown closes

#### Scenario: Open state with backdrop

- GIVEN trigger clicked
- WHEN dropdown opens
- THEN panel with `shadow-lg`, `aria-expanded="true"`, outside click closes

#### Scenario: Backward compat — existing consumers

- GIVEN `<ui-select>` with no new inputs set
- WHEN rendered and interacted
- THEN behavior matches existing spec, all new features inactive

### Requirement: Searchable Mode

`searchable` MUST render search input. With `searchChange` subscribed, emits query for parent-driven async search.

(Previously: local-only filtering, no output, no loading/emptyText customization)

#### Scenario: Local filter matches label

- GIVEN `<ui-select [searchable]="true">` with 10 options
- WHEN user types "cat"
- THEN only matching labels visible, "Sin resultados" when no match

#### Scenario: Keyboard nav in search

- GIVEN searchable dropdown with filtered results
- WHEN ArrowDown then Enter
- THEN focused option selected, dropdown closes

#### Scenario: searchChange emits on keystroke

- GIVEN `<ui-select [searchable]="true" (searchChange)="onSearch($event)">`
- WHEN user types "mar"
- THEN `searchChange` emits `"mar"` on each keystroke

#### Scenario: Loading spinner while fetching

- GIVEN `<ui-select [searchable]="true" [loading]="true">`
- WHEN dropdown open
- THEN spinner visible, "Sin resultados" hidden

#### Scenario: Custom emptyText

- GIVEN `<ui-select emptyText="No hay resultados" [loading]="false">`
- WHEN no matching options
- THEN "No hay resultados" displayed

#### Scenario: Async — parent feeds options after API

- GIVEN parent subscribes to `searchChange`, debounces, calls API
- WHEN API sets `options()` signal
- THEN component renders updated options, resets `highlightedIndex`

#### Scenario: Race condition — latest wins

- GIVEN parent uses `switchMap`
- WHEN overlapping API calls
- THEN only latest response renders, stale data hidden

## ADDED Requirements

### Requirement: Footer Slot

`footerLabel` renders action button at panel bottom. `footerAction` emits without closing panel.

#### Scenario: Footer renders and emits

- GIVEN `<ui-select footerLabel="Crear nuevo" (footerAction)="onCreate()">`
- WHEN dropdown open
- THEN button with icon renders, click emits `footerAction`, panel stays open

#### Scenario: Footer hidden when label empty

- GIVEN `<ui-select footerLabel="">`
- WHEN dropdown open
- THEN no footer button renders

### Requirement: Option Enhancement

`showSubtitle` displays `SelectOption.subtitle` below label. `SelectOption.icon` renders icon before label.

#### Scenario: Subtitle below label

- GIVEN `<ui-select [showSubtitle]="true">` with `{ value: '1', label: 'Juan', subtitle: '12345678' }`
- WHEN dropdown open
- THEN label on first line, subtitle on second in smaller text

#### Scenario: Option icon renders

- GIVEN option `{ value: 'x', label: 'Producto', icon: 'inventory_2' }`
- WHEN dropdown open
- THEN icon renders before label text

#### Scenario: showSubtitle false hides subtitle

- GIVEN `<ui-select [showSubtitle]="false">` with options having subtitles
- WHEN dropdown open
- THEN only label renders, subtitle hidden

### Requirement: Consumer Migration

SHOULD replace custom inline searchable selects with `<ui-select>` in consumers:

| Consumer | Replacement | Removes |
|---|---|---|
| general-invoice-form-dialog customer | `<ui-select searchable footerLabel="Crear nuevo" showSubtitle>` | Inline dropdown |
| general-invoice-form-dialog product | `<ui-select searchable showSubtitle>` | Inline dropdown |
| adjustment-form-dialog invoice | `<ui-select searchable showSubtitle>` | `matAutocomplete` |
| patient-search | `<ui-select searchable showSubtitle>` | `matAutocomplete` |
