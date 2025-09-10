import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo
let invoices: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const query = searchParams.get('q') || ''

    let filteredInvoices = invoices

    if (query) {
      filteredInvoices = invoices.filter(invoice => 
        invoice.vendor.name.toLowerCase().includes(query.toLowerCase()) ||
        invoice.invoice.number.toLowerCase().includes(query.toLowerCase())
      )
    }

    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        invoices: paginatedInvoices,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredInvoices.length / limit),
          totalItems: filteredInvoices.length,
          itemsPerPage: limit
        }
      }
    })
  } catch (error) {
    console.error('Get invoices error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch invoices'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const invoice = await request.json()
    
    const newInvoice = {
      ...invoice,
      _id: invoice.fileId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    invoices.push(newInvoice)

    return NextResponse.json({
      success: true,
      data: newInvoice,
      message: 'Invoice created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Create invoice error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create invoice'
    }, { status: 500 })
  }
}
