## Exploration: Frontend Sales UI for Manual Sales and PDF Display

### Current State

#### Invoice Management (Sales Module)

The sales module lives under `/sales` route with three sub-pages:
- **Sales List** (`SalesPageComponent`): Displays a paginated, sortable, filterable table of invoices via `MatTableDataSource`. Each row shows invoice number, customer, date, net total (`netTotal ?? totalAmount`), status (PAID/DRAFT/CANCELLED), and a "view detail" action. Non-electronic invoices (`isElectronic === false`) render a **MANUAL** badge.
- **Sale Form** (`SaleFormMolecule`, opened as a dialog): Creates invoices with a **"Venta manual"** toggle (`isManual` signal). When toggled, a warning panel explains the sale won't go to DIAN. On submit, `isElectronic: !this.isManual()` is sent to `POST /sales/invoices`.
- **Customer Detail** (`SalesCustomerDetailPageComponent`): Shows customer info + paginated invoice history via `CustomerInvoicesTableOrganism`.

There is also a **Finance module** (`/finance`) with a separate `FinanceInvoice` model and `GeneralInvoiceTableOrganism` for general services invoicing. This is a parallel system.

#### Invoice Detail Dialog

The `InvoiceDetailDialogOrganism` is the central component for viewing an invoice's full details. It:
1. Loads invoice by ID from `GET /sales/invoices/{id}`
2. Loads associated credit/debit notes from `GET /sales/invoices/{id}/notes`
3. Displays invoice items, customer info, total
4. Shows **credit notes** (red section) and **debit notes** (blue section) when they exist
5. Provides action buttons:
   - "Emitir Nota (Crédito/Débito)" — opens `SalesNoteFormDialogOrganism`
   - "Ver PDF DIAN" — downloads and opens invoice PDF
   - "Imprimir Factura" — placeholder (no logic yet)

#### Credit/Debit Note Display

**Within invoice detail dialog**: Credit notes are rendered with red styling, debit notes with blue styling. Each shows:
- Note number, CUDE (or N/A)
- Observation text (italic)
- Amount (negative for credit, positive for debit)
- **PDF DIAN link** (`note.publicUrl`) — direct external link to Factus/DIAN-hosted PDF, only rendered when `publicUrl` exists

**Within finance adjustments view**: A separate `AdjustmentDetailDialogOrganism` handles the finance module's `AdjustmentNote` model, with its own PDF download logic using `SalesNoteService.getCreditNotePdf()` / `getDebitNotePdf()`.

#### PDF Download/View Functionality

**The system has a complete PDF flow** that works via Base64 encoding:

1. **Invoice PDF** (`InvoiceService.getInvoicePdf(id)` → `GET /sales/invoices/{id}/pdf`)
   - Returns `{ pdfBase64Encoded: string, fileName: string }`
   - Used in:
     - `InvoiceDetailDialogOrganism.viewPdf()` — opens in new tab via `window.open(blobUrl, '_blank')`
     - `CustomerInvoicesTableOrganism.downloadInvoicePdf()` — same pattern

2. **Credit/Debit Note PDF** (`SalesNoteService.getCreditNotePdf(id)` / `getDebitNotePdf(id)`)
   - `GET /sales/credit-notes/{id}/pdf` and `GET /sales/debit-notes/{id}/pdf`
   - Returns same `{ pdfBase64Encoded: string, fileName: string }` shape
   - Used in `AdjustmentDetailDialogOrganism.simulatePdfDownload()`

3. **PDF rendering pattern** (identical in all components):
   ```typescript
   const byteCharacters = atob(res.pdfBase64Encoded);
   const byteNumbers = new Array(byteCharacters.length);
   for (let i = 0; i < byteCharacters.length; i++) {
     byteNumbers[i] = byteCharacters.charCodeAt(i);
   }
   const byteArray = new Uint8Array(byteNumbers);
   const blob = new Blob([byteArray], { type: 'application/pdf' });
   const blobUrl = URL.createObjectURL(blob);
   window.open(blobUrl, '_blank');
   ```
   This opens the PDF in a new browser tab for viewing/printing/downloading using the browser's native PDF viewer.

**Key observation**: There's no forced download (save-as) — all PDF actions open in a new tab. The `fileName` from the response is never actually used for download.

#### Related Services

