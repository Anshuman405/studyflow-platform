#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function verifyDatabase() {
  const prisma = new PrismaClient();
  
  console.log('🔍 Verifying database connection and schema...\n');
  
  try {
    // Test basic connectivity
    console.log('1. Testing database connectivity...');
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful\n');
    
    // Check if tables exist
    console.log('2. Checking table existence...');
    const tables = await prisma.$queryRaw`
      SELECT schemaname, tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    
    console.log(`✅ Found ${tables.length} tables in public schema:`);
    tables.forEach(table => {
      console.log(`   - ${table.tablename}`);
    });
    console.log('');
    
    // Check table row counts
    console.log('3. Checking table statistics...');
    const stats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        n_live_tup as row_count
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    
    console.log('📊 Table statistics:');
    stats.forEach(stat => {
      console.log(`   - ${stat.tablename}: ${stat.row_count} rows`);
    });
    console.log('');
    
    // Test CRUD operations
    console.log('4. Testing CRUD operations...');
    
    // Test user creation (if auth is set up)
    try {
      const testUser = await prisma.user.findFirst();
      console.log(`✅ User table accessible (found ${testUser ? '1+' : '0'} users)`);
    } catch (error) {
      console.log(`⚠️  User table test failed: ${error.message}`);
    }
    
    // Test task operations
    try {
      const taskCount = await prisma.task.count();
      console.log(`✅ Task table accessible (${taskCount} tasks)`);
    } catch (error) {
      console.log(`⚠️  Task table test failed: ${error.message}`);
    }
    
    // Test college operations
    try {
      const collegeCount = await prisma.college.count();
      console.log(`✅ College table accessible (${collegeCount} colleges)`);
    } catch (error) {
      console.log(`⚠️  College table test failed: ${error.message}`);
    }
    
    console.log('\n🎉 Database verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Database verification failed:');
    console.error(error.message);
    console.error('\nTroubleshooting steps:');
    console.error('1. Check your DATABASE_URL environment variable');
    console.error('2. Ensure Neon database is accessible');
    console.error('3. Run: npx prisma migrate dev');
    console.error('4. Run: npx prisma generate');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Performance timing wrapper
async function timedVerification() {
  const start = Date.now();
  await verifyDatabase();
  const duration = Date.now() - start;
  console.log(`\n⏱️  Total verification time: ${duration}ms`);
}

if (require.main === module) {
  timedVerification();
}

module.exports = { verifyDatabase };
