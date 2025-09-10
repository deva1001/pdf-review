'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PDFViewer } from '@/components/pdf-viewer'
import { DataExtractionForm } from '@/components/data-extraction-form'
import { InvoiceDocument } from '@pdf-dashboard/types'
import { ArrowLeft, FileText } from 'lucide-react'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [extractedData, setExtractedData] = useState<InvoiceDocument | null>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setExtractedData(null) // Reset extracted data when new file is selected
  }

  const handleDataExtracted = (data: InvoiceDocument) => {
    setExtractedData(data)
  }

  const handleSave = (data: InvoiceDocument) => {
    setExtractedData(data)
    // In a real app, you might want to refresh a list of saved invoices here
  }

  const handleDelete = (fileId: string) => {
    setExtractedData(null)
    // In a real app, you might want to refresh a list of saved invoices here
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PDF Review Dashboard</h1>
              <p className="text-sm text-gray-600">Upload, view, and extract data from PDFs using AI</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/invoices">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Invoices
                </Button>
              </Link>
              <div className="text-sm text-gray-500">
                Powered by Gemini AI
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* PDF Viewer */}
          <div className="h-full">
            <PDFViewer 
              file={selectedFile} 
              onFileSelect={handleFileSelect}
            />
          </div>

          {/* Data Extraction Form */}
          <div className="h-full">
            <DataExtractionForm
              file={selectedFile}
              onDataExtracted={handleDataExtracted}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
