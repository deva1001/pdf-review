export interface Vendor {
  name: string;
  address?: string;
  taxId?: string;
}

export interface LineItem {
  description: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Invoice {
  number: string;
  date: string;
  currency?: string;
  subtotal?: number;
  taxPercent?: number;
  total?: number;
  poNumber?: string;
  poDate?: string;
  lineItems: LineItem[];
}

export interface InvoiceDocument {
  fileId: string;
  fileName: string;
  vendor: Vendor;
  invoice: Invoice;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadResponse {
  fileId: string;
  fileName: string;
  fileUrl?: string;
}

export interface ExtractRequest {
  fileId: string;
  model: 'gemini' | 'groq';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