| Service | Endpoints | Purpose |
|---------|-----------|---------|
| `InvoiceService` | `GET /sales/invoices`, `GET /sales/invoices/{id}`, `POST /sales/invoices`, `GET /sales/invoices/{id}/pdf`, `GET /sales/stats/financial` | CRUD + PDF for invoices |
| `SalesNoteService` | `POST /sales/invoices/{id}/credit-note`, `POST /sales/invoices/{id}/debit-note`, `GET /sales/invoices/{id}/notes`, `GET /sales/notes`, `GET /sales/credit-notes/{id}/pdf`, `GET /sales/debit-notes/{id}/pdf` | CRUD + PDF for credit/debit notes |
| `FinanceService` | Manages its own `FinanceInvoice` and `AdjustmentNote` models (separate domain, same UI) | General finance invoicing |

### Affected Areas

- `src/app/components/pages/sales-page/sales-page.component.ts` — Main sales list with MANUAL badge
- `src/app/components/molecules/sale-form/sale-form.component.ts` — Invoice creation with manual toggle
- `src/app/components/organisms/invoice-detail-dialog/invoice-detail-dialog.component.ts` — Central invoice detail + PDF viewer + credit/debit notes display
- `src/app/components/organisms/customer-invoices-table/customer-invoices-table.component.ts` — Customer invoice history with PDF button
- `src/app/components/organisms/sales-note-form-dialog/sales-note-form-dialog.component.ts` — Credit/debit note creation dialog
- `src/app/components/organisms/adjustment-detail-dialog/adjustment-detail-dialog.component.ts` — Finance module note detail with PDF
- `src/app/services/invoice.service.ts` — Invoice API, includes `getInvoicePdf()`
- `src/app/services/sales-note.service.ts` — Credit/debit note API, includes `getCreditNotePdf()` / `getDebitNotePdf()`
- `src/app/models/invoice.model.ts` — Invoice model (has `isElectronic` flag)
- `src/app/models/sales-note.model.ts` — CreditNote/DebitNote models
- `src/app/models/finance.model.ts` — Finance module models (has `dbId` for PDF download)
- `src/app/components/pages/sales-page/sales-page.component.spec.ts` — Existing tests for MANUAL badge and netTotal display

### Risks and Edge Cases

1. **PDF file name never used**: The `fileName` field returned by the backend is ignored everywhere. PDFs open in a new tab without a filename, so users can't save with a meaningful name via the browser's native "Save As" dialog.

2. **`publicUrl` vs API PDF**: Credit/debit notes from DIAN have a `publicUrl` that links externally to Factus/DIAN-hosted PDF. The "Ver PDF DIAN" button in invoice detail uses the API-based flow (`getInvoicePdf`), while the per-note links use the external `publicUrl`. These are different PDF sources — one hosted on the ERP backend, one on Factus/DIAN.

3. **Error handling inconsistency**: PDF decoding errors show `alert()` dialogs (blocking UX) instead of snackbar or in-component messages. The `CustomerInvoicesTableOrganism` silently logs errors without user feedback.

4. **No PDF for manual sales**: The current "Ver PDF DIAN" button appears for ALL invoices regardless of `isElectronic` status. If the backend doesn't generate PDFs for manual (non-electronic) invoices, the button will fail silently or return an error for those invoices.

5. **`netTotal` calculation**: The invoice list shows `netTotal ?? totalAmount`, where `netTotal = totalAmount - ΣcreditNotes + ΣdebitNotes`. This is computed by the backend. If the backend doesn't compute `netTotal` for manual invoices, the raw `totalAmount` is shown instead.

6. **Missing "Imprimir Factura" logic**: The button exists in the template but has no `(click)` handler. It's purely decorative.

7. **Credit/debit note PDF from adjustment detail uses `dbId`**: The `AdjustmentDetailDialogOrganism` accesses `note.dbId` (database UUID) to fetch PDF, while the `CreditNote`/`DebitNote` models use their `id` field. The `dbId` field is inconsistently typed as optional (`string | undefined`).

8. **Duplicate PDF decoding logic**: The Base64-to-blob conversion is copy-pasted across three components (`invoice-detail-dialog`, `customer-invoices-table`, `adjustment-detail-dialog`). Any fix would need to be applied in all three places.

9. **Memory leak potential**: `URL.createObjectURL(blob)` is never revoked with `URL.revokeObjectURL()`. For short-lived tabs this is acceptable, but repeated viewing could leak blob URLs.

10. **Finance module vs Sales module separation**: There are two parallel invoice models (`Invoice` vs `FinanceInvoice`) with different API backends. The Finance module has its own PDF handling via `general-invoice-table` (which only has a menu item "Imprimir PDF" with no actual implementation).
