// Database-based admin auth middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const simpleAdminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required - no token provided'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Find user in database
    const user = await User.findById(decoded.userId || decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required - user not found'
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin authentication required - insufficient privileges'
      });
    }

    // Set user in request for use in routes
    req.user = user;
    
    next();
    
  } catch (error) {
    console.error('Admin auth error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required - invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required - token expired'
      });
    }
    
    res.status(401).json({
      success: false,
      message: 'Admin authentication failed'
    });
  }
};

module.exports = { simpleAdminAuth };
