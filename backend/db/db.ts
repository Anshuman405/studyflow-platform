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

// Connection test function with retry logic
export async function testDatabaseConnection(retries = 3): Promise<{ success: boolean; error?: string; timing?: number }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1 as test`;
      const timing = Date.now() - start;
      console.log(`[DB] Connection test successful on attempt ${attempt} (${timing}ms)`);
      return { success: true, timing };
    } catch (error: any) {
      console.error(`[DB] Connection test failed on attempt ${attempt}:`, error.message);
      if (attempt === retries) {
        return { 
          success: false, 
          error: error.message || 'Unknown database error',
        };
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  return { success: false, error: 'Max retries exceeded' };
}

// Database introspection for debugging
export async function getDatabaseInfo() {
  try {
    const [tables, tableStats] = await Promise.all([
      prisma.$queryRaw`
        SELECT schemaname, tablename, tableowner 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `,
      prisma.$queryRaw`
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
      `
    ]);

    return { tables, tableStats };
  } catch (error: any) {
    console.error('[DB] Database introspection failed:', error);
    return { error: error.message };
  }
}

// Performance monitoring middleware with retry logic
export function withTiming<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operation: string,
  retries = 2
) {
  return async (...args: T): Promise<R> => {
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      const start = Date.now();
      try {
        const result = await fn(...args);
        const timing = Date.now() - start;
        console.log(`[DB] ${operation} completed in ${timing}ms`);
        return result;
      } catch (error: any) {
        const timing = Date.now() - start;
        console.error(`[DB] ${operation} failed after ${timing}ms on attempt ${attempt}:`, error.message);
        
        if (attempt <= retries && isRetryableError(error)) {
          console.log(`[DB] Retrying ${operation} (attempt ${attempt + 1}/${retries + 1})`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
          continue;
        }
        throw error;
      }
    }
    throw new Error(`Max retries exceeded for ${operation}`);
  };
}

// Check if error is retryable
function isRetryableError(error: any): boolean {
  const retryableErrors = [
    'ECONNRESET',
    'ENOTFOUND',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'P1001', // Prisma connection error
    'P1008', // Operations timed out
    'P1017', // Server has closed the connection
  ];
  
  return retryableErrors.some(code => 
    error.code === code || 
    error.message?.includes(code) ||
    error.message?.includes('connection') ||
    error.message?.includes('timeout')
  );
}

// Database health check
export async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Test table access
    const userCount = await prisma.user.count();
    const taskCount = await prisma.task.count();
    
    const timing = Date.now() - start;
    
    return {
      healthy: true,
      timing,
      stats: {
        users: userCount,
        tasks: taskCount,
      }
    };
  } catch (error: any) {
    return {
      healthy: false,
      error: error.message,
    };
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('[DB] Database connection closed gracefully');
  } catch (error) {
    console.error('[DB] Error during database disconnect:', error);
  }
}

// Handle process termination
process.on('beforeExit', disconnectDatabase);
process.on('SIGINT', disconnectDatabase);
process.on('SIGTERM', disconnectDatabase);
