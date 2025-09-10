import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { uploadRoutes } from './routes/upload'
import { extractRoutes } from './routes/extract'
import { invoiceRoutes } from './routes/invoices'
import { fileRoutes } from './routes/files'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://pdf-review-web.vercel.app',
    'https://pdf-review-web-git-master-deva1001.vercel.app'
  ],
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI not set - running in demo mode without database')
      return
    }
    
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    console.warn('Continuing in demo mode without database')
  }
}

// Routes
app.use('/api/upload', uploadRoutes)
app.use('/api/extract', extractRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/files', fileRoutes)

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'PDF Review Dashboard API',
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  })
})

// Start server
const startServer = async () => {
  await connectDB()
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

startServer().catch(console.error)
