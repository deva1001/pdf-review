import express from 'express'
import { Invoice } from '../models/Invoice'
import { ApiResponse, InvoiceDocument } from '@pdf-dashboard/types'
import mongoose from 'mongoose'

const router = express.Router()

// In-memory storage for demo mode (fallback when no DB)
let demoInvoices: InvoiceDocument[] = []

// Check if MongoDB is connected
const isDbConnected = () => mongoose.connection.readyState === 1

// GET /api/invoices - List all invoices with optional search
router.get('/', async (req, res) => {
  try {
    const { q, page = '1', limit = '10' } = req.query
    const pageNum = parseInt(page as string, 10)
    const limitNum = parseInt(limit as string, 10)
    const skip = (pageNum - 1) * limitNum

    let invoices: InvoiceDocument[] = []
    let total = 0

    if (isDbConnected()) {
      // Use MongoDB
      let query = {}
      
      // Search functionality
      if (q && typeof q === 'string') {
        query = {
          $or: [
            { 'vendor.name': { $regex: q, $options: 'i' } },
            { 'invoice.number': { $regex: q, $options: 'i' } }
          ]
        }
      }

      invoices = await Invoice.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean() as InvoiceDocument[]

      total = await Invoice.countDocuments(query)
    } else {
      // Use in-memory storage
      let filteredInvoices = [...demoInvoices]
      
      // Search functionality
      if (q && typeof q === 'string') {
        const searchTerm = q.toLowerCase()
        filteredInvoices = demoInvoices.filter(invoice => 
          invoice.vendor.name.toLowerCase().includes(searchTerm) ||
          invoice.invoice.number.toLowerCase().includes(searchTerm)
        )
      }

      // Sort by creation date (newest first)
      filteredInvoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      total = filteredInvoices.length
      invoices = filteredInvoices.slice(skip, skip + limitNum)
    }

    const totalPages = Math.ceil(total / limitNum)

    const response: ApiResponse<{
      invoices: InvoiceDocument[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }> = {
      success: true,
      data: {
        invoices,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages
        }
      }
    }

    res.json(response)
  } catch (error) {
    console.error('List invoices error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices'
    } as ApiResponse)
  }
})

// GET /api/invoices/:id - Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    let invoice: InvoiceDocument | null = null

    if (isDbConnected()) {
      invoice = await Invoice.findOne({ fileId: id }).lean() as InvoiceDocument
    } else {
      invoice = demoInvoices.find(inv => inv.fileId === id) || null
    }

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      } as ApiResponse)
    }

    const response: ApiResponse<InvoiceDocument> = {
      success: true,
      data: invoice
    }

    res.json(response)
  } catch (error) {
    console.error('Get invoice error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice'
    } as ApiResponse)
  }
})

// POST /api/invoices - Create new invoice
router.post('/', async (req, res) => {
  try {
    const invoiceData: InvoiceDocument = req.body

    // Validate required fields
    if (!invoiceData.fileId || !invoiceData.fileName || !invoiceData.vendor?.name || !invoiceData.invoice?.number) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fileId, fileName, vendor.name, invoice.number'
      } as ApiResponse)
    }

    let savedInvoice: InvoiceDocument

    if (isDbConnected()) {
      // Check if invoice already exists
      const existingInvoice = await Invoice.findOne({ fileId: invoiceData.fileId })
      if (existingInvoice) {
        return res.status(409).json({
          success: false,
          error: 'Invoice with this fileId already exists'
        } as ApiResponse)
      }

      // Save to MongoDB
      const invoice = new Invoice(invoiceData)
      await invoice.save()
      savedInvoice = invoice.toObject() as InvoiceDocument
    } else {
      // Check if invoice already exists
      const existingInvoice = demoInvoices.find(inv => inv.fileId === invoiceData.fileId)
      if (existingInvoice) {
        return res.status(409).json({
          success: false,
          error: 'Invoice with this fileId already exists'
        } as ApiResponse)
      }

      // Add to in-memory storage
      demoInvoices.push(invoiceData)
      savedInvoice = invoiceData
    }

    const response: ApiResponse<InvoiceDocument> = {
      success: true,
      data: savedInvoice,
      message: 'Invoice created successfully'
    }

    res.status(201).json(response)
  } catch (error) {
    console.error('Create invoice error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create invoice'
    } as ApiResponse)
  }
})

// PUT /api/invoices/:id - Update invoice
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    // Remove fields that shouldn't be updated
    delete updateData.fileId
    delete updateData.createdAt

    // Add updatedAt timestamp
    updateData.updatedAt = new Date().toISOString()

    let updatedInvoice: InvoiceDocument

    if (isDbConnected()) {
      const invoice = await Invoice.findOneAndUpdate(
        { fileId: id },
        updateData,
        { new: true, runValidators: true }
      ).lean()

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        } as ApiResponse)
      }

      updatedInvoice = invoice as InvoiceDocument
    } else {
      const invoiceIndex = demoInvoices.findIndex(inv => inv.fileId === id)
      
      if (invoiceIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        } as ApiResponse)
      }

      // Update the invoice
      demoInvoices[invoiceIndex] = { ...demoInvoices[invoiceIndex], ...updateData }
      updatedInvoice = demoInvoices[invoiceIndex]
    }

    const response: ApiResponse<InvoiceDocument> = {
      success: true,
      data: updatedInvoice,
      message: 'Invoice updated successfully'
    }

    res.json(response)
  } catch (error) {
    console.error('Update invoice error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update invoice'
    } as ApiResponse)
  }
})

// DELETE /api/invoices/:id - Delete invoice
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (isDbConnected()) {
      const invoice = await Invoice.findOneAndDelete({ fileId: id }).lean()

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        } as ApiResponse)
      }
    } else {
      const invoiceIndex = demoInvoices.findIndex(inv => inv.fileId === id)
      
      if (invoiceIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        } as ApiResponse)
      }

      // Remove the invoice
      demoInvoices.splice(invoiceIndex, 1)
    }

    const response: ApiResponse = {
      success: true,
      message: 'Invoice deleted successfully'
    }

    res.json(response)
  } catch (error) {
    console.error('Delete invoice error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete invoice'
    } as ApiResponse)
  }
})

export { router as invoiceRoutes }
