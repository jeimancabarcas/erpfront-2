import { Injectable, signal } from '@angular/core';

export interface InvoiceProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  products?: InvoiceProduct[];
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  nit: string;
  email: string;
  phone?: string;
  address?: string;
  status: 'Active' | 'Inactive';
  totalSpent: number;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private _invoices = signal<Invoice[]>([
    { 
      id: 'INV-001', 
      customer: 'Tech Solutions SA', 
      date: '2026-04-20', 
      amount: 1500.00, 
      status: 'Paid',
      products: [
        { id: '1', name: 'Laptop Pro 14', quantity: 1, price: 1500 }
      ]
    },
    { 
      id: 'INV-002', 
      customer: 'Global Exports', 
      date: '2026-04-21', 
      amount: 2850.50, 
      status: 'Pending',
      products: [
        { id: '2', name: 'Monitor 27" 4K', quantity: 2, price: 1425.25 }
      ]
    },
    { 
      id: 'INV-003', 
      customer: 'Innovate Corp', 
      date: '2026-04-22', 
      amount: 420.00, 
      status: 'Overdue',
      products: [
        { id: '4', name: 'Mouse Inalámbrico', quantity: 10, price: 42 }
      ]
    },
  ]);

  private _customers = signal<Customer[]>([
    { id: 'C-001', name: 'Laura Martinez', company: 'Future Dynamics', nit: '900.123.456-1', email: 'laura@future.com', status: 'Active', totalSpent: 5000 },
    { id: 'C-002', name: 'Roberto Gómez', company: 'Build-IT', nit: '800.987.654-2', email: 'roberto@buildit.io', status: 'Active', totalSpent: 1200 },
    { id: 'C-003', name: 'Elena Rivas', company: 'Eco Systems', nit: '700.456.789-3', email: 'elena@eco.org', status: 'Inactive', totalSpent: 2500 },
  ]);

  public invoices = this._invoices.asReadonly();
  public customers = this._customers.asReadonly();

  addInvoice(invoice: Invoice) {
    this._invoices.update(items => [invoice, ...items]);
  }

  addCustomer(customer: Customer) {
    this._customers.update(items => [...items, customer]);
  }
}
