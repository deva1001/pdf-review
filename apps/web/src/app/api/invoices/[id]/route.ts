import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo (shared with main invoices route)
let invoices: any[] = []

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = invoices.find(inv => inv.fileId === params.id)
    
    if (!invoice) {
      return NextResponse.json({
        success: false,
        error: 'Invoice not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    console.error('Get invoice error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch invoice'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updatedInvoice = await request.json()
    
    const index = invoices.findIndex(inv => inv.fileId === params.id)
    
    if (index === -1) {
      return NextResponse.json({
        success: false,
        error: 'Invoice not found'
      }, { status: 404 })
    }

    invoices[index] = {
      ...updatedInvoice,
      _id: updatedInvoice.fileId,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: invoices[index],
      message: 'Invoice updated successfully'
    })
  } catch (error) {
    console.error('Update invoice error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update invoice'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const index = invoices.findIndex(inv => inv.fileId === params.id)
    
    if (index === -1) {
      return NextResponse.json({
        success: false,
        error: 'Invoice not found'
      }, { status: 404 })
    }

    invoices.splice(index, 1)

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    })
  } catch (error) {
    console.error('Delete invoice error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete invoice'
    }, { status: 500 })
  }
}
