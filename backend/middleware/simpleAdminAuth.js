// Simple admin auth middleware for demo purposes
const simpleAdminAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const adminToken = req.header('x-admin-token');

    // Check for admin token or simplified admin authentication
    if (adminToken === 'admin-authenticated' || 
        (token && token.startsWith('admin-token-'))) {
      
      // Create a mock admin user for the request
      req.user = {
        _id: 'admin-user',
        id: 'admin-user',
        name: 'Admin User',
        email: 'admin@iasdesk.com',
        isAdmin: true
      };
      
      console.log('Admin authenticated successfully');
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = { simpleAdminAuth };
