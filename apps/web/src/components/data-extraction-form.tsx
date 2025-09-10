'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { InvoiceDocument, Vendor, Invoice, LineItem } from '@pdf-dashboard/types'
import { Loader2, Save, Trash2, Plus, Minus } from 'lucide-react'

interface DataExtractionFormProps {
  file: File | null
  onDataExtracted: (data: InvoiceDocument) => void
  onSave: (data: InvoiceDocument) => void
  onDelete: (fileId: string) => void
}

export function DataExtractionForm({ 
  file, 
  onDataExtracted, 
  onSave, 
  onDelete 
}: DataExtractionFormProps) {
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [extractedData, setExtractedData] = useState<InvoiceDocument | null>(null)
  const [editingData, setEditingData] = useState<InvoiceDocument | null>(null)
  const { toast } = useToast()

  // Initialize form data
  useEffect(() => {
    if (extractedData) {
      setEditingData(extractedData)
    }
  }, [extractedData])

  const handleExtract = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please upload a PDF file first.",
        variant: "destructive"
      })
      return
    }

    setIsExtracting(true)
    try {
      // Upload file first
      const formData = new FormData()
      formData.append('file', file)
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const uploadResponse = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
      })
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file')
      }
      
      const uploadResult = await uploadResponse.json()
      
      // Extract data using AI
      const extractResponse = await fetch(`${apiUrl}/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: uploadResult.data.fileId,
          model: 'gemini' // Default to Gemini
        }),
      })
      
      if (!extractResponse.ok) {
        throw new Error('Failed to extract data')
      }
      
      const extractResult = await extractResponse.json()
      const data = extractResult.data as InvoiceDocument
      
      setExtractedData(data)
      onDataExtracted(data)
      
      toast({
        title: "Data extracted successfully",
        description: "AI has extracted invoice data from the PDF.",
      })
    } catch (error) {
      console.error('Extraction error:', error)
      toast({
        title: "Extraction failed",
        description: "Failed to extract data from PDF. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSave = async () => {
    if (!editingData) return

    setIsSaving(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const response = await fetch(`${apiUrl}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingData),
      })

      if (!response.ok) {
        throw new Error('Failed to save invoice')
      }

      const result = await response.json()
      onSave(result.data)
      
      toast({
        title: "Invoice saved",
        description: "Invoice data has been saved successfully.",
      })
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: "Save failed",
        description: "Failed to save invoice data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editingData?.fileId) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const response = await fetch(`${apiUrl}/invoices/${editingData.fileId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete invoice')
      }

      onDelete(editingData.fileId)
      setExtractedData(null)
      setEditingData(null)
      
      toast({
        title: "Invoice deleted",
        description: "Invoice has been deleted successfully.",
      })
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "Delete failed",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive"
      })
    }
  }

  const updateVendor = (field: keyof Vendor, value: string) => {
    if (!editingData) return
    setEditingData({
      ...editingData,
      vendor: {
        ...editingData.vendor,
        [field]: value
      }
    })
  }

  const updateInvoice = (field: keyof Invoice, value: string | number) => {
    if (!editingData) return
    setEditingData({
      ...editingData,
      invoice: {
        ...editingData.invoice,
        [field]: value
      }
    })
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    if (!editingData) return
    const newLineItems = [...editingData.invoice.lineItems]
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: value,
      total: field === 'unitPrice' || field === 'quantity' 
        ? (field === 'unitPrice' ? value as number : newLineItems[index].unitPrice) * 
          (field === 'quantity' ? value as number : newLineItems[index].quantity)
        : newLineItems[index].total
    }
    
    setEditingData({
      ...editingData,
      invoice: {
        ...editingData.invoice,
        lineItems: newLineItems
      }
    })
  }

  const addLineItem = () => {
    if (!editingData) return
    const newLineItem: LineItem = {
      description: '',
      unitPrice: 0,
      quantity: 1,
      total: 0
    }
    
    setEditingData({
      ...editingData,
      invoice: {
        ...editingData.invoice,
        lineItems: [...editingData.invoice.lineItems, newLineItem]
      }
    })
  }

  const removeLineItem = (index: number) => {
    if (!editingData) return
    const newLineItems = editingData.invoice.lineItems.filter((_, i) => i !== index)
    
    setEditingData({
      ...editingData,
      invoice: {
        ...editingData.invoice,
        lineItems: newLineItems
      }
    })
  }

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full border rounded-lg bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Upload a PDF to extract data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border rounded-lg bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Invoice Data</h3>
        <div className="flex gap-2">
          <Button
            onClick={handleExtract}
            disabled={isExtracting}
            size="sm"
          >
            {isExtracting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Extract with AI'
            )}
          </Button>
          {editingData && (
            <>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="sm"
                variant="outline"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={handleDelete}
                size="sm"
                variant="destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {!editingData ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500">Click "Extract with AI" to get started</p>
          </div>
        ) : (
          <>
            {/* Vendor Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Vendor Information</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="vendor-name">Vendor Name *</Label>
                  <Input
                    id="vendor-name"
                    value={editingData.vendor.name}
                    onChange={(e) => updateVendor('name', e.target.value)}
                    placeholder="Enter vendor name"
                  />
                </div>
                <div>
                  <Label htmlFor="vendor-address">Address</Label>
                  <Input
                    id="vendor-address"
                    value={editingData.vendor.address || ''}
                    onChange={(e) => updateVendor('address', e.target.value)}
                    placeholder="Enter vendor address"
                  />
                </div>
                <div>
                  <Label htmlFor="vendor-taxId">Tax ID</Label>
                  <Input
                    id="vendor-taxId"
                    value={editingData.vendor.taxId || ''}
                    onChange={(e) => updateVendor('taxId', e.target.value)}
                    placeholder="Enter tax ID"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Invoice Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice-number">Invoice Number *</Label>
                  <Input
                    id="invoice-number"
                    value={editingData.invoice.number}
                    onChange={(e) => updateInvoice('number', e.target.value)}
                    placeholder="Enter invoice number"
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-date">Date *</Label>
                  <Input
                    id="invoice-date"
                    type="date"
                    value={editingData.invoice.date}
                    onChange={(e) => updateInvoice('date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-currency">Currency</Label>
                  <Select
                    value={editingData.invoice.currency || 'USD'}
                    onValueChange={(value) => updateInvoice('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="invoice-total">Total Amount</Label>
                  <Input
                    id="invoice-total"
                    type="number"
                    step="0.01"
                    value={editingData.invoice.total || ''}
                    onChange={(e) => updateInvoice('total', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-subtotal">Subtotal</Label>
                  <Input
                    id="invoice-subtotal"
                    type="number"
                    step="0.01"
                    value={editingData.invoice.subtotal || ''}
                    onChange={(e) => updateInvoice('subtotal', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-tax">Tax %</Label>
                  <Input
                    id="invoice-tax"
                    type="number"
                    step="0.01"
                    value={editingData.invoice.taxPercent || ''}
                    onChange={(e) => updateInvoice('taxPercent', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-po">PO Number</Label>
                  <Input
                    id="invoice-po"
                    value={editingData.invoice.poNumber || ''}
                    onChange={(e) => updateInvoice('poNumber', e.target.value)}
                    placeholder="Enter PO number"
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-po-date">PO Date</Label>
                  <Input
                    id="invoice-po-date"
                    type="date"
                    value={editingData.invoice.poDate || ''}
                    onChange={(e) => updateInvoice('poDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900">Line Items</h4>
                <Button onClick={addLineItem} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {editingData.invoice.lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                    <div className="col-span-5">
                      <Label htmlFor={`item-desc-${index}`}>Description</Label>
                      <Input
                        id={`item-desc-${index}`}
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`item-price-${index}`}>Unit Price</Label>
                      <Input
                        id={`item-price-${index}`}
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`item-qty-${index}`}>Quantity</Label>
                      <Input
                        id={`item-qty-${index}`}
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        placeholder="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor={`item-total-${index}`}>Total</Label>
                      <Input
                        id={`item-total-${index}`}
                        type="number"
                        step="0.01"
                        value={item.total}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        onClick={() => removeLineItem(index)}
                        size="sm"
                        variant="destructive"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
