import mongoose, { Schema, Document } from 'mongoose'

export interface IInvoiceDocument extends Document {
  fileId: string
  fileName: string
  vendor: {
    name: string
    address?: string
    taxId?: string
  }
  invoice: {
    number: string
    date: string
    currency?: string
    subtotal?: number
    taxPercent?: number
    total?: number
    poNumber?: string
    poDate?: string
    lineItems: Array<{
      description: string
      unitPrice: number
      quantity: number
      total: number
    }>
  }
  createdAt: string
  updatedAt?: string
}

const InvoiceSchema = new Schema<IInvoiceDocument>({
  fileId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  vendor: {
    name: {
      type: String,
      required: true
    },
    address: String,
    taxId: String
  },
  invoice: {
    number: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    subtotal: Number,
    taxPercent: Number,
    total: Number,
    poNumber: String,
    poDate: String,
    lineItems: [{
      description: {
        type: String,
        required: true
      },
      unitPrice: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      total: {
        type: Number,
        required: true
      }
    }]
  },
  createdAt: {
    type: String,
    default: () => new Date().toISOString()
  },
  updatedAt: {
    type: String,
    default: () => new Date().toISOString()
  }
}, {
  timestamps: false // We're handling timestamps manually
})

// Index for search functionality
InvoiceSchema.index({ 
  'vendor.name': 'text', 
  'invoice.number': 'text' 
})

export const Invoice = mongoose.model<IInvoiceDocument>('Invoice', InvoiceSchema)
