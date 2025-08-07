import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { reflectionsDB } from "./db";
import { StudyStatsResponse } from "./types";

// Retrieves study statistics for the current user.
export const getStats = api<void, StudyStatsResponse>(
  { auth: true, expose: true, method: "GET", path: "/reflections/stats" },
  async () => {
    const auth = getAuthData()!;
    
    // Get all reflections for stats calculation
    const rows = await reflectionsDB.queryAll<{
      date: Date;
      study_time_by_subject: Record<string, number>;
      mood: number | null;
    }>`
      SELECT date, study_time_by_subject, mood 
      FROM reflections 
      WHERE user_id = ${auth.userID}
      ORDER BY date DESC
    `;

    // Calculate total study time and by subject
    let totalStudyTime = 0;
    const studyTimeBySubject: Record<string, number> = {};
    let totalMood = 0;
    let moodCount = 0;

    for (const row of rows) {
      for (const [subject, time] of Object.entries(row.study_time_by_subject)) {
        totalStudyTime += time;
        studyTimeBySubject[subject] = (studyTimeBySubject[subject] || 0) + time;
      }
      
      if (row.mood) {
        totalMood += row.mood;
        moodCount++;
      }
    }

    // Calculate study streak (consecutive days with study time)
    let studyStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < rows.length; i++) {
      const reflectionDate = new Date(rows[i].date);
      reflectionDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (reflectionDate.getTime() === expectedDate.getTime()) {
        const dailyTotal = Object.values(rows[i].study_time_by_subject).reduce((sum, time) => sum + time, 0);
        if (dailyTotal > 0) {
          studyStreak++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return {
      totalStudyTime,
      studyTimeBySubject,
      averageMood: moodCount > 0 ? totalMood / moodCount : undefined,
      studyStreak,
    };
  }
);
