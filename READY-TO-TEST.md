# 🧪 READY TO TEST - Admin Login Local

## ✅ FIXES APPLIED

1. **Backend URLs Fixed**: All admin-related endpoints now use environment variables
2. **Frontend Environment**: Points to local backend (`http://localhost:5000/api`)
3. **Backend Running**: Your local server is confirmed working
4. **Admin Users**: Exist in database with proper roles

## 🚀 TEST NOW

### Step 1: Start Frontend (if not running)
```bash
cd frontend
npm start
```

### Step 2: Test Admin Login
1. **Open:** `http://localhost:3000/admin-login`
2. **Credentials:** 
   - Mobile: `9999999999`
   - Password: `admin123`
3. **Expected:** Welcome message → Redirect to `/admin`

## 🔍 DEBUGGING TIPS

### If Still Getting "Invalid or expired admin session":

1. **Check Browser Console** (F12):
   - Look for API call URLs
   - Should show `http://localhost:5000/api/auth/admin/login`
   - NOT `https://iasdesk-educational-platform-2.onrender.com/...`

2. **Check Network Tab**:
   - Monitor API calls during login
   - Verify they're hitting localhost

3. **Clear Browser Data**:
   - DevTools → Application → Storage → Clear All
   - This removes old tokens/sessions

### Quick Verification Commands:

**Backend Health Check:**
```bash
curl http://localhost:5000/api/auth/verify-admin
# Should respond (even with 401 - means server is responding)
```

**Test Login API Directly:**
```bash
curl -X POST http://localhost:5000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999", "password": "admin123"}'
# Should return success with token
```

## 🎯 SUCCESS INDICATORS

✅ **Frontend Console**: No network errors to production URLs
✅ **Login Response**: "Welcome Super Admin! Admin access granted."
✅ **Redirect**: Automatic navigation to admin dashboard
✅ **No Logout**: Should NOT see "Logged out successfully"
✅ **Dashboard Load**: Admin interface loads properly

## ⚠️ IMPORTANT NOTES

1. **Frontend Must Restart**: After env changes, restart React server
2. **Both Servers**: Ensure both backend (port 5000) and frontend (port 3000) running
3. **Clear Cache**: Browser might cache old API calls

## 🔄 TO REVERT LATER

When you want to deploy again, change:
```properties
# frontend/.env
REACT_APP_API_URL=https://iasdesk-educational-platform-2.onrender.com/api
```

The admin login should now work locally! 🎉
