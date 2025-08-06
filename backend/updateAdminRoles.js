const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const updateAdminRoles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iasdesk');
    console.log('Connected to MongoDB');

    // Update existing admin users to have role: 'admin'
    const result = await User.updateMany(
      { isAdmin: true },
      { $set: { role: 'admin' } }
    );

    console.log(`Updated ${result.modifiedCount} admin users with role: 'admin'`);

    // Verify the updates
    const adminUsers = await User.find({ isAdmin: true }).select('mobile name role isAdmin');
    console.log('\nAdmin users in database:');
    adminUsers.forEach(admin => {
      console.log(`- ${admin.name} (${admin.mobile}) - Role: ${admin.role}, IsAdmin: ${admin.isAdmin}`);
    });

    await mongoose.disconnect();
    console.log('\nDatabase connection closed');

  } catch (error) {
    console.error('Error updating admin roles:', error);
    process.exit(1);
  }
};

// Run the updater
updateAdminRoles();
