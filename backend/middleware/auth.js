const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Try to get token from httpOnly cookie first, then fallback to Authorization header
    let token = req.cookies?.authToken;
    
    if (!token) {
      token = req.header('Authorization')?.replace('Bearer ', '');
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided, authorization denied' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-__v');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin rights required.' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Authorization failed' 
    });
  }
};

module.exports = { auth, adminAuth };
