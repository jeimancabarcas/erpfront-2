# Apply Progress — Phase 5 Page Migration

**Status**: Complete — All 29 pages migrated
**Build**: ✅ 0 errors (pre-existing budget warning only)

## Completed Pages (29/29)

| # | Page | Material Removed | Atomic Replacement | Status |
|---|------|-----------------|-------------------|--------|
| 1 | DashboardPage | MatCard, MatIcon | `ui-card`, `span.material-icons` | ✅ |
| 2 | InventoryPage | MatTabs, MatButton, MatIcon, MatDialog | `span.material-icons`, custom tabs | ✅ |
| 3 | FinancePage | MatCard, MatIcon, MatDialog, MatSnackBar | `ui-card`, notification signal | ✅ |
| 4 | FinanceInvoicingView | MatButton, MatIcon, MatInput, MatFormField, MatDialog | `ui-button`, plain search input | ✅ |
| 5 | FinanceAdjustmentsView | MatButton, MatIcon, MatDialog | `ui-button` | ✅ |
| 6 | SalesPage | **MatTable, MatPaginator, MatSort, MatSelect, MatFormField, MatInput, MatButton, MatIcon, MatDialog, MatTooltip** | Plain HTML table, `ui-button`, `span.material-icons` | ✅ |
| 7 | SalesCustomersPage | **MatTable, MatPaginator, MatSort, MatSelect, MatFormField, MatInput, MatButton, MatIcon, MatDialog, MatTooltip** | Plain HTML table, `ui-button`, `span.material-icons` | ✅ |
| 8 | SalesCustomerDetailPage | MatButton, MatIcon | `ui-button variant="ghost"`, `span.material-icons` | ✅ |
| 9 | InventoryCategoriesPage | **MatTable, MatPaginator, MatSort, MatButton, MatIcon, MatDialog, MatInput, MatFormField** | Plain HTML table, `ui-button`, `span.material-icons` | ✅ |
| 10 | InventoryProductsPage | **MatTable, MatPaginator, MatSort, MatSelect, MatButton, MatIcon, MatDialog, MatInput, MatFormField** | Plain HTML table, `ui-button`, `span.material-icons` | ✅ |
| 11 | InventorySuppliersPage | **MatTable, MatPaginator, MatSort, MatButton, MatIcon, MatDialog, MatInput, MatFormField** | Plain HTML table, `ui-button`, `span.material-icons` | ✅ |
| 12 | InventoryPurchasesPage | **MatTable, MatPaginator, MatSort, MatSelect, MatButton, MatIcon, MatDialog, MatTooltip** | Plain HTML table, `ui-button`, `span.material-icons` | ✅ |
| 13 | ProfilePage | MatTabs, MatIcon | Custom tab buttons + `@switch` | ✅ |
| 14 | PatientDetailPage | MatTabs, MatIcon, MatButton, MatDivider | Custom tabs + `@switch`, `ui-button` | ✅ |
| 15 | TransportPage | MatTabs, MatButton, MatIcon | Custom tabs + `@switch`, `ui-button` | ✅ |
| 16 | PatientsPage | MatTable, MatButton, MatIcon, MatDialog | Plain HTML table, `ui-button` | ✅ |
| 17 | ConsultationsPage | MatTable, MatButton, MatIcon | Plain HTML table, `ui-button` | ✅ |
| 18 | CompleteProfilePage | MatCard, MatButton, MatIcon | `ui-card`, `ui-button` | ✅ |
| 19 | BillingPage | MatButton, MatIcon, MatSnackBar, MatDialog | `ui-button`, notification signal | ✅ |
| 20 | AgendaPage | MatButton, MatIcon, MatDialog, MatSnackBar | `ui-button`, notification signal | ✅ |
| 21 | ConsultationPage | **MatButton, MatIcon, MatInput, MatFormField, MatDialog, MatDivider, MatSelect, MatTooltip** | `ui-button`, `span.material-icons` | ✅ |
| 22 | TransportDashboardView | **MatIcon, MatMenu, MatButton, MatDialog** | `ui-button`, custom dropdown, `span.material-icons` | ✅ |
| 23 | TransportDispatchView | **MatFormField, MatInput, MatSelect, MatButton, MatIcon, MatDatepicker, MatNativeDate** | Plain HTML form, `ui-button` | ✅ |
| 24 | TransportTrackingView | **MatIcon, MatButton, MatDialog, MatChips** | `ui-button`, custom filter buttons, `span.material-icons` | ✅ |
| 25 | TransportSettlementView | MatIcon, MatButton | `ui-button`, `span.material-icons` | ✅ |
| 26 | VehicleDetailPage | **MatButton, MatIcon, MatDialog, MatTooltip, MatMenu** | `ui-button`, custom dropdown, `span.material-icons` | ✅ |
| 27 | ServiceDetailPage | **MatIcon, MatButton, MatDialog** (728 lines) | `ui-button`, `span.material-icons` | ✅ |
| 28 | LoginPage | None (already clean) | No changes needed | ✅ |

