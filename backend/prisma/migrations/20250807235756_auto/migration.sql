-- CreateIndex
CREATE INDEX "ai_insights_userId_insightType_idx" ON "ai_insights"("userId", "insightType");

-- CreateIndex
CREATE INDEX "ai_insights_userId_createdAt_idx" ON "ai_insights"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "colleges_acceptanceRate_idx" ON "colleges"("acceptanceRate");

-- CreateIndex
CREATE INDEX "events_userId_date_idx" ON "events"("userId", "date");

-- CreateIndex
CREATE INDEX "materials_userId_createdAt_idx" ON "materials"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "notes_userId_updatedAt_idx" ON "notes"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "reflections_userId_date_idx" ON "reflections"("userId", "date");

-- CreateIndex
CREATE INDEX "study_streaks_userId_date_idx" ON "study_streaks"("userId", "date");

-- CreateIndex
CREATE INDEX "tasks_userId_status_idx" ON "tasks"("userId", "status");

-- CreateIndex
CREATE INDEX "tasks_userId_dueDate_idx" ON "tasks"("userId", "dueDate");

-- CreateIndex
CREATE INDEX "timer_sessions_userId_createdAt_idx" ON "timer_sessions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "timer_sessions_userId_completed_idx" ON "timer_sessions"("userId", "completed");

-- AddForeignKey
ALTER TABLE "colleges" ADD CONSTRAINT "colleges_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
