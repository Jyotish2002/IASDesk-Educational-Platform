#!/usr/bin/env node

/**
 * Quick fix script to replace all hardcoded production URLs with environment variables
 * for local testing
 */

const fs = require('fs');
const path = require('path');

const PRODUCTION_URL = 'https://iasdesk-educational-platform-2.onrender.com/api';
const ENV_VAR_REPLACEMENT = '${process.env.REACT_APP_API_URL}';

// Files that need URL replacement
const filesToFix = [
  'src/components/Navbar.tsx',
  'src/pages/Home.tsx',
  'src/pages/Courses.tsx',
  'src/pages/CourseDetails.tsx',
  'src/pages/AdminDashboard.tsx',
  'src/pages/CourseContent.tsx',
  'src/components/CreateCourseModal.tsx',
  'src/components/GoogleMeetScheduler.tsx',
  'src/components/LiveClassManager.tsx',
  'src/pages/MyCourses.tsx',
  'src/components/AdminDataDebugger.tsx',
  'src/components/TeacherStudentChat.tsx',
  'src/components/TeacherList.tsx',
  'src/components/TeacherDashboard.tsx',
  'src/pages/TeacherLogin.tsx',
  'src/components/TeacherInitialLogin.tsx',
  'src/components/TeacherCompleteProfile.tsx',
  'src/pages/StudentTeacherChat.tsx'
];

function replaceUrlsInFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', 'frontend', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Replace all instances of the production URL
    content = content.replace(
      new RegExp(PRODUCTION_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      ENV_VAR_REPLACEMENT
    );

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed URLs in: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No URLs to fix in: ${filePath}`);
      return false;
    }

  } catch (error) {
    console.log(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing hardcoded production URLs for local testing...');
  console.log('=' .repeat(60));

  let fixedCount = 0;

  for (const file of filesToFix) {
    if (replaceUrlsInFile(file)) {
      fixedCount++;
    }
  }

  console.log('=' .repeat(60));
  console.log(`📊 Summary: Fixed ${fixedCount} files`);
  console.log('💡 Now restart your frontend server for changes to take effect');
  console.log('');
  console.log('🔄 To revert back to production URLs later, run:');
  console.log('   Find and replace: ${process.env.REACT_APP_API_URL}');
  console.log('   With: https://iasdesk-educational-platform-2.onrender.com/api');
}

main();
