import { api, APIError } from "encore.dev/api";
import { collegesDB } from "./db";
import { AdmissionChanceRequest, AdmissionChanceResponse } from "./types";

// Calculates admission chance for a college based on student stats.
export const calculateAdmissionChance = api<AdmissionChanceRequest, AdmissionChanceResponse>(
  { expose: true, method: "POST", path: "/colleges/admission-chance" },
  async (req) => {
    // Get college data
    const college = await collegesDB.queryRow<{
      id: number;
      name: string;
      acceptance_rate: number | null;
      avg_gpa: number | null;
      avg_sat: number | null;
      avg_act: number | null;
    }>`
      SELECT id, name, acceptance_rate, avg_gpa, avg_sat, avg_act
      FROM colleges 
      WHERE id = ${req.collegeId}
    `;

    if (!college) {
      throw APIError.notFound("College not found");
    }

    // Simple admission chance calculation algorithm
    let baseChance = college.acceptance_rate || 50; // Default to 50% if no data
    let adjustments = 0;
    const recommendations: string[] = [];

    // GPA comparison
    if (college.avg_gpa) {
      const gpaDiff = req.gpa - college.avg_gpa;
      if (gpaDiff > 0.5) {
        adjustments += 20;
      } else if (gpaDiff > 0.2) {
        adjustments += 10;
      } else if (gpaDiff < -0.5) {
        adjustments -= 20;
        recommendations.push("Consider improving your GPA through additional coursework or retaking classes");
      } else if (gpaDiff < -0.2) {
        adjustments -= 10;
        recommendations.push("Your GPA is slightly below average - focus on strong essays and extracurriculars");
      }
    }

    // SAT comparison
    if (req.sat && college.avg_sat) {
      const satDiff = req.sat - college.avg_sat;
      if (satDiff > 100) {
        adjustments += 15;
      } else if (satDiff > 50) {
        adjustments += 8;
      } else if (satDiff < -100) {
        adjustments -= 15;
        recommendations.push("Consider retaking the SAT to improve your score");
      } else if (satDiff < -50) {
        adjustments -= 8;
        recommendations.push("Your SAT score is below average - consider test prep or retaking");
      }
    }

    // ACT comparison
    if (req.act && college.avg_act) {
      const actDiff = req.act - college.avg_act;
      if (actDiff > 3) {
        adjustments += 15;
      } else if (actDiff > 1) {
        adjustments += 8;
      } else if (actDiff < -3) {
        adjustments -= 15;
        recommendations.push("Consider retaking the ACT to improve your score");
      } else if (actDiff < -1) {
        adjustments -= 8;
        recommendations.push("Your ACT score is below average - consider test prep or retaking");
      }
    }

    // Extracurriculars boost
    if (req.extracurriculars) {
      if (req.extracurriculars >= 8) {
        adjustments += 10;
      } else if (req.extracurriculars >= 6) {
        adjustments += 5;
      } else if (req.extracurriculars < 4) {
        adjustments -= 5;
        recommendations.push("Strengthen your extracurricular activities and leadership experience");
      }
    }

    // Essays boost
    if (req.essays) {
      if (req.essays >= 8) {
        adjustments += 8;
      } else if (req.essays >= 6) {
        adjustments += 4;
      } else if (req.essays < 4) {
        adjustments -= 4;
        recommendations.push("Spend more time crafting compelling personal essays");
      }
    }

    // Calculate final chance
    let finalChance = Math.max(0, Math.min(100, baseChance + adjustments));

    // Add general recommendations based on chance
    if (finalChance < 30) {
      recommendations.push("This is a reach school - consider applying to more safety schools");
      recommendations.push("Focus on demonstrating unique qualities that set you apart");
    } else if (finalChance > 70) {
      recommendations.push("You have a strong chance - make sure to submit a compelling application");
    }

    if (recommendations.length === 0) {
      recommendations.push("You're a competitive candidate - focus on presenting your best self in your application");
    }

    return {
      chance: Math.round(finalChance),
      recommendations,
    };
  }
);
