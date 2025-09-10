# PDF Review Dashboard

A comprehensive PDF review and data extraction dashboard built with Next.js, Node.js, and AI-powered data extraction using Gemini and Groq APIs.

## 🎯 Features

- **PDF Viewer**: Upload and view PDFs in-browser with zoom and page navigation
- **AI Data Extraction**: Extract invoice data using Gemini or Groq AI
- **Data Editing**: Edit extracted data with a user-friendly form
- **CRUD Operations**: Create, read, update, and delete invoice records
- **Search**: Search invoices by vendor name and invoice number
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## 🏗️ Architecture

This is a monorepo built with Turborepo containing:

- `apps/web` - Next.js frontend application
- `apps/api` - Node.js backend API
- `packages/types` - Shared TypeScript types

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account (for production)
- Gemini API key or Groq API key (for production)

### 🎯 **Demo Mode (No Setup Required)**
The application works out-of-the-box in demo mode with in-memory storage. Perfect for testing and development!

### 🏭 **Production Mode**
For production deployment, you'll need MongoDB Atlas and AI API keys. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### 1. Clone and Install

```bash
git clone <repository-url>
cd pdf-review-dashboard
npm install
```

### 2. Environment Setup

Copy the environment files and configure them:

```bash
# API environment
cp apps/api/env.example apps/api/.env.local

# Web environment  
cp apps/web/.env.example apps/web/.env.local
```

Configure your environment variables:

**apps/api/.env.local:**
```env
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pdf-dashboard?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
NODE_ENV=development
```

**apps/web/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Run Development Servers

```bash
# Start both web and API in development mode
npm run dev

# Or run individually:
# API only
cd apps/api && npm run dev

# Web only  
cd apps/web && npm run dev
```

### 4. Access the Application

- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 📚 API Documentation

### Base URL
- Development: `http://localhost:3001/api`
- Production: `https://your-api-domain.vercel.app/api`

### Endpoints

#### Upload PDF
```http
POST /upload
Content-Type: multipart/form-data

Body: file (PDF file, max 25MB)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "uuid",
    "fileName": "invoice.pdf"
  },
  "message": "File uploaded successfully"
}
```

#### Extract Data
```http
POST /extract
Content-Type: application/json

{
  "fileId": "uuid",
  "model": "gemini" | "groq"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "uuid",
    "fileName": "invoice.pdf",
    "vendor": {
      "name": "Acme Corp",
      "address": "123 Business St",
      "taxId": "12-3456789"
    },
    "invoice": {
      "number": "INV-001",
      "date": "2024-01-15",
      "currency": "USD",
      "subtotal": 1000.00,
      "taxPercent": 8.5,
      "total": 1085.00,
      "lineItems": [...]
    },
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### List Invoices
```http
GET /invoices?q=search&page=1&limit=10
```

#### Get Invoice
```http
GET /invoices/:id
```

#### Create Invoice
```http
POST /invoices
Content-Type: application/json

{
  "fileId": "uuid",
  "fileName": "invoice.pdf",
  "vendor": {...},
  "invoice": {...}
}
```

#### Update Invoice
```http
PUT /invoices/:id
Content-Type: application/json

{
  "vendor": {...},
  "invoice": {...}
}
```

#### Delete Invoice
```http
DELETE /invoices/:id
```

## 🛠️ Tech Stack

### Frontend (apps/web)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **PDF Viewer**: react-pdf with pdf.js
- **State Management**: React hooks

### Backend (apps/api)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **AI Services**: Google Gemini, Groq
- **File Upload**: Multer
- **Validation**: Joi

### Infrastructure
- **Monorepo**: Turborepo
- **Deployment**: Vercel
- **Database**: MongoDB Atlas

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**:
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Deploy both `apps/web` and `apps/api` as separate projects

2. **Environment Variables**:
   Set the following in Vercel dashboard:
   - `MONGODB_URI`
   - `GEMINI_API_KEY` or `GROQ_API_KEY`
   - `NEXT_PUBLIC_API_URL` (for web app)

3. **Deploy**:
   ```bash
   # Deploy web app
   cd apps/web
   vercel --prod

   # Deploy API
   cd apps/api  
   vercel --prod
   ```

### Expected URLs
- **Web**: `https://pdf-dashboard-web.vercel.app`
- **API**: `https://pdf-dashboard-api.vercel.app`

## 📁 Project Structure

```
pdf-review-dashboard/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/         # App router pages
│   │   │   ├── components/  # React components
│   │   │   └── lib/         # Utilities
│   │   └── package.json
│   └── api/                 # Node.js backend
│       ├── src/
│       │   ├── routes/      # API routes
│       │   ├── models/      # MongoDB models
│       │   └── middleware/  # Express middleware
│       └── package.json
├── packages/
│   └── types/               # Shared TypeScript types
├── turbo.json              # Turborepo configuration
└── package.json            # Root package.json
```

## 🔧 Development

### Available Scripts

```bash
# Install dependencies
npm install

# Run all apps in development
npm run dev

# Build all apps
npm run build

# Lint all apps
npm run lint

# Type check all apps
npm run type-check
```

### Individual App Scripts

```bash
# Web app
cd apps/web
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# API
cd apps/api
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
```

## 🧪 Testing

The application includes:
- PDF upload and viewing functionality
- AI data extraction (with mock data for demo)
- Full CRUD operations for invoice management
- Search functionality
- Responsive design

## 📝 Data Model

```typescript
interface InvoiceDocument {
  fileId: string
  fileName: string
  vendor: {
    name: string
    address?: string
    taxId?: string
  }
  invoice: {
    number: string
    date: string
    currency?: string
    subtotal?: number
    taxPercent?: number
    total?: number
    poNumber?: string
    poDate?: string
    lineItems: Array<{
      description: string
      unitPrice: number
      quantity: number
      total: number
    }>
  }
  createdAt: string
  updatedAt?: string
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation above
- Review the environment setup instructions

---

**Note**: This is a demo application. In production, you would need to:
- Implement proper file storage (Vercel Blob, AWS S3, etc.)
- Add real PDF text extraction
- Implement proper AI integration
- Add authentication and authorization
- Add comprehensive error handling and logging
