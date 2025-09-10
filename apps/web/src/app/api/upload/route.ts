import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Optional Vercel Blob import
let put: any = null
try {
  const blob = require('@vercel/blob')
  put = blob.put
} catch (error) {
  console.warn('Vercel Blob not available, file storage disabled')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file uploaded'
      }, { status: 400 })
    }

    const fileId = uuidv4()
    const fileName = file.name

    let fileUrl = ''

    // Try to upload to Vercel Blob if available
    if (put && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const buffer = await file.arrayBuffer()
        const blob = await put(`${fileId}.pdf`, buffer, {
          access: 'public',
          contentType: 'application/pdf'
        })
        fileUrl = blob.url
        console.log('File uploaded to Vercel Blob:', fileUrl)
      } catch (blobError) {
        console.warn('Vercel Blob upload failed, using local storage:', blobError)
      }
    } else {
      console.warn('Vercel Blob not available or token not set, file not persisted')
    }

    const response = {
      success: true,
      data: {
        fileId,
        fileName,
        ...(fileUrl && { fileUrl })
      },
      message: fileUrl ? 'File uploaded and stored successfully' : 'File uploaded (not persisted)'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to upload file'
    }, { status: 500 })
  }
}
