import { Subscription } from "encore.dev/pubsub";
import { exportTopic, ExportJob } from "./data";
import { db } from "../db/db";
import { Bucket } from "encore.dev/storage/objects";

const exportBucket = new Bucket("data-exports");

async function exportFullData(userId: string) {
  const [tasks, events, notes, materials, reflections] = await Promise.all([
    db.queryAll`SELECT * FROM tasks WHERE user_id = ${userId}`,
    db.queryAll`SELECT * FROM events WHERE user_id = ${userId}`,
    db.queryAll`SELECT * FROM notes WHERE user_id = ${userId}`,
    db.queryAll`SELECT * FROM materials WHERE user_id = ${userId}`,
    db.queryAll`SELECT * FROM reflections WHERE user_id = ${userId}`,
  ]);

  return {
    exportDate: new Date().toISOString(),
    userId,
    data: { tasks, events, notes, materials, reflections }
  };
}

function convertToCSV(data: any[], headers: string[]): string {
  const rows = data.map((row: any) => 
    headers.map(header => JSON.stringify(row[header] || "")).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

new Subscription(exportTopic, "process-export-job", {
  handler: async (job: ExportJob) => {
    try {
      await db.exec`UPDATE data_exports SET status = 'PROCESSING' WHERE id = ${job.exportId}`;

      let data: any;
      let csvHeaders: string[] = [];

      switch (job.type) {
        case "full":
          data = await exportFullData(job.userId);
          break;
        case "tasks":
          data = await db.queryAll`SELECT * FROM tasks WHERE user_id = ${job.userId}`;
          csvHeaders = ["id", "title", "description", "subject", "priority", "status", "due_date", "created_at"];
          break;
        case "notes":
          data = await db.queryAll`SELECT * FROM notes WHERE user_id = ${job.userId}`;
          csvHeaders = ["id", "title", "content", "tags", "color", "created_at"];
          break;
        case "materials":
          data = await db.queryAll`SELECT * FROM materials WHERE user_id = ${job.userId}`;
          csvHeaders = ["id", "title", "type", "file_url", "subject", "created_at"];
          break;
        case "reflections":
          data = await db.queryAll`SELECT * FROM reflections WHERE user_id = ${job.userId}`;
          csvHeaders = ["id", "date", "study_time_by_subject", "mood", "notes", "created_at"];
          break;
      }

      let fileContent: string;
      const fileName = `${job.type}-export-${Date.now()}.${job.format}`;
      
      if (job.format === "json") {
        fileContent = JSON.stringify(data, null, 2);
      } else {
        fileContent = convertToCSV(Array.isArray(data) ? data : [data], csvHeaders);
      }

      const fileBuffer = Buffer.from(fileContent, 'utf-8');
      await exportBucket.upload(fileName, fileBuffer, { contentType: `application/${job.format}` });
      const { url: fileUrl } = await exportBucket.signedDownloadUrl(fileName, { ttl: 7 * 24 * 3600 });

      await db.exec`
        UPDATE data_exports
        SET status = 'COMPLETED', file_name = ${fileName}, file_url = ${fileUrl}
        WHERE id = ${job.exportId}
      `;

    } catch (error) {
      console.error("Export processing failed:", error);
      await db.exec`UPDATE data_exports SET status = 'FAILED' WHERE id = ${job.exportId}`;
    }
  }
});
