# Fix Localhost URLs in Your Codebase

## Problem
Your codebase has many hardcoded `localhost:5000` URLs that need to be replaced with environment variables for production deployment.

## Solution
Replace all instances of `${process.env.REACT_APP_API_URL}` with `${process.env.REACT_APP_API_URL}` 

## Files that need to be updated:

### 1. SimplifiedAdminDashboard.tsx (FIXED ✅)
- Line 70: dashboard endpoint
- Line 174: teachers endpoint 
- Line 344: create-teacher endpoint
- Line 486: reset-teacher-password endpoint
- Line 517: teacher update endpoint

### 2. CourseOverview.tsx (FIXED ✅)
- Line 129: admin/courses endpoint
- Line 171: admin/courses endpoint 
- Line 196: admin/dashboard endpoint

### 3. Other files that need updating:
- LiveClasses.tsx (line 45)
- UserManagement.tsx (lines 61, 162)
- WorkingAdminDashboard.tsx (line 57)
- WebsiteSettings.tsx (lines 115, 149)
- CurrentAffairs.tsx (lines 40, 41)
- CurrentAffairDetail.tsx (lines 28, 48)
- AdminCurrentAffairs.tsx (lines 87, 88, 265, 266, 297)
- TeacherRegistration.tsx (line 94)
- TeacherChangePassword.tsx (line 54)
- AdminTeacherManagement.tsx (line 31)
- AdminTeacherList.tsx (lines 67, 113, 143)

## Pattern to Follow:

### WRONG ❌:
```typescript
const response = await fetch('${process.env.REACT_APP_API_URL}/admin/dashboard', {
```

### CORRECT ✅:
```typescript
const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/dashboard`, {
```

## Quick Fix Command:
You can use find-and-replace in VS Code:
1. Press Ctrl+Shift+H
2. Find: `${process.env.REACT_APP_API_URL}`
3. Replace: `${process.env.REACT_APP_API_URL}`
4. Replace All

## Your Environment Variable:
```
REACT_APP_API_URL=https://iasdesk-educational-platform-2.onrender.com/api
```

This ensures your app works in both development and production environments.
