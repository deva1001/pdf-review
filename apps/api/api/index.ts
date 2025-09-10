import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { uploadRoutes } from '../src/routes/upload'
import { extractRoutes } from '../src/routes/extract'
import { invoiceRoutes } from '../src/routes/invoices'
import { fileRoutes } from '../src/routes/files'
import { errorHandler } from '../src/middleware/errorHandler'

dotenv.config()

const app = express()

// Middleware
app.use(helmet())
app.use(cors({
  origin: true,
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
    console.log('MongoDB connected successfully')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    console.warn('Continuing in demo mode without database')
  }
}

// Initialize database connection
connectDB()

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
const PORT = process.env.PORT || 3001

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

export default app
