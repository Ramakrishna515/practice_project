// Seed script to populate initial data
const mongoose = require('mongoose');
const Department = require('./models/Department');
const Designation = require('./models/Designation');
const LeaveType = require('./models/LeaveType');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Department.deleteMany({});
    await Designation.deleteMany({});
    await LeaveType.deleteMany({});

    // Create Departments
    console.log('📊 Creating departments...');
    const departments = await Department.insertMany([
      {
        departmentName: 'Engineering',
        departmentCode: 'ENG',
        description: 'Software development and engineering',
        headOfDepartment: 'John Doe'
      },
      {
        departmentName: 'Human Resources',
        departmentCode: 'HR',
        description: 'HR and recruitment',
        headOfDepartment: 'Jane Smith'
      },
      {
        departmentName: 'Sales',
        departmentCode: 'SALES',
        description: 'Sales and business development',
        headOfDepartment: 'Bob Wilson'
      }
    ]);
    console.log(`✅ Created ${departments.length} departments`);

    // Create Designations
    console.log('👔 Creating designations...');
    const designations = await Designation.insertMany([
      {
        designationName: 'Software Engineer',
        designationCode: 'SE',
        department: departments[0]._id,
        level: 'Junior',
        description: 'Entry level software engineer'
      },
      {
        designationName: 'Senior Software Engineer',
        designationCode: 'SSE',
        department: departments[0]._id,
        level: 'Senior',
        description: 'Senior software engineer'
      },
      {
        designationName: 'HR Manager',
        designationCode: 'HRM',
        department: departments[1]._id,
        level: 'Manager',
        description: 'Human resources manager'
      },
      {
        designationName: 'Sales Executive',
        designationCode: 'SAL',
        department: departments[2]._id,
        level: 'Executive',
        description: 'Sales executive'
      }
    ]);
    console.log(`✅ Created ${designations.length} designations`);

    // Create Leave Types
    console.log('🏖️  Creating leave types...');
    const leaveTypes = await LeaveType.insertMany([
      {
        leaveName: 'Casual Leave',
        leaveCode: 'CL',
        totalDays: 12,
        description: 'For personal reasons',
        isPaid: true,
        carryForward: true
      },
      {
        leaveName: 'Sick Leave',
        leaveCode: 'SL',
        totalDays: 10,
        description: 'For medical reasons',
        isPaid: true,
        carryForward: false
      },
      {
        leaveName: 'Privilege Leave',
        leaveCode: 'PL',
        totalDays: 20,
        description: 'Earned leave',
        isPaid: true,
        carryForward: true
      }
    ]);
    console.log(`✅ Created ${leaveTypes.length} leave types`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - Departments: ${departments.length}`);
    console.log(`   - Designations: ${designations.length}`);
    console.log(`   - Leave Types: ${leaveTypes.length}`);
    console.log('\n✅ You can now:');
    console.log('   1. Login to the application');
    console.log('   2. Create employees');
    console.log('   3. Apply for leaves');
    console.log('   4. Track attendance');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
