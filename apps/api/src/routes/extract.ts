import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'
import { ApiResponse, ExtractRequest, InvoiceDocument } from '@pdf-dashboard/types'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Initialize AI clients
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null

// POST /api/extract
router.post('/', async (req, res) => {
  try {
    const { fileId, model }: ExtractRequest = req.body

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'fileId is required'
      } as ApiResponse)
    }

    if (!model || !['gemini', 'groq'].includes(model)) {
      return res.status(400).json({
        success: false,
        error: 'model must be either "gemini" or "groq"'
      } as ApiResponse)
    }

    // For demo purposes, we'll generate mock extracted data
    // In a real app, you would:
    // 1. Retrieve the PDF file from storage using fileId
    // 2. Convert PDF to text or images
    // 3. Send to AI service for extraction
    // 4. Parse and validate the response

    const mockExtractedData: InvoiceDocument = {
      fileId,
      fileName: `invoice-${fileId}.pdf`,
      vendor: {
        name: 'Acme Corporation',
        address: '123 Business St, City, State 12345',
        taxId: '12-3456789'
      },
      invoice: {
        number: 'INV-2024-001',
        date: '2024-01-15',
        currency: 'USD',
        subtotal: 1000.00,
        taxPercent: 8.5,
        total: 1085.00,
        poNumber: 'PO-2024-001',
        poDate: '2024-01-10',
        lineItems: [
          {
            description: 'Professional Services',
            unitPrice: 500.00,
            quantity: 2,
            total: 1000.00
          }
        ]
      },
      createdAt: new Date().toISOString()
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const response: ApiResponse<InvoiceDocument> = {
      success: true,
      data: mockExtractedData,
      message: `Data extracted successfully using ${model}`
    }

    res.json(response)
  } catch (error) {
    console.error('Extraction error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to extract data from PDF'
    } as ApiResponse)
  }
})

// Helper function to extract data using Gemini (placeholder)
async function extractWithGemini(pdfText: string): Promise<InvoiceDocument> {
  if (!genAI) {
    throw new Error('Gemini API key not configured')
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  
  const prompt = `
    Extract invoice data from the following PDF text and return it as JSON in this exact format:
    {
      "vendor": {
        "name": "string",
        "address": "string",
        "taxId": "string"
      },
      "invoice": {
        "number": "string",
        "date": "YYYY-MM-DD",
        "currency": "string",
        "subtotal": number,
        "taxPercent": number,
        "total": number,
        "poNumber": "string",
        "poDate": "YYYY-MM-DD",
        "lineItems": [
          {
            "description": "string",
            "unitPrice": number,
            "quantity": number,
            "total": number
          }
        ]
      }
    }
    
    PDF Text: ${pdfText}
  `

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  
  // Parse and validate the JSON response
  try {
    return JSON.parse(text)
  } catch (parseError) {
    throw new Error('Failed to parse AI response as JSON')
  }
}

// Helper function to extract data using Groq (placeholder)
async function extractWithGroq(pdfText: string): Promise<InvoiceDocument> {
  if (!groq) {
    throw new Error('Groq API key not configured')
  }

  const prompt = `
    Extract invoice data from the following PDF text and return it as JSON in this exact format:
    {
      "vendor": {
        "name": "string",
        "address": "string",
        "taxId": "string"
      },
      "invoice": {
        "number": "string",
        "date": "YYYY-MM-DD",
        "currency": "string",
        "subtotal": number,
        "taxPercent": number,
        "total": number,
        "poNumber": "string",
        "poDate": "YYYY-MM-DD",
        "lineItems": [
          {
            "description": "string",
            "unitPrice": number,
            "quantity": number,
            "total": number
          }
        ]
      }
    }
    
    PDF Text: ${pdfText}
  `

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'llama3-8b-8192',
    temperature: 0.1
  })

  const text = completion.choices[0]?.message?.content || ''
  
  // Parse and validate the JSON response
  try {
    return JSON.parse(text)
  } catch (parseError) {
    throw new Error('Failed to parse AI response as JSON')
  }
}

export { router as extractRoutes }
