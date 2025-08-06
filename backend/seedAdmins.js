const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedAdminUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iasdesk');
    console.log('Connected to MongoDB');

    // Check if admin users already exist
    const existingAdmin1 = await User.findOne({ mobile: '9999999999' });
    const existingAdmin2 = await User.findOne({ mobile: '8888888888' });

    const adminUsers = [];

    if (!existingAdmin1) {
      adminUsers.push({
        mobile: '9999999999',
        name: 'Super Admin',
        email: 'admin@iasdesk.com',
        isVerified: true,
        isAdmin: true,
        enrolledCourses: []
      });
    } else {
      console.log('Admin user 9999999999 already exists');
    }

    if (!existingAdmin2) {
      adminUsers.push({
        mobile: '8888888888',
        name: 'IASDesk Admin',
        email: 'iasdesk@iasdesk.com',
        isVerified: true,
        isAdmin: true,
        enrolledCourses: []
      });
    } else {
      console.log('Admin user 8888888888 already exists');
    }

    if (adminUsers.length > 0) {
      await User.insertMany(adminUsers);
      console.log(`${adminUsers.length} admin users created successfully:`);
      adminUsers.forEach(admin => {
        console.log(`- ${admin.name} (${admin.mobile})`);
      });
    } else {
      console.log('All admin users already exist');
    }

    console.log('\nAdmin Credentials:');
    console.log('1. Mobile: 9999999999, Password: admin123');
    console.log('2. Mobile: 8888888888, Password: iasdesk2025');

    await mongoose.disconnect();
    console.log('\nDatabase connection closed');

  } catch (error) {
    console.error('Error seeding admin users:', error);
    process.exit(1);
  }
};

// Run the seeder
if (require.main === module) {
  seedAdminUsers();
}

module.exports = { seedAdminUsers };
