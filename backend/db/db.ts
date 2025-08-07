import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Enhanced Prisma client with connection pooling and performance optimizations
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Connection test function
export async function testDatabaseConnection(): Promise<{ success: boolean; error?: string; timing?: number }> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const timing = Date.now() - start;
    return { success: true, timing };
  } catch (error: any) {
    console.error('Database connection test failed:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown database error',
    };
  }
}

// Database introspection for debugging
export async function getDatabaseInfo() {
  try {
    const tables = await prisma.$queryRaw`
      SELECT schemaname, tablename, tableowner 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    
    const tableCount = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_rows,
        n_dead_tup as dead_rows
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    return { tables, tableCount };
  } catch (error: any) {
    console.error('Database introspection failed:', error);
    return { error: error.message };
  }
}

// Performance monitoring middleware
export function withTiming<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operation: string
) {
  return async (...args: T): Promise<R> => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      const timing = Date.now() - start;
      console.log(`[DB] ${operation} completed in ${timing}ms`);
      return result;
    } catch (error) {
      const timing = Date.now() - start;
      console.error(`[DB] ${operation} failed after ${timing}ms:`, error);
      throw error;
    }
  };
}
