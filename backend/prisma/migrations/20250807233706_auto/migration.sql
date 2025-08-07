-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('EXAM', 'STUDY_SESSION', 'ASSIGNMENT', 'LAB', 'OTHER');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('PDF', 'DOC', 'NOTE', 'LINK', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT,
    "startDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "category" "EventCategory" NOT NULL DEFAULT 'OTHER',
    "location" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notes" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "color" TEXT NOT NULL DEFAULT '#ffffff',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" "MaterialType" NOT NULL,
    "fileUrl" TEXT,
    "subject" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reflections" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "studyTimeBySubject" JSONB NOT NULL DEFAULT '{}',
    "mood" SMALLINT,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reflections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_streaks" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "study_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colleges" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "acceptanceRate" DOUBLE PRECISION,
    "avgGpa" DOUBLE PRECISION,
    "avgSat" INTEGER,
    "avgAct" INTEGER,
    "details" JSONB NOT NULL DEFAULT '{}',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colleges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_insights" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT,
    "recommendations" JSONB NOT NULL,
    "insightType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timer_sessions" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER,
    "estimatedTime" INTEGER NOT NULL,
    "actualTime" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timer_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "tasks_userId_idx" ON "tasks"("userId");

-- CreateIndex
CREATE INDEX "tasks_dueDate_idx" ON "tasks"("dueDate");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "events_userId_idx" ON "events"("userId");

-- CreateIndex
CREATE INDEX "events_date_idx" ON "events"("date");

-- CreateIndex
CREATE INDEX "events_category_idx" ON "events"("category");

-- CreateIndex
CREATE INDEX "notes_userId_idx" ON "notes"("userId");

-- CreateIndex
CREATE INDEX "notes_tags_idx" ON "notes"("tags");

-- CreateIndex
CREATE INDEX "notes_title_idx" ON "notes"("title");

-- CreateIndex
CREATE INDEX "materials_userId_idx" ON "materials"("userId");

-- CreateIndex
CREATE INDEX "materials_subject_idx" ON "materials"("subject");

-- CreateIndex
CREATE INDEX "materials_type_idx" ON "materials"("type");

-- CreateIndex
CREATE INDEX "reflections_userId_idx" ON "reflections"("userId");

-- CreateIndex
CREATE INDEX "reflections_date_idx" ON "reflections"("date");

-- CreateIndex
CREATE UNIQUE INDEX "reflections_date_userId_key" ON "reflections"("date", "userId");

-- CreateIndex
CREATE INDEX "study_streaks_userId_idx" ON "study_streaks"("userId");

-- CreateIndex
CREATE INDEX "study_streaks_date_idx" ON "study_streaks"("date");

-- CreateIndex
CREATE UNIQUE INDEX "study_streaks_date_userId_key" ON "study_streaks"("date", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "colleges_name_key" ON "colleges"("name");

-- CreateIndex
CREATE INDEX "colleges_name_idx" ON "colleges"("name");

-- CreateIndex
CREATE INDEX "colleges_createdBy_idx" ON "colleges"("createdBy");

-- CreateIndex
CREATE INDEX "ai_insights_userId_idx" ON "ai_insights"("userId");

-- CreateIndex
CREATE INDEX "ai_insights_insightType_idx" ON "ai_insights"("insightType");

-- CreateIndex
CREATE INDEX "ai_insights_createdAt_idx" ON "ai_insights"("createdAt");

-- CreateIndex
CREATE INDEX "timer_sessions_userId_idx" ON "timer_sessions"("userId");

-- CreateIndex
CREATE INDEX "timer_sessions_taskId_idx" ON "timer_sessions"("taskId");

-- CreateIndex
CREATE INDEX "timer_sessions_createdAt_idx" ON "timer_sessions"("createdAt");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reflections" ADD CONSTRAINT "reflections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_streaks" ADD CONSTRAINT "study_streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timer_sessions" ADD CONSTRAINT "timer_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timer_sessions" ADD CONSTRAINT "timer_sessions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
