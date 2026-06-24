export interface CreateSalesNoteDto {
  correctionConceptCode: string;
  observation?: string;
  billNumber?: string;
  numberingRangeId?: number;
  isElectronic?: boolean;
  scenarioType?: string;
  items?: {
    codeReference: string;
    quantity: number;
    price?: number;
    productId?: string;
  }[];
}

export interface CreditNoteItemInfo {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface CreditNote {
  id: string;
  referenceCode: string;
  noteNumber: string | null;
  cude: string | null;
  correctionConceptCode: string;
  amount: number;
  observation: string | null;
  qrUrl: string | null;
  publicUrl: string | null;
  invoiceId: string;
  createdAt: string;
  updatedAt: string;
  items?: CreditNoteItemInfo[];
}

export interface DebitNote {
  id: string;
  referenceCode: string;
  noteNumber: string | null;
  cude: string | null;
  correctionConceptCode: string;
  amount: number;
  observation: string | null;
  qrUrl: string | null;
  publicUrl: string | null;
  invoiceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceNotesResponse {
  creditNotes: CreditNote[];
  debitNotes: DebitNote[];
}
