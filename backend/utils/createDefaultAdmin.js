const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createDefaultAdmin = async () => {
  try {
    // Check if any admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      console.log('Creating default admin account...');
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const defaultAdmin = new User({
        name: 'IASDesk Admin',
        mobile: '9999999999',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        isActive: true,
        enrolledCourses: []
      });

      await defaultAdmin.save();
      console.log('✅ Default admin created successfully');
      console.log('📱 Mobile: 9999999999');
      console.log('🔐 Password: admin123');
      console.log('⚠️  Please change the default password after first login');
    } else {
      console.log('✅ Admin account already exists');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};

module.exports = createDefaultAdmin;
