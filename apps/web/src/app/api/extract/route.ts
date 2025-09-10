import { NextRequest, NextResponse } from 'next/server'

// Mock AI extraction for demo
const mockExtractData = (fileId: string, model: string) => {
  return {
    fileId,
    fileName: `invoice-${fileId}.pdf`,
    vendor: {
      name: "Acme Corporation",
      address: "123 Business St, City, State 12345",
      taxId: "12-3456789"
    },
    invoice: {
      number: `INV-${fileId.slice(0, 8).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      currency: "USD",
      subtotal: 1500.00,
      taxPercent: 8.5,
      total: 1627.50,
      poNumber: `PO-${fileId.slice(0, 6).toUpperCase()}`,
      poDate: new Date().toISOString().split('T')[0],
      lineItems: [
        {
          description: "Professional Services",
          unitPrice: 1000.00,
          quantity: 1,
          total: 1000.00
        },
        {
          description: "Consulting Fee",
          unitPrice: 500.00,
          quantity: 1,
          total: 500.00
        }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileId, model } = body

    if (!fileId) {
      return NextResponse.json({
        success: false,
        error: 'fileId is required'
      }, { status: 400 })
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const extractedData = mockExtractData(fileId, model)

    return NextResponse.json({
      success: true,
      data: extractedData,
      message: `Data extracted using ${model || 'mock'} AI`
    })
  } catch (error) {
    console.error('Extraction error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to extract data'
    }, { status: 500 })
  }
}
