# StudyFlow - AI-Powered Academic Management System

A comprehensive academic management platform built with Encore.ts, Prisma, and React, featuring AI-powered insights, collaborative study groups, file uploads, and performance optimization.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL (Neon DB)
- Clerk account for authentication
- Google Gemini API key

### Environment Setup

1. **Database Configuration**
   ```bash
   # Copy the environment template
   cp backend/.env.example backend/.env
   
   # Set your DATABASE_URL (already configured for Neon)
   DATABASE_URL="postgresql://neondb_owner:npg_ZIYk7C9JDduO@ep-blue-pond-afadr79r-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Database Setup**
   ```bash
   # Run automated migration script
   node scripts/migrate-db.js
   
   # Verify database connection
   node scripts/verify-db.js
   
   # Seed sample data (optional)
   node scripts/seed-colleges.js
   ```

4. **Configure Secrets**
   - Set up Clerk authentication keys
   - Add Google Gemini API key
   - Configure in Leap.new Infrastructure tab

### Development

```bash
# Start the development server
encore run

# In another terminal, start the frontend
cd frontend && npm run dev
```

## 🏗️ Architecture

### Backend (Encore.ts)
- **Database**: Prisma ORM with PostgreSQL (Neon)
- **Authentication**: Clerk integration with retry logic
- **AI Integration**: Google Gemini for insights
- **File Storage**: Encore.ts Object Storage with signed URLs
- **Performance**: Optimized queries, caching, pagination, retry logic

### Frontend (React + TypeScript)
- **UI Framework**: ShadCN/UI components
- **State Management**: TanStack Query with optimized caching
- **Styling**: Tailwind CSS v4
- **Performance**: Code splitting, lazy loading, optimized queries
- **Error Handling**: Comprehensive error boundaries and retry logic

## 📊 Database Schema

### Core Models
- **Users**: Authentication and profile data
- **Tasks**: Academic assignments with priority and status
- **Events**: Calendar events and deadlines  
- **Notes**: Rich text notes with tags and colors
- **Materials**: Study resources with file upload support
- **Reflections**: Daily study tracking and mood
- **Colleges**: Institution data for admission calculator
- **AI Insights**: Generated recommendations and analysis
- **Timer Sessions**: Pomodoro timer tracking

### New Features
- **Notifications**: Push notifications for deadlines and reminders
- **Study Groups**: Collaborative learning with join codes
- **Group Tasks & Notes**: Shared content within study groups
- **Data Export**: Full data backup and export functionality
- **File Upload**: Secure file storage with signed URLs

### Performance Optimizations
- Composite indexes on frequently queried fields
- Pagination for large datasets
- Query optimization with selective field loading
- Connection pooling via Neon
- Retry logic for failed database operations
- Comprehensive error handling

## 🔧 API Endpoints

### Health & Diagnostics
- `GET /db/health` - Database connectivity test with retry logic
- `GET /db/info` - Table statistics and schema info

### Core Resources
- `GET /tasks` - List tasks (paginated, filtered)
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

Similar CRUD patterns for events, notes, materials, reflections.

### New Features
- `GET /notifications` - List user notifications
- `POST /notifications` - Create notification
- `PUT /notifications/:id/read` - Mark as read
- `POST /upload/generate-url` - Generate signed upload URL
- `POST /upload/download-url` - Generate signed download URL
- `GET /groups` - List study groups
- `POST /groups` - Create study group
- `POST /groups/join` - Join group with code
- `POST /export/create` - Create data export
- `GET /export/list` - List user exports

### AI Features
- `POST /ai/insights` - Generate AI recommendations
- `POST /timer/estimate` - AI time estimation
- `POST /colleges/admission-chance` - Calculate admission probability

### Search & Discovery
- `GET /colleges/search` - Search colleges with autocomplete
- `GET /notes?search=query` - Full-text note search

## 🎯 Performance Features

### Backend Optimizations
- **Query Performance**: Indexed searches, selective loading
- **Caching**: 1-hour cache for AI insights, 5-minute cache for searches
- **Pagination**: Cursor-based pagination for large datasets
- **Connection Pooling**: Optimized Neon connection management
- **Timing Logs**: Performance monitoring for all DB operations
- **Retry Logic**: Automatic retry for failed network/database requests
- **Error Handling**: Comprehensive error handling with graceful degradation

### Frontend Optimizations
- **Code Splitting**: Dynamic imports for heavy components
- **Query Optimization**: Stale-while-revalidate caching with TanStack Query
- **Loading States**: Skeleton screens and progressive loading
- **Error Boundaries**: Graceful error handling with retry options
- **Responsive Design**: Mobile-first approach
- **Optimistic Updates**: Immediate UI feedback with rollback on failure

## 🆕 New Features

### File Upload System
- **Secure Storage**: Files stored in Encore.ts Object Storage
- **Signed URLs**: Temporary upload/download URLs for security
- **File