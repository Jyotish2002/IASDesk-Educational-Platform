# 🧪 LOCAL TESTING GUIDE - Admin Authentication

## 🚀 Quick Start Testing

### Step 1: Start Backend Server
```bash
cd backend
node server.js
```

**Expected Output:**
```
Server running on port 5000
MongoDB connected successfully
```

### Step 2: Test Backend API (Optional)
```bash
cd backend
node testAdminLogin.js
```

**Expected Output:**
```
🚀 Starting Admin Authentication Tests
✅ Backend server is responding
🔐 Testing admin login: 9999999999
✅ Login successful!
👤 User: Super Admin
🎫 Token received: Yes
🔑 Admin privileges: true
📋 Role: admin
🔍 Verifying admin token...
✅ Token verification successful!
🎉 All admin authentication tests passed!
```

### Step 3: Start Frontend
```bash
cd frontend
npm start
```

### Step 4: Test Admin Login Flow

1. **Navigate to:** `http://localhost:3000/admin-login`

2. **Enter Credentials:**
   - **Mobile:** `9999999999`
   - **Password:** `admin123`
   
   OR
   
   - **Mobile:** `8888888888` 
   - **Password:** `iasdesk2025`

3. **Expected Behavior:**
   - ✅ "Welcome [Admin Name]! Admin access granted." message
   - ✅ Redirect to `/admin` dashboard
   - ✅ No "Logged out successfully" message
   - ✅ Admin dashboard loads properly

## 🔍 Debugging Steps

### If You See "Invalid or expired admin session"

**Check Browser Console:**
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors during login

**Common Issues & Solutions:**

#### Issue 1: "Admin role check failed"
```javascript
// Console shows: Admin role check failed: {userRole: undefined, isAdmin: true}
```
**Solution:** Backend user object missing `role` field - this is now fixed.

#### Issue 2: "Admin verification failed"
```javascript
// Console shows: Admin verification failed: {success: false, message: "..."}
```
**Solution:** JWT token issues - check if backend is using correct JWT secret.

#### Issue 3: Network errors
```javascript
// Console shows: Failed to fetch
```
**Solution:** Backend not running or wrong API URL.

### If You See "Logged out successfully" After Login

**This means:**
1. Admin login succeeded initially
2. ProtectedRoute verification failed
3. System auto-logged out the admin

**Debug Steps:**
1. Check browser console for specific error
2. Verify admin user has `role: 'admin'` in database
3. Check JWT token validation

## 🔧 Manual Database Verification

### Check Admin Users in Database
```javascript
// Run in MongoDB shell or add to test script
db.users.find({isAdmin: true}, {mobile: 1, name: 1, role: 1, isAdmin: 1})
```

**Expected Output:**
```json
[
  {
    "_id": "...",
    "mobile": "9999999999",
    "name": "Super Admin", 
    "role": "admin",
    "isAdmin": true
  },
  {
    "_id": "...",
    "mobile": "8888888888",
    "name": "IASDesk Admin",
    "role": "admin", 
    "isAdmin": true
  }
]
```

## 🌐 Environment Variables Check

### Backend (.env)
```properties
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_super_secure_jwt_secret_key_here_change_in_production
```

### Frontend (.env)
```properties
REACT_APP_API_URL=http://localhost:5000/api
```

## ✅ Success Indicators

### Backend Console:
```
Server running on port 5000
MongoDB connected successfully
Admin login successful for: 9999999999
```

### Frontend Console:
```
✅ Admin login successful
✅ Token stored in localStorage
✅ Admin verification passed
✅ Redirecting to /admin
```

### Browser Behavior:
- ✅ Login form submits without errors
- ✅ Success toast: "Welcome [Name]! Admin access granted."
- ✅ Automatic redirect to admin dashboard
- ✅ Admin dashboard loads with proper nav/content
- ✅ Page refresh maintains admin session

## 🚨 Common Fixes Applied

1. **JWT Payload Fix:** `decoded.userId` → `decoded.id`
2. **Admin Role Field:** Added `role: 'admin'` to login response
3. **Session Management:** Better handling for admin logins
4. **Error Handling:** Reduced aggressive logout on verification failures

## 📞 If Issues Persist

1. **Clear Browser Storage:**
   - DevTools → Application → Storage → Clear All
   
2. **Restart Both Servers:**
   - Stop backend and frontend
   - Start backend first, then frontend
   
3. **Check Network Tab:**
   - DevTools → Network
   - Monitor API calls during login
   - Check for 401/403 errors

4. **Database Reset:**
   ```bash
   cd backend
   node updateAdminRoles.js
   ```

The fixes should resolve the "Invalid or expired admin session" issue! 🎉
