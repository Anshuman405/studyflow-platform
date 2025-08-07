import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { secret } from "encore.dev/config";

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
    const historicalSessions = await prisma.timerSession.findMany({
      where: {
        userId: auth.userID,
        completed: true,
        actualTime: { not: null },
      },
      include: {
        task: {
          select: {
            title: true,
            subject: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const prompt = `
      Estimate completion time for this task:
      Title: ${req.taskTitle}
      Description: ${req.taskDescription || "No description"}
      Subject: ${req.subject || "General"}
      Complexity: ${req.complexity || "medium"}
      
      Historical data: ${JSON.stringify(historicalSessions.map(s => ({
        taskTitle: s.task?.title,
        subject: s.task?.subject,
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
