'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InvoiceDocument, LineItem } from '@pdf-dashboard/types'
import { X, Save, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react'

interface InvoiceDetailModalProps {
  invoice: InvoiceDocument | null
  isOpen: boolean
  onClose: () => void
  onSave: (invoice: InvoiceDocument) => void
  onDelete: (fileId: string) => void
  mode: 'view' | 'edit'
}

export function InvoiceDetailModal({ 
  invoice, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  mode 
}: InvoiceDetailModalProps) {
  const [editingInvoice, setEditingInvoice] = useState<InvoiceDocument | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (invoice) {
      setEditingInvoice(invoice)
    }
  }, [invoice])

  if (!isOpen || !invoice || !editingInvoice) return null

  const handleSave = async () => {
    if (!editingInvoice) return

    setIsSaving(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const response = await fetch(`${apiUrl}/invoices/${editingInvoice.fileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingInvoice),
      })

      if (!response.ok) {
        throw new Error('Failed to update invoice')
      }

      onSave(editingInvoice)
      onClose()
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save invoice')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const response = await fetch(`${apiUrl}/invoices/${editingInvoice.fileId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete invoice')
      }

      onDelete(editingInvoice.fileId)
      onClose()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete invoice')
    }
  }

  const updateVendor = (field: keyof typeof editingInvoice.vendor, value: string) => {
    setEditingInvoice({
      ...editingInvoice,
      vendor: {
        ...editingInvoice.vendor,
        [field]: value
      }
    })
  }

  const updateInvoice = (field: keyof typeof editingInvoice.invoice, value: string | number) => {
    setEditingInvoice({
      ...editingInvoice,
      invoice: {
        ...editingInvoice.invoice,
        [field]: value
      }
    })
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newLineItems = [...editingInvoice.invoice.lineItems]
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: value,
      total: field === 'unitPrice' || field === 'quantity' 
        ? (field === 'unitPrice' ? value as number : newLineItems[index].unitPrice) * 
          (field === 'quantity' ? value as number : newLineItems[index].quantity)
        : newLineItems[index].total
    }
    
    setEditingInvoice({
      ...editingInvoice,
      invoice: {
        ...editingInvoice.invoice,
        lineItems: newLineItems
      }
    })
  }

  const addLineItem = () => {
    const newLineItem: LineItem = {
      description: '',
      unitPrice: 0,
      quantity: 1,
      total: 0
    }
    
    setEditingInvoice({
      ...editingInvoice,
      invoice: {
        ...editingInvoice.invoice,
        lineItems: [...editingInvoice.invoice.lineItems, newLineItem]
      }
    })
  }

  const removeLineItem = (index: number) => {
    const newLineItems = editingInvoice.invoice.lineItems.filter((_, i) => i !== index)
    
    setEditingInvoice({
      ...editingInvoice,
      invoice: {
        ...editingInvoice.invoice,
        lineItems: newLineItems
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h2 className="text-xl font-semibold">
              {mode === 'view' ? 'View Invoice' : 'Edit Invoice'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'edit' && (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  size="sm"
                >
                  {isSaving ? 'Saving...' : <Save className="h-4 w-4" />}
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
            <Button onClick={onClose} size="sm" variant="outline">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Vendor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Vendor Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendor-name">Vendor Name</Label>
                <Input
                  id="vendor-name"
                  value={editingInvoice.vendor.name}
                  onChange={(e) => updateVendor('name', e.target.value)}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <Label htmlFor="vendor-address">Address</Label>
                <Input
                  id="vendor-address"
                  value={editingInvoice.vendor.address || ''}
                  onChange={(e) => updateVendor('address', e.target.value)}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <Label htmlFor="vendor-taxId">Tax ID</Label>
                <Input
                  id="vendor-taxId"
                  value={editingInvoice.vendor.taxId || ''}
                  onChange={(e) => updateVendor('taxId', e.target.value)}
                  disabled={mode === 'view'}
                />
              </div>
            </div>
          </div>

          {/* Invoice Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Invoice Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice-number">Invoice Number</Label>
                <Input
                  id="invoice-number"
                  value={editingInvoice.invoice.number}
                  onChange={(e) => updateInvoice('number', e.target.value)}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <Label htmlFor="invoice-date">Date</Label>
                <Input
                  id="invoice-date"
                  type="date"
                  value={editingInvoice.invoice.date}
                  onChange={(e) => updateInvoice('date', e.target.value)}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <Label htmlFor="invoice-currency">Currency</Label>
                <Select
                  value={editingInvoice.invoice.currency || 'USD'}
                  onValueChange={(value) => updateInvoice('currency', value)}
                  disabled={mode === 'view'}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                  value={editingInvoice.invoice.total || ''}
                  onChange={(e) => updateInvoice('total', parseFloat(e.target.value) || 0)}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <Label htmlFor="invoice-subtotal">Subtotal</Label>
                <Input
                  id="invoice-subtotal"
                  type="number"
                  step="0.01"
                  value={editingInvoice.invoice.subtotal || ''}
                  onChange={(e) => updateInvoice('subtotal', parseFloat(e.target.value) || 0)}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <Label htmlFor="invoice-tax">Tax %</Label>
                <Input
                  id="invoice-tax"
                  type="number"
                  step="0.01"
                  value={editingInvoice.invoice.taxPercent || ''}
                  onChange={(e) => updateInvoice('taxPercent', parseFloat(e.target.value) || 0)}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <Label htmlFor="invoice-po">PO Number</Label>
                <Input
                  id="invoice-po"
                  value={editingInvoice.invoice.poNumber || ''}
                  onChange={(e) => updateInvoice('poNumber', e.target.value)}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <Label htmlFor="invoice-po-date">PO Date</Label>
                <Input
                  id="invoice-po-date"
                  type="date"
                  value={editingInvoice.invoice.poDate || ''}
                  onChange={(e) => updateInvoice('poDate', e.target.value)}
                  disabled={mode === 'view'}
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Line Items</h3>
              {mode === 'edit' && (
                <Button onClick={addLineItem} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              {editingInvoice.invoice.lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                  <div className="col-span-5">
                    <Label htmlFor={`item-desc-${index}`}>Description</Label>
                    <Input
                      id={`item-desc-${index}`}
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      disabled={mode === 'view'}
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
                      disabled={mode === 'view'}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`item-qty-${index}`}>Quantity</Label>
                    <Input
                      id={`item-qty-${index}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      disabled={mode === 'view'}
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
                  {mode === 'edit' && (
                    <div className="col-span-1">
                      <Button
                        onClick={() => removeLineItem(index)}
                        size="sm"
                        variant="destructive"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}