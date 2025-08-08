#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const sampleColleges = [
  {
    name: "Harvard University",
    location: "Cambridge, MA",
    acceptanceRate: 3.4,
    avgGpa: 4.18,
    avgSat: 1520,
    avgAct: 34,
    details: {
      type: "Private",
      founded: 1636,
      enrollment: 23000,
      tuition: 54000
    }
  },
  {
    name: "Stanford University",
    location: "Stanford, CA",
    acceptanceRate: 3.9,
    avgGpa: 4.18,
    avgSat: 1505,
    avgAct: 34,
    details: {
      type: "Private",
      founded: 1885,
      enrollment: 17000,
      tuition: 56000
    }
  },
  {
    name: "Massachusetts Institute of Technology",
    location: "Cambridge, MA",
    acceptanceRate: 4.1,
    avgGpa: 4.17,
    avgSat: 1535,
    avgAct: 35,
    details: {
      type: "Private",
      founded: 1861,
      enrollment: 11000,
      tuition: 57000
    }
  },
  {
    name: "University of California, Berkeley",
    location: "Berkeley, CA",
    acceptanceRate: 14.5,
    avgGpa: 3.89,
    avgSat: 1415,
    avgAct: 32,
    details: {
      type: "Public",
      founded: 1868,
      enrollment: 45000,
      tuition: 14000
    }
  },
  {
    name: "Yale University",
    location: "New Haven, CT",
    acceptanceRate: 4.6,
    avgGpa: 4.14,
    avgSat: 1515,
    avgAct: 34,
    details: {
      type: "Private",
      founded: 1701,
      enrollment: 13000,
      tuition: 59000
    }
  },
  {
    name: "Princeton University",
    location: "Princeton, NJ",
    acceptanceRate: 4.0,
    avgGpa: 4.16,
    avgSat: 1520,
    avgAct: 34,
    details: {
      type: "Private",
      founded: 1746,
      enrollment: 5400,
      tuition: 56000
    }
  },
  {
    name: "University of California, Los Angeles",
    location: "Los Angeles, CA",
    acceptanceRate: 10.8,
    avgGpa: 3.93,
    avgSat: 1405,
    avgAct: 31,
    details: {
      type: "Public",
      founded: 1919,
      enrollment: 47000,
      tuition: 13000
    }
  },
  {
    name: "Columbia University",
    location: "New York, NY",
    acceptanceRate: 3.9,
    avgGpa: 4.15,
    avgSat: 1510,
    avgAct: 34,
    details: {
      type: "Private",
      founded: 1754,
      enrollment: 33000,
      tuition: 61000
    }
  },
  {
    name: "University of Chicago",
    location: "Chicago, IL",
    acceptanceRate: 6.2,
    avgGpa: 4.13,
    avgSat: 1520,
    avgAct: 34,
    details: {
      type: "Private",
      founded: 1890,
      enrollment: 17000,
      tuition: 59000
    }
  },
  {
    name: "University of Pennsylvania",
    location: "Philadelphia, PA",
    acceptanceRate: 5.9,
    avgGpa: 4.11,
    avgSat: 1510,
    avgAct: 34,
    details: {
      type: "Private",
      founded: 1740,
      enrollment: 25000,
      tuition: 58000
    }
  }
];

async function seedColleges() {
  const prisma = new PrismaClient();
  
  console.log('🌱 Seeding college database...\n');
  
  try {
    // Create a system user for seeding
    let systemUser = await prisma.user.findFirst({
      where: { email: 'system@studyflow.app' }
    });
    
    if (!systemUser) {
      systemUser = await prisma.user.create({
        data: {
          id: 'system-user',
          email: 'system@studyflow.app',
          name: 'System',
        }
      });
      console.log('✅ Created system user for seeding');
    }
    
    // Clear existing colleges
    const existingCount = await prisma.college.count();
    if (existingCount > 0) {
      await prisma.college.deleteMany();
      console.log(`🗑️  Cleared ${existingCount} existing colleges`);
    }
    
    // Insert sample colleges
    console.log('📚 Inserting sample colleges...');
    
    for (const college of sampleColleges) {
      await prisma.college.create({
        data: {
          ...college,
          createdBy: systemUser.id,
        }
      });
      console.log(`   ✅ Added ${college.name}`);
    }
    
    console.log(`\n🎉 Successfully seeded ${sampleColleges.length} colleges!`);
    
    // Verify the data
    const finalCount = await prisma.college.count();
    console.log(`📊 Total colleges in database: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedColleges();
}

module.exports = { seedColleges };
