import { api } from "encore.dev/api";
import { testDatabaseConnection, getDatabaseInfo } from "./db";

interface HealthResponse {
  database: {
    connected: boolean;
    timing?: number;
    error?: string;
  };
  environment: {
    nodeEnv: string;
    databaseUrl: string;
  };
}

interface DatabaseInfoResponse {
  tables: any[];
  tableStats: any[];
  error?: string;
}

// Health check endpoint for database connectivity
export const health = api<void, HealthResponse>(
  { expose: true, method: "GET", path: "/db/health" },
  async () => {
    const dbTest = await testDatabaseConnection();
    
    return {
      database: {
        connected: dbTest.success,
        timing: dbTest.timing,
        error: dbTest.error,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'unknown',
        databaseUrl: process.env.DATABASE_URL ? 
          process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@') : 'NOT_SET',
      },
    };
  }
);

// Database introspection endpoint for debugging
export const info = api<void, DatabaseInfoResponse>(
  { expose: true, method: "GET", path: "/db/info" },
  async () => {
    const dbInfo = await getDatabaseInfo();
    
    if (dbInfo.error) {
      return {
        tables: [],
        tableStats: [],
        error: dbInfo.error,
      };
    }

    return {
      tables: dbInfo.tables as any[],
      tableStats: dbInfo.tableCount as any[],
    };
  }
);
