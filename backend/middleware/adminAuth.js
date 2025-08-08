const { auth } = require('./auth');

// Admin middleware to check if user is admin
const adminAuth = (req, res, next) => {
  // First check if user is authenticated
  auth(req, res, (err) => {
    if (err) {
      return next(err);
    }

    // For demo purposes, we'll check for specific admin credentials
    // In production, you should have proper admin roles in the database
    const adminCredentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'iasdesk', password: 'iasdesk2025' }
    ];

    // Check if the authenticated user has admin privileges
    // This is a simplified check - in production, use proper role-based access
    const isAdmin = req.headers['x-admin-token'] === 'admin-authenticated' || 
                   req.user?.isAdmin || 
                   adminCredentials.some(cred => 
                     req.headers['x-admin-username'] === cred.username
                   );

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  });
};

module.exports = { adminAuth };

