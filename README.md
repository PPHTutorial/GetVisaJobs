# 🚀 Fakomame - Community-Driven Package Delivery Platform

> **Connecting senders with travelers for fast, reliable, and cost-effective package delivery worldwide**

Fakomame is a revolutionary package delivery platform that leverages the power of community by connecting people who need to send packages with travelers heading in the same direction. This creates a win-win scenario where senders get affordable delivery options and travelers can earn money while helping their community.

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based Authentication** with secure token management
- **User Registration & Login** with email/phone verification
- **Google OAuth Integration** for seamless social login
- **Email Verification System** with 6-digit codes
- **Password Reset** with secure token-based recovery
- **Professional Email Templates** for user communication
- **SMTP Integration** with customizable email service
- **Password Security** with bcrypt hashing and strength validation
- **Rate Limiting** to prevent brute force attacks
- **Role-based Access Control** (Sender, Traveler, Both, Admin)
- **Two-Factor Authentication** ready infrastructure

### 📦 Package Management
- **Package Creation** with detailed descriptions and categorization
- **Real-time Package Tracking** with status updates
- **Search & Filter** packages by location, category, and price
- **Package Verification** with photo uploads and documentation
- **Delivery Confirmation** with signature requirements

### ✈️ Trip Management
- **Trip Posting** for travelers with route information
- **Capacity Management** with weight and size limitations
- **Route Optimization** for efficient package pickup/delivery
- **Travel Schedule** with flexible pickup/delivery windows

### 💬 Communication System
- **Real-time Chat** between senders and travelers
- **Push Notifications** for important updates
- **Message History** with attachment support
- **Automated Status Updates** throughout delivery process

### 💰 Payment Integration
- **Secure Payment Processing** with Stripe integration
- **Digital Wallet** for users to manage funds
- **Automatic Payouts** to travelers upon delivery
- **Transaction History** with detailed records

### 👨‍💼 Admin Dashboard
- **User Management** with verification controls
- **Platform Analytics** and reporting
- **Dispute Resolution** system
- **Content Moderation** tools

## 🏗️ Technical Architecture

### Frontend
- **Next.js 15** with App Router for modern React development
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS 4** for utility-first styling
- **TanStack Query** for efficient data fetching and caching
- **React Hot Toast** for user notifications
- **Heroicons & Lucide** for consistent iconography

### Backend
- **Next.js API Routes** for serverless backend functionality
- **Prisma ORM** with PostgreSQL for robust data management
- **JWT Authentication** with secure cookie management
- **RESTful API Design** with proper error handling
- **Input Validation** using Zod schemas

### Database
- **PostgreSQL** as the primary database
- **Prisma Schema** with comprehensive relational modeling
- **Database Migrations** for version control
- **Optimized Queries** with proper indexing

### Security
- **HTTP-only Cookies** for token storage
- **CORS Configuration** for API security
- **Input Sanitization** and validation
- **Rate Limiting** on sensitive endpoints
- **Environment Variable** management

## 📁 Project Structure

```
fakomame/
├── app/                      # Next.js App Router pages
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── packages/       # Package management
│   │   └── trips/          # Trip management
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # User dashboard
│   └── packages/           # Package-related pages
├── components/              # Reusable React components
│   ├── auth/               # Authentication components
│   ├── packages/           # Package components
│   ├── providers/          # Context providers
│   └── ui/                 # UI components
├── lib/                    # Utility libraries
│   ├── api/                # API client functions
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript definitions
├── prisma/                 # Database schema and migrations
└── public/                 # Static assets
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### 1. Clone & Install
```bash
git clone <repository-url>
cd fakomame
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

Required environment variables:
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sendmame"

# NextAuth
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# SMTP Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
EMAIL_FROM="your_email@gmail.com"

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

#### Setting Up Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

#### Setting Up SMTP (Gmail Example):
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: Account → Security → App passwords
3. Use the generated password as `SMTP_PASS`

### 3. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🚀 Current Implementation Status

### ✅ Completed Features
- **Database Schema**: Complete Prisma schema with all entities
- **Authentication System**: 
  - JWT-based auth with registration/login
  - Google OAuth integration
  - Email verification with 6-digit codes
  - Password reset with secure tokens
  - Professional HTML email templates
  - SMTP email service integration
  - Rate limiting and security measures
- **API Infrastructure**: RESTful endpoints for core functionality
- **UI Components**: Reusable component library with Tailwind CSS
- **Type Safety**: Comprehensive TypeScript definitions
- **Package API**: CRUD operations for package management
- **Trip API**: CRUD operations for trip management
- **User Dashboard**: Interactive dashboard with statistics
- **Responsive Design**: Mobile-first responsive layouts
- **Email System**: Professional email templates with nodemailer integration

### 🚧 In Development
- Real-time chat system implementation
- Payment processing with Stripe
- File upload functionality
- Advanced search and filtering
- Push notification system

### 📋 Next Steps
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Implement real-time features with Socket.IO
5. Add payment processing
6. Build mobile app with React Native

---

**Made with ❤️ by the Fakomame Team**

*Connecting communities, one package at a time.*
