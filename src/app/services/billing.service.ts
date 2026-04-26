import { Injectable, signal } from '@angular/core';
import { Invoice, BillingProvider } from '../models/billing.model';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private _providers = signal<BillingProvider[]>([
    { id: '1', name: 'Sura Medicina Prepagada', nit: '800.123.456-1' },
    { id: '2', name: 'Colsanitas', nit: '860.987.654-2' },
    { id: '3', name: 'Coomeva MP', nit: '900.555.444-3' },
    { id: '4', name: 'Particular', nit: 'N/A' }
  ]);

  private _invoices = signal<Invoice[]>([
    { 
      id: 'FAC-001', 
      appointmentId: 'APP-001', 
      patientId: 'P-001', 
      patientName: 'Mateo Garcia', 
      provider: 'Sura Medicina Prepagada', 
      date: '2026-04-20', 
      totalAmount: 150000, 
      patientAmount: 45000, 
      patientStatus: 'Pending',
      providerAmount: 105000,
      providerStatus: 'Pending',
      status: 'Pending',
      isParticular: false
    },
    { 
      id: 'FAC-002', 
      appointmentId: 'APP-002', 
      patientId: 'P-002', 
      patientName: 'Sofia Rodriguez', 
      provider: 'Colsanitas', 
      date: '2026-04-22', 
      totalAmount: 180000, 
      patientAmount: 35000, 
      patientStatus: 'Paid',
      providerAmount: 145000,
      providerStatus: 'Invoiced',
      status: 'Partial',
      isParticular: false
    },
    { 
      id: 'FAC-003', 
      appointmentId: 'APP-003', 
      patientId: 'P-001', 
      patientName: 'Mateo Garcia', 
      provider: 'Particular', 
      date: '2026-04-25', 
      totalAmount: 120000, 
      patientAmount: 120000, 
      patientStatus: 'Paid',
      providerAmount: 0,
      providerStatus: 'Paid',
      status: 'Paid',
      isParticular: true
    }
  ]);

  public providers = this._providers.asReadonly();
  public invoices = this._invoices.asReadonly();

  invoiceProvider(invoiceIds: string[]) {
    this._invoices.update(items => items.map(inv => 
      invoiceIds.includes(inv.id) ? { ...inv, providerStatus: 'Invoiced', status: 'Partial' } : inv
    ));
  }

  markProviderAsPaid(invoiceId: string) {
    this._invoices.update(items => items.map(inv => {
      if (inv.id === invoiceId) {
        const newProviderStatus = 'Paid';
        const newOverallStatus = inv.patientStatus === 'Paid' ? 'Paid' : 'Partial';
        return { ...inv, providerStatus: newProviderStatus, status: newOverallStatus };
      }
      return inv;
    }));
  }

  markPatientAsPaid(invoiceId: string) {
    this._invoices.update(items => items.map(inv => {
      if (inv.id === invoiceId) {
        const newPatientStatus = 'Paid';
        const newOverallStatus = inv.providerStatus === 'Paid' ? 'Paid' : 'Partial';
        return { ...inv, patientStatus: newPatientStatus, status: newOverallStatus };
      }
      return inv;
    }));
  }

  addInvoice(invoice: Invoice) {
    this._invoices.update(items => [invoice, ...items]);
  }

  cancelInvoiceByAppointmentId(appointmentId: string) {
    this._invoices.update(items => items.map(inv => 
      inv.appointmentId === appointmentId ? { ...inv, status: 'Cancelled' } : inv
    ));
  }
}
