import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { db } from "../db/db";
import { Topic } from "encore.dev/pubsub";

export type DataExportType = "full" | "tasks" | "notes" | "materials" | "reflections";

export interface ExportJob {
  exportId: number;
  userId: string;
  type: DataExportType;
  format: "json" | "csv";
}

export const exportTopic = new Topic<ExportJob>("export-jobs", { deliveryGuarantee: "at-least-once" });

interface CreateExportRequest {
  type: DataExportType;
  format: "json" | "csv";
}

interface ExportData {
  id: number;
  type: DataExportType;
  status: string;
  fileName?: string;
  downloadUrl?: string;
  createdAt: Date;
}

interface CreateExportResponse {
  export: ExportData;
}

interface ListExportsResponse {
  exports: ExportData[];
}

// Creates a new data export request.
export const createExport = api<CreateExportRequest, CreateExportResponse>(
  { auth: true, expose: true, method: "POST", path: "/export/create" },
  async (req) => {
    const auth = getAuthData()!;
    
    const exportRecord = await db.queryRow<ExportData>`
      INSERT INTO data_exports (user_id, type, status)
      VALUES (${auth.userID}, ${req.type.toUpperCase()}, 'PENDING')
      RETURNING *
    `;

    if (!exportRecord) {
      throw APIError.internal("Failed to create export record");
    }

    // Publish job to be processed asynchronously
    await exportTopic.publish({
      exportId: exportRecord.id,
      userId: auth.userID,
      type: req.type,
      format: req.format,
    });

    return {
      export: {
        ...exportRecord,
        type: exportRecord.type.toLowerCase() as DataExportType,
        status: exportRecord.status.toLowerCase(),
      }
    };
  }
);

// Lists all exports for the current user.
export const listExports = api<void, ListExportsResponse>(
  { auth: true, expose: true, method: "GET", path: "/export/list" },
  async () => {
    const auth = getAuthData()!;
    
    const exports = await db.queryAll<ExportData>`
      SELECT id, type, status, file_name, file_url, created_at
      FROM data_exports
      WHERE user_id = ${auth.userID}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return {
      exports: exports.map(exp => ({
        ...exp,
        type: exp.type.toLowerCase() as DataExportType,
        status: exp.status.toLowerCase(),
      }))
    };
  }
);
