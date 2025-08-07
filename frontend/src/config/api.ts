// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://iasdesk-educational-platform-2.onrender.com/api';

export const API_ENDPOINTS = {
  // Current Affairs
  CURRENT_AFFAIRS: `${API_BASE_URL}/current-affairs`,
  CURRENT_AFFAIRS_CATEGORIES: `${API_BASE_URL}/current-affairs/categories`,
  CURRENT_AFFAIRS_RECENT: `${API_BASE_URL}/current-affairs/recent`,
  
  // Auth
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
  AUTH_ADMIN_LOGIN: `${API_BASE_URL}/auth/admin/login`,
  
  // Courses
  COURSES: `${API_BASE_URL}/courses`,
  
  // Users
  USERS: `${API_BASE_URL}/users`,
  
  // Payments
  PAYMENTS: `${API_BASE_URL}/payments`,
};

export default API_BASE_URL;
