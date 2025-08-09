const checkEnrollment = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const user = req.user;

    // Check if user is already enrolled
    const alreadyEnrolled = user.enrolledCourses.some(
      enrollment => enrollment.courseId.toString() === courseId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }

    next();
  } catch (error) {
    console.error('Check enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check enrollment status'
    });
  }
};

module.exports = { checkEnrollment };
