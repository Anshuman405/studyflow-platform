import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { secret } from "encore.dev/config";
import { TimerSession } from "./session";

const geminiApiKey = secret("GeminiApiKey");

interface EstimateTimeRequest {
  taskTitle: string;
  taskDescription?: string;
  subject?: string;
  complexity?: "low" | "medium" | "high";
}

interface EstimateTimeResponse {
  estimatedMinutes: number;
  breakdown: string[];
  tips: string[];
}

// Estimates task completion time using AI.
export const estimateTime = api<EstimateTimeRequest, EstimateTimeResponse>(
  { auth: true, expose: true, method: "POST", path: "/timer/estimate" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Get user's historical timer data for better estimates
    const historicalSessions = await db.queryAll<TimerSession & { task_title?: string; task_subject?: string }>`
      SELECT ts.*, t.title as task_title, t.subject as task_subject
      FROM timer_sessions ts
      LEFT JOIN tasks t ON ts.task_id = t.id
      WHERE ts.user_id = ${auth.userID}
        AND ts.completed = true
        AND ts.actual_time IS NOT NULL
      ORDER BY ts.created_at DESC
      LIMIT 10
    `;

    const prompt = `
      Estimate completion time for this task:
      Title: ${req.taskTitle}
      Description: ${req.taskDescription || "No description"}
      Subject: ${req.subject || "General"}
      Complexity: ${req.complexity || "medium"}
      
      Historical data: ${JSON.stringify(historicalSessions.map(s => ({
        taskTitle: s.task_title,
        subject: s.task_subject,
        estimatedTime: s.estimatedTime,
        actualTime: s.actualTime,
      })))}
      
      Provide a JSON response with:
      - estimatedMinutes (number)
      - breakdown (array of time breakdown steps)
      - tips (array of productivity tips)
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      let aiResponse;
      try {
        aiResponse = JSON.parse(generatedText);
      } catch {
        // Fallback estimation based on complexity
        const baseTime = req.complexity === "high" ? 120 : req.complexity === "low" ? 30 : 60;
        aiResponse = {
          estimatedMinutes: baseTime,
          breakdown: [`Estimated ${baseTime} minutes based on task complexity`],
          tips: ["Break the task into smaller chunks", "Take breaks every 25 minutes"]
        };
      }

      return {
        estimatedMinutes: aiResponse.estimatedMinutes || 60,
        breakdown: aiResponse.breakdown || [],
        tips: aiResponse.tips || [],
      };
    } catch (error) {
      console.error("Time estimation failed:", error);
      
      // Fallback estimation
      const baseTime = req.complexity === "high" ? 120 : req.complexity === "low" ? 30 : 60;
      return {
        estimatedMinutes: baseTime,
        breakdown: [`Estimated ${baseTime} minutes based on task complexity`],
        tips: ["Break the task into smaller chunks", "Take breaks every 25 minutes"],
      };
    }
  }
);
