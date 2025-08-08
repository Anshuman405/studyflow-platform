import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { prisma, withTiming } from "../db/db";

export type DataExportType = "full" | "tasks" | "notes" | "materials" | "reflections";

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
  withTiming(async (req) => {
    const auth = getAuthData()!;
    
    const exportRecord = await prisma.dataExport.create({
      data: {
        userId: auth.userID,
        type: req.type.toUpperCase() as any,
        status: 'PENDING',
      },
    });

    // Start export processing asynchronously
    processExport(exportRecord.id, auth.userID, req.type, req.format);

    return {
      export: {
        id: exportRecord.id,
        type: req.type,
        status: exportRecord.status.toLowerCase(),
        createdAt: exportRecord.createdAt,
      }
    };
  }, "create_export")
);

// Lists all exports for the current user.
export const listExports = api<void, ListExportsResponse>(
  { auth: true, expose: true, method: "GET", path: "/export/list" },
  withTiming(async () => {
    const auth = getAuthData()!;
    
    const exports = await prisma.dataExport.findMany({
      where: {
        userId: auth.userID,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return {
      exports: exports.map(exp => ({
        id: exp.id,
        type: exp.type.toLowerCase() as DataExportType,
        status: exp.status.toLowerCase(),
        fileName: exp.fileName || undefined,
        downloadUrl: exp.fileUrl || undefined,
        createdAt: exp.createdAt,
      }))
    };
  }, "list_exports")
);

// Process export asynchronously
async function processExport(exportId: number, userId: string, type: DataExportType, format: "json" | "csv") {
  try {
    // Update status to processing
    await prisma.dataExport.update({
      where: { id: exportId },
      data: { status: 'PROCESSING' },
    });

    let data: any = {};
    
    // Fetch data based on type
    switch (type) {
      case "full":
        data = await exportFullData(userId);
        break;
      case "tasks":
        data = await exportTasks(userId);
        break;
      case "notes":
        data = await exportNotes(userId);
        break;
      case "materials":
        data = await exportMaterials(userId);
        break;
      case "reflections":
        data = await exportReflections(userId);
        break;
    }

    // Generate file content
    let fileContent: string;
    let fileName: string;
    
    if (format === "json") {
      fileContent = JSON.stringify(data, null, 2);
      fileName = `${type}-export-${Date.now()}.json`;
    } else {
      fileContent = convertToCSV(data, type);
      fileName = `${type}-export-${Date.now()}.csv`;
    }

    // In a real implementation, you would upload this to object storage
    // For now, we'll just store a placeholder URL
    const fileUrl = `https://example.com/exports/${fileName}`;

    // Update export record
    await prisma.dataExport.update({
      where: { id: exportId },
      data: {
        status: 'COMPLETED',
        fileName,
        fileUrl,
      },
    });

  } catch (error) {
    console.error("Export processing failed:", error);
    await prisma.dataExport.update({
      where: { id: exportId },
      data: { status: 'FAILED' },
    });
  }
}

async function exportFullData(userId: string) {
  const [tasks, events, notes, materials, reflections] = await Promise.all([
    prisma.task.findMany({ where: { userId } }),
    prisma.event.findMany({ where: { userId } }),
    prisma.note.findMany({ where: { userId } }),
    prisma.material.findMany({ where: { userId } }),
    prisma.reflection.findMany({ where: { userId } }),
  ]);

  return {
    exportDate: new Date().toISOString(),
    userId,
    data: {
      tasks,
      events,
      notes,
      materials,
      reflections,
    }
  };
}

async function exportTasks(userId: string) {
  const tasks = await prisma.task.findMany({ where: { userId } });
  return { exportDate: new Date().toISOString(), userId, tasks };
}

async function exportNotes(userId: string) {
  const notes = await prisma.note.findMany({ where: { userId } });
  return { exportDate: new Date().toISOString(), userId, notes };
}

async function exportMaterials(userId: string) {
  const materials = await prisma.material.findMany({ where: { userId } });
  return { exportDate: new Date().toISOString(), userId, materials };
}

async function exportReflections(userId: string) {
  const reflections = await prisma.reflection.findMany({ where: { userId } });
  return { exportDate: new Date().toISOString(), userId, reflections };
}

function convertToCSV(data: any, type: string): string {
  // Simple CSV conversion - in a real implementation, you'd want more robust CSV handling
  if (type === "tasks" && data.tasks) {
    const headers = ["id", "title", "description", "subject", "priority", "status", "dueDate", "createdAt"];
    const rows = data.tasks.map((task: any) => 
      headers.map(header => task[header] || "").join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  }
  
  // Fallback to JSON for complex data
  return JSON.stringify(data, null, 2);
}
