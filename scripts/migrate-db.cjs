#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

async function runMigrations() {
  console.log('🔄 Running database migrations...\n');
  
  try {
    // Change to backend directory
    process.chdir(path.join(__dirname, '..', 'backend'));
    
    console.log('1. Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated\n');
    
    console.log('2. Running database migrations...');
    execSync('npx prisma migrate dev --name comprehensive_schema', { stdio: 'inherit' });
    console.log('✅ Migrations completed\n');
    
    console.log('3. Verifying database schema...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Database schema verified\n');
    
    console.log('🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: node ../scripts/verify-db.js');
    console.log('2. Run: node ../scripts/seed-colleges.js');
    console.log('3. Start the application: encore run');
    
  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check your DATABASE_URL in .env');
    console.error('2. Ensure Neon database is accessible');
    console.error('3. Try: npx prisma migrate reset');
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
