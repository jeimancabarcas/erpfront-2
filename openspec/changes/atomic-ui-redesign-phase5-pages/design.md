# Design: Phase 5 — Page Migration (29 Pages)

## Technical Approach

Per-page atomic replacement: each page is migrated independently by swapping Material template/imports for Phase 2–4 atomic components. Only the `.ts` imports array and template HTML change — business logic, service calls, and routing remain untouched.

Pages grouped by composition pattern (list, detail, form, dashboard, tabs) to reduce cognitive load and enable parallel tasking.

## Architecture Decisions

### Decision: DataTable Server-Side Extension

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Client-side pagination only | 6+ server-paginated pages (Sales, Categories, Products, etc.) exceed DataTable capacity | REJECTED |
| Extend DataTable with `total` + `pageChange` | One-time change, all pages use same component | **CHOSEN** |

**Rationale**: SalesPage, ProductsPage, SuppliersPage, PurchasesPage, CategoriesPage, PatientsPage all pass server-driven sort/page params. DataTable must accept `total` input (external count, skips internal `data.length` pagination) and emit `pageChange`/`pageSizeChange`. Falls back to current client-side behavior when `total` is omitted. This extension is a prerequisite — apply before or as Batch A.

### Decision: Dialog Strategy

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Inline `<ui-confirm-dialog>` for everything | Complex forms (InvoiceForm, Anamnesis) have too much content for confirm-dialog | REJECTED |
| `<ui-card>` wrapper per dialog, toggled via parent signal | No structural refactor; existing dialog content re-used inside CardAtom | **CHOSEN** |

**Rationale**: Simple confirmations (delete, cancel) → `<ui-confirm-dialog>` inline. Complex forms (GeneralInvoiceForm, Anamnesis, PhysicalExam, Diagnostics) → wrap content in `<ui-card>` + `@if (dialogOpen)` toggle at the parent. The parent component holds a `dialogOpen = signal(false)` — no `MatDialog` or `MatDialogRef` needed.

### Decision: Tab Replacement

`<mat-tab-group>` → `activeTab = signal<string>()` + row of `<ui-button>` (primary/ghost variants) + `@switch` on `activeTab()`. Four pages affected: Profile, PatientDetail, Inventory, Transport.

### Decision: Notification Strategy

`MatSnackBar` → `notification = signal<{message: string, type: 'success'|'error'|'info'} | null>(null)` in the component. Template renders a fixed-position `<div>` with `position: fixed; bottom: 24px` that auto-dismisses after 3s via `setTimeout`.

## Data Flow

No data flow changes. All components keep existing service injections, signal declarations, and method bodies.

```
Before: Service → Component → MatTableDataSource → mat-table + mat-paginator
After:  Service → Component → signal data[] → <ui-data-table> [columns] [data] [total] (pageChange)
```

The component still calls `service.loadInvoices(params)` — only the output bindings adapt to atomic component events.

## File Changes

| File Group | Action | Count |
|------------|--------|-------|
| `components/pages/**/*.ts` | Modify template + imports | 26 pages |
| `components/organisms/general-invoice-form-dialog/*` | Modify | 1 |
| `components/organisms/invoice-detail-dialog/*` | Modify | 1 |
| `components/organisms/adjustment-form-dialog/*` | Modify | 1 |
| `components/molecules/data-table/data-table.component.ts` | Extend (total, pageChange) | 1 |

Total: 26 page files + 3 dialogs + 1 molecule extension.

## Interfaces / Contracts

DataTable extension (add to existing `DataTableMolecule`):

```typescript
// New inputs for server-side pagination
total = input<number | null>(null);   // null = client-side mode
page = input<number>(0);              // external page index

// New outputs
pageChange = output<number>();        // emitted on page navigation
pageSizeChange = output<number>();    // emitted on page size change
```

When `total` is non-null, DataTable uses external total for paginator label and emits `pageChange` instead of slicing internally.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | DataTable extension | Verify external total mode, pageChange/pageSizeChange emissions |
| Type | All 29 pages | `npx tsc --noEmit` — catch missing imports or selector refs |
| Format | All 29 pages | `npx prettier --check .` |

## Migration Order

| Batch | Pages | Risk |
|-------|-------|------|
| A (1–2) | Dashboard, Profile | Low — simple card + tab swap |
| B (3–5) | Sales, Inventory, Patients | High — MatTable + dialogs + tabs |
| C (6–9) | PatientDetail, Categories, Products, Suppliers | Medium — table patterns |
| D (10–29) | Remaining pages + dialogs | Low — established patterns, mechanical swaps |

## Open Questions

- [ ] DataTable page size is currently hardcoded at 10. Pages that support configurable sizes (`[5,10,25,100]`) need a `pageSizeOptions` input — confirm whether to add to the extension.
- [ ] Complex dialogs (Anamnesis, PhysicalExam, Diagnostics, Orders, Incapacity) use `MatDialogRef` + `afterClosed()` for data flow. Inline toggle loses `afterClosed()` — parent can read dialog signals directly after close, but need to verify this covers all data-passing cases.
- [ ] LoginPage listed in spec as "no changes needed" — confirm it uses no Material imports.
