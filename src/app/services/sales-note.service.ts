import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { CreateSalesNoteDto, CreditNote, InvoiceNotesResponse } from '../models/sales-note.model';

@Injectable({
  providedIn: 'root'
})
export class SalesNoteService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/sales/invoices`;

  /**
   * Generates a Credit Note for a specific invoice
   */
  createCreditNote(invoiceId: string, dto: CreateSalesNoteDto): Observable<CreditNote> {
    return this.http.post<CreditNote>(`${this.baseUrl}/${invoiceId}/credit-note`, dto);
  }

  /**
   * Retrieves all credit notes associated with an invoice
   */
  getNotesByInvoiceId(invoiceId: string): Observable<InvoiceNotesResponse> {
    return this.http.get<InvoiceNotesResponse>(`${this.baseUrl}/${invoiceId}/notes`);
  }

  /**
   * Retrieves all credit notes across all invoices in the system
   */
  getNotes(): Observable<InvoiceNotesResponse> {
    return this.http.get<InvoiceNotesResponse>(`${environment.apiUrl}/sales/notes`);
  }

  /**
   * Retrieves Credit Note PDF in Base64
   */
  getCreditNotePdf(id: string): Observable<{ pdfBase64Encoded: string; fileName: string }> {
    return this.http.get<{ pdfBase64Encoded: string; fileName: string }>(`${environment.apiUrl}/sales/credit-notes/${id}/pdf`);
  }

}
