// Example script to create a teacher via API
// You can run this with Node.js or use Postman/Insomnia

const createTeacher = async () => {
  try {
    // You need to get the admin token first by logging in as admin
    const adminToken = 'YOUR_ADMIN_TOKEN_HERE'; // Replace with actual admin token

    const teacherData = {
      name: 'Dr. Rajesh Sharma',
      email: 'rajesh.sharma@iasdesk.com',
      mobile: '9876543210',
      subject: 'Indian Polity',
      experience: 5,
      bio: 'Expert in Indian Constitutional Law and Political Science',
      specialization: ['Constitutional Law', 'Indian Government', 'Public Administration']
    };

    const response = await fetch('${process.env.REACT_APP_API_URL}/admin/create-teacher', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify(teacherData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Teacher created successfully!');
      console.log('Teacher Details:', result.data.teacher);
      console.log('Temporary Password:', result.data.teacher.tempPassword);
    } else {
      console.error('Error:', result.message);
    }
  } catch (error) {
    console.error('Error creating teacher:', error);
  }
};

// Call the function
createTeacher();
