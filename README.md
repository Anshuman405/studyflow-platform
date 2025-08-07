# StudyFlow - AI-Powered Academic Management System

A comprehensive academic management platform built with Encore.ts, Prisma, and React, featuring AI-powered insights and performance optimization.

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
   cd backend
   
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev --name init
   
   # Verify database connection
   node ../scripts/verify-db.js
   
   # Seed sample data (optional)
   node ../scripts/seed-colleges.js
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
- **Authentication**: Clerk integration
- **AI Integration**: Google Gemini for insights
- **Performance**: Optimized queries, caching, pagination

### Frontend (React + TypeScript)
- **UI Framework**: ShadCN/UI components
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS v4
- **Performance**: Code splitting, lazy loading, optimized queries

## 📊 Database Schema

### Core Models
- **Users**: Authentication and profile data
- **Tasks**: Academic assignments with priority and status
- **Events**: Calendar events and deadlines  
- **Notes**: Rich text notes with tags and colors
- **Materials**: Study resources and files
- **Reflections**: Daily study tracking and mood
- **Colleges**: Institution data for admission calculator
- **AI Insights**: Generated recommendations and analysis
- **Timer Sessions**: Pomodoro timer tracking

### Performance Optimizations
- Composite indexes on frequently queried fields
- Pagination for large datasets
- Query optimization with selective field loading
- Connection pooling via Neon

## 🔧 API Endpoints

### Health & Diagnostics
- `GET /db/health` - Database connectivity test
- `GET /db/info` - Table statistics and schema info

### Core Resources
- `GET /tasks` - List tasks (paginated, filtered)
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

Similar CRUD patterns for events, notes, materials, reflections.

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

### Frontend Optimizations
- **Code Splitting**: Dynamic imports for heavy components
- **Query Optimization**: Stale-while-revalidate caching
- **Loading States**: Skeleton screens and progressive loading
- **Error Boundaries**: Graceful error handling
- **Responsive Design**: Mobile-first approach

## 🧪 Testing & Verification

### Database Verification
```bash
# Run comprehensive database tests
node scripts/verify-db.js

# Expected output:
# ✅ Database connection successful
# ✅ Found X tables in public schema
# ✅ CRUD operations working
# ⏱️ Total verification time: XXXms
```

### Performance Testing
```bash
# Check API response times
curl -w "@curl-format.txt" http://localhost:4000/db/health

# Monitor database query performance
# Check logs for "[DB] operation_name completed in XXXms"
```

### Feature Testing Checklist

#### ✅ Database & Connectivity
- [x] Neon PostgreSQL connection established
- [x] All tables created and visible in Neon console
- [