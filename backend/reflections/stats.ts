import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { StudyStatsResponse, Reflection } from "./types";

// Retrieves study statistics for the current user with optimized query.
export const getStats = api<void, StudyStatsResponse>(
  { auth: true, expose: true, method: "GET", path: "/reflections/stats" },
  async () => {
    const auth = getAuthData()!;
    
    const reflections = await db.queryAll<Reflection>`
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

    for (const reflection of reflections) {
      const timeData = reflection.studyTimeBySubject as Record<string, number>;
      for (const [subject, time] of Object.entries(timeData)) {
        totalStudyTime += time;
        studyTimeBySubject[subject] = (studyTimeBySubject[subject] || 0) + time;
      }
      
      if (reflection.mood) {
        totalMood += reflection.mood;
        moodCount++;
      }
    }

    // Calculate study streak (consecutive days with study time)
    let studyStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < reflections.length; i++) {
      const reflectionDate = new Date(reflections[i].date);
      reflectionDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (reflectionDate.getTime() === expectedDate.getTime()) {
        const timeData = reflections[i].studyTimeBySubject as Record<string, number>;
        const dailyTotal = Object.values(timeData).reduce((sum, time) => sum + time, 0);
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
