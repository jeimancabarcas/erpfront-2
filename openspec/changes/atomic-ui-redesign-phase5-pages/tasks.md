# Phase 5 — Page Migration Tasks

## Delivery Strategy
- **PR type**: Single PR — size exception approved
- **Chain strategy**: N/A

## Review Workload Forecast
- **400-line budget risk**: High (29 pages, ~200-400 lines each)
- **Chained PRs recommended**: No — size exception approved
- **Decision needed before apply**: Not required — exception pre-approved

## Completed Tasks

### Batch 1 — Dashboard
- [x] 1. DashboardPage → `ui-card`, `span.material-icons` (no Material imports)
- [x] 2. InventoryPage → `span.material-icons`, removed MatDialog/MatTabs/MatButton/MatIcon (no Material imports)

### Batch 2 — Core List Pages
- [x] 3. FinancePage → `ui-card`, `span.material-icons`, notification signal, dialog signal stubs (no Material imports)
- [x] 4. FinanceInvoicingView → `ui-button`, `span.material-icons`, plain search input (no Material imports)
- [x] 5. FinanceAdjustmentsView → `ui-button`, `span.material-icons` (no Material imports)
- [x] 6. SalesPage → plain HTML table, `ui-button`, `span.material-icons` (no Material imports)
- [x] 7. SalesCustomersPage → plain HTML table, `ui-button`, `span.material-icons` (no Material imports)

### Batch 3 — Detail Pages
- [x] 8. SalesCustomerDetailPage → `ui-button variant="ghost"`, `span.material-icons` (no Material imports)
- [x] 9. InventoryCategoriesPage → plain HTML table, `ui-button`, `span.material-icons` (no Material imports)
- [x] 10. InventoryProductsPage → plain HTML table, `ui-button`, `span.material-icons` (no Material imports)
- [x] 11. InventorySuppliersPage → plain HTML table, `ui-button`, `span.material-icons` (no Material imports)
- [x] 12. InventoryPurchasesPage → plain HTML table, `ui-button`, `span.material-icons` (no Material imports)

### Batch 4 — Remaining Pages
- [x] 13. ProfilePage → custom tab buttons + `@switch` (no Material imports)
- [x] 14. PatientDetailPage → custom tab buttons + `@switch`, `ui-button`, `span.material-icons` (no Material imports)
- [x] 15. TransportPage → custom tab buttons + `@switch`, `ui-button`, `span.material-icons` (no Material imports)
- [x] 16. PatientsPage → plain HTML table, `ui-button`, `span.material-icons` (no Material imports)
- [x] 17. ConsultationsPage → plain HTML table, `ui-button`, `span.material-icons` (no Material imports)
- [x] 18. CompleteProfilePage → `ui-card`, `ui-button`, `span.material-icons` (no Material imports)
- [x] 19. BillingPage → `ui-button`, notification signal, `span.material-icons` (no Material imports)
- [x] 20. AgendaPage → `ui-button`, notification signal, `span.material-icons` (no Material imports)
- [x] 21. ConsultationPage → `ui-button`, `span.material-icons` (no Material imports)
- [x] 22. TransportDashboardView → `ui-button`, custom dropdown menu, `span.material-icons` (no Material imports)
- [x] 23. TransportDispatchView → plain HTML form inputs, `<ui-button>` (no Material imports)
- [x] 24. TransportTrackingView → `ui-button`, custom filter buttons, `span.material-icons` (no Material imports)
- [x] 25. TransportSettlementView → `ui-button`, `span.material-icons` (no Material imports)
- [x] 26. VehicleDetailPage → `ui-button`, custom dropdown, `span.material-icons` (no Material imports)
- [x] 27. ServiceDetailPage → `ui-button`, `span.material-icons` (no Material imports, 728 lines)
- [x] 28. LoginPage → already clean, no changes needed

### Dialog Organisms (included in this phase)
- [x] 29. GeneralInvoiceFormDialog → migrated to input/output, Material-free
- [x] 30. InvoiceDetailDialog → migrated to input/output, Material-free
- [ ] 31. AdjustmentFormDialog → still has Material (pending, needs MatSnackBar migration)

### Transport Dialogs (all migrated)
- [x] 32. TransportCancelDialog → migrated to input/output, Material-free
- [x] 33. TransportChangeVehicleDialog → migrated to input/output, Material-free
- [x] 34. TransportDispatchDialog → migrated to input/output, Material-free
- [x] 35. TransportExpenseDialog → migrated to input/output, Material-free
- [x] 36. TransportIncidentDialog → migrated to input/output, Material-free
- [x] 37. TransportMaintenanceDialog → migrated to input/output, Material-free
- [x] 38. TransportOperationClosureDialog → migrated to input/output, Material-free
- [x] 39. TransportOperationDialog → migrated to input/output, Material-free
- [x] 40. TransportSettleDialog → migrated to input/output, Material-free
- [x] 41. TransportStandbyDialog → migrated to input/output, Material-free

### Medical Dialog Organisms (all migrated)
- [x] 42. ConfirmDeleteDialog → migrated to input/output, Material-free
- [x] 43. AnamnesisDialog → migrated to input/output, Material-free
- [x] 44. DiagnosticsDialog → migrated to input/output, Material-free
- [x] 45. IncapacityDialog → migrated to input/output, Material-free
- [x] 46. OrdersDialog → migrated to input/output, Material-free
- [x] 47. PhysicalExamDialog → migrated to input/output, Material-free
- [x] 48. AppointmentCancellationDialog → migrated to input/output, Material-free
- [x] 49. AppointmentConfirmationDialog → migrated to input/output, Material-free
- [x] 50. AdjustmentDetailDialog → migrated to input/output, Material-free
- [x] 51. PurchaseOrderDetailDialog → migrated to input/output, Material-free

### Infrastructure
- [x] 32. Extend DataTableMolecule → added `total`, `page` inputs, `pageChange`, `pageSizeChange` outputs for server-side pagination
