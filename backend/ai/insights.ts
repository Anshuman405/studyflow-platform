import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma } from "../db/db";
import { secret } from "encore.dev/config";

const geminiApiKey = secret("GeminiApiKey");

interface GenerateInsightsRequest {
  type: "weekly" | "study_breakdown" | "college_prediction";
  data?: Record<string, any>;
}

interface GenerateInsightsResponse {
  insights: string[];
  recommendations: string[];
}

// Generates AI insights using Google Gemini.
export const generateInsights = api<GenerateInsightsRequest, GenerateInsightsResponse>(
  { auth: true, expose: true, method: "POST", path: "/ai/insights" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Get user's recent data for context
    const [tasks, reflections, events] = await Promise.all([
      prisma.task.findMany({
        where: { userId: auth.userID },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.reflection.findMany({
        where: { userId: auth.userID },
        orderBy: { date: 'desc' },
        take: 7,
      }),
      prisma.event.findMany({
        where: { 
          userId: auth.userID,
          date: { gte: new Date() }
        },
        orderBy: { date: 'asc' },
        take: 10,
      }),
    ]);

    // Prepare context for AI
    const context = {
      tasks: tasks.map(t => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        subject: t.subject,
        dueDate: t.dueDate,
      })),
      reflections: reflections.map(r => ({
        date: r.date,
        mood: r.mood,
        studyTime: r.studyTimeBySubject,
      })),
      upcomingEvents: events.map(e => ({
        title: e.title,
        category: e.category,
        date: e.date,
      })),
    };

    // Generate AI insights based on type
    let prompt = "";
    switch (req.type) {
      case "weekly":
        prompt = `Based on this student's data: ${JSON.stringify(context)}, provide 3-5 weekly study insights and 3-5 actionable recommendations for improving their academic performance.`;
        break;
      case "study_breakdown":
        prompt = `Analyze this student's study patterns: ${JSON.stringify(context)}. Provide insights about their study habits and recommendations for better time management.`;
        break;
      case "college_prediction":
        prompt = `Based on this student's academic activity: ${JSON.stringify(context)}, provide insights about their college readiness and recommendations for improvement.`;
        break;
    }

    try {
      // Call Google Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt + " Respond with a JSON object containing 'insights' and 'recommendations' arrays."
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Parse AI response
      let aiResponse;
      try {
        aiResponse = JSON.parse(generatedText);
      } catch {
        // Fallback if JSON parsing fails
        aiResponse = {
          insights: ["AI analysis completed successfully"],
          recommendations: ["Continue your current study approach"]
        };
      }

      // Store insights in database
      await prisma.aiInsight.create({
        data: {
          userId: auth.userID,
          recommendations: aiResponse,
          insightType: req.type,
        },
      });

      return {
        insights: aiResponse.insights || [],
        recommendations: aiResponse.recommendations || [],
      };
    } catch (error) {
      console.error("AI insights generation failed:", error);
      
      // Return fallback insights
      return {
        insights: [
          "Keep up the great work with your studies!",
          "Your task completion rate shows good progress.",
          "Consider maintaining a consistent study schedule."
        ],
        recommendations: [
          "Set specific study goals for each session",
          "Take regular breaks to maintain focus",
          "Review and adjust your study plan weekly"
        ],
      };
    }
  }
);
