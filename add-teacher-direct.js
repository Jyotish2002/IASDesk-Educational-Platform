const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User model (simplified for this script)
const User = require('./backend/models/User');

const createTeacher = async (teacherData) => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iasdesk');
    console.log('Connected to MongoDB');

    // Check if teacher already exists
    const existingUser = await User.findOne({
      $or: [
        { email: teacherData.email.toLowerCase() },
        { mobile: teacherData.mobile }
      ]
    });

    if (existingUser) {
      console.log('❌ Teacher with this email or mobile already exists');
      return;
    }

    // Hash password (using mobile number as temp password)
    const tempPassword = teacherData.mobile;
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create teacher
    const teacher = new User({
      name: teacherData.name,
      email: teacherData.email.toLowerCase(),
      mobile: teacherData.mobile,
      password: hashedPassword,
      role: 'teacher',
      isVerified: true,
      isActive: true,
      mustChangePassword: true,
      subject: teacherData.subject,
      experience: teacherData.experience || 0,
      bio: teacherData.bio || '',
      specialization: teacherData.specialization || [],
      rating: 0,
      isOnline: false
    });

    await teacher.save();

    console.log('✅ Teacher created successfully!');
    console.log('📧 Email:', teacher.email);
    console.log('📱 Mobile:', teacher.mobile);
    console.log('🔑 Temporary Password:', tempPassword);
    console.log('📚 Subject:', teacher.subject);
    console.log('⚠️  Teacher must change password on first login');

  } catch (error) {
    console.error('❌ Error creating teacher:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Example teacher data - modify as needed
const sampleTeacher = {
  name: 'Dr. Priya Mehta',
  email: 'priya.mehta@iasdesk.com',
  mobile: '9876543210',
  subject: 'Indian History',
  experience: 8,
  bio: 'Expert in Ancient and Medieval Indian History with specialization in Art and Culture',
  specialization: ['Ancient History', 'Art & Culture', 'Medieval History']
};

// Run the function
createTeacher(sampleTeacher);