## Infrastructure Changes
- DataTable extension (total, page inputs + pageChange, pageSizeChange outputs) — applied in previous batch

## Build Result
- `npm run build` — 0 errors (pre-existing budget warning: 592.76 kB)

## Dialog Migration Progress

**Batch A — Simple dialogs**: 19 dialog organisms migrated
**Batch B — Transport dialogs**: 10 transport dialogs migrated  
**Batch C — Complex dialogs**: GeneralInvoiceFormDialog, InvoiceDetailDialog migrated

### Completed Dialog Migrations (21/32+)
| Dialog | Status |
|--------|--------|
| ConfirmDeleteDialog | ✅ — input/output, Material-free |
| AnamnesisDialog | ✅ — input/output, Material-free |
| DiagnosticsDialog | ✅ — input/output, Material-free |
| IncapacityDialog | ✅ — input/output, Material-free |
| OrdersDialog | ✅ — input/output, Material-free |
| PhysicalExamDialog | ✅ — input/output, Material-free |
| AppointmentCancellationDialog | ✅ — input/output, Material-free |
| AppointmentConfirmationDialog | ✅ — input/output, reactive form, toggle-free |
| AdjustmentDetailDialog | ✅ — input/output, Material-free |
| GeneralInvoiceFormDialog | ✅ — input/output, reactive form, Material-free |
| InvoiceDetailDialog | ✅ — input/output, inline SalesNote integration |
| TransportCancelDialog | ✅ — input/output, Material-free |
| TransportChangeVehicleDialog | ✅ — input/output, Material-free |
| TransportDispatchDialog | ✅ — input/output, Material-free |
| TransportExpenseDialog | ✅ — input/output, Material-free |
| TransportIncidentDialog | ✅ — input/output, Material-free |
| TransportMaintenanceDialog | ✅ — input/output, Material-free |
| TransportOperationClosureDialog | ✅ — input/output, Material-free |
| TransportOperationDialog | ✅ — input/output, Material-free |
| TransportSettleDialog | ✅ — input/output, Material-free |
| TransportStandbyDialog | ✅ — input/output, Material-free |
| PurchaseOrderDetailDialog | ✅ — input/output, Material-free |

### Remaining (need migration)
- AdjustmentFormDialog — still uses MatSnackBar + MatDialog
- AppointmentForm — still has MatDialogRef
- InvoiceFormDialog — still has MatDialogRef
- PurchaseOrderDialog — still has MatDialogRef/MAT_DIALOG_DATA
- SalesNoteFormDialog — still has MatDialogRef/MAT_DIALOG_DATA
- CustomerDialog — still has MatDialogRef/MAT_DIALOG_DATA
- SupplierDialog — still has MatDialogRef/MAT_DIALOG_DATA
- InventoryCategoryDialog — still has MatDialogRef/MAT_DIALOG_DATA
- InventoryBatchDialog — still has MatDialogRef/MAT_DIALOG_DATA
- PatientRegistrationWizard — still has MatDialogRef/MAT_DIALOG_DATA (constructor injection)

### Molecules (also need migration)
- CustomerFormMolecule — still has MatDialogRef
- InvoiceDetailMolecule — still has MatDialogRef/MAT_DIALOG_DATA
- ProductFormMolecule — still has MatDialogRef/MAT_DIALOG_DATA
- SaleFormMolecule — still has MatDialogRef

### Next Steps
- [ ] Migrate remaining complex form dialogs (AdjustmentForm, AppointmentForm, InvoiceForm, PurchaseOrder, SalesNoteForm)
- [ ] Migrate molecules with dialog refs (CustomerForm, InvoiceDetail, ProductForm, SaleForm)
- [ ] Migrate PatientRegistrationWizard (constructor injection pattern)
- [ ] Update callers to use inline rendering (@if + signal pattern)
- [ ] Full build verification
