import express from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import { ApiResponse, UploadResponse } from '@pdf-dashboard/types'

// Optional Vercel Blob import
let put: any = null
try {
  const blob = require('@vercel/blob')
  put = blob.put
} catch (error) {
  console.warn('Vercel Blob not available, file storage disabled')
}

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  }
})

// POST /api/upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      } as ApiResponse)
    }

    const fileId = uuidv4()
    const fileName = req.file.originalname

    let fileUrl = ''

    // Try to upload to Vercel Blob if available
    if (put && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`${fileId}.pdf`, req.file.buffer, {
          access: 'public',
          contentType: 'application/pdf'
        })
        fileUrl = blob.url
        console.log('File uploaded to Vercel Blob:', fileUrl)
      } catch (blobError) {
        console.warn('Vercel Blob upload failed, using local storage:', blobError)
        // Fallback to local storage or in-memory
      }
    } else {
      console.warn('Vercel Blob not available or token not set, file not persisted')
    }

    const response: ApiResponse<UploadResponse & { fileUrl?: string }> = {
      success: true,
      data: {
        fileId,
        fileName,
        ...(fileUrl && { fileUrl })
      },
      message: fileUrl ? 'File uploaded and stored successfully' : 'File uploaded (not persisted)'
    }

    res.json(response)
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to upload file'
    } as ApiResponse)
  }
})

export { router as uploadRoutes }
