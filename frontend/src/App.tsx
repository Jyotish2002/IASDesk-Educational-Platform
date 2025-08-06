import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import CourseContent from './pages/CourseContent';
import MyCourses from './pages/MyCourses';
import LiveClasses from './pages/LiveClasses';
import Settings from './pages/Settings';
import SimplifiedAdminDashboard from './pages/SimplifiedAdminDashboard';
import AdminLogin from './pages/AdminLogin';
import CurrentAffairs from './pages/CurrentAffairs';
import CurrentAffairDetail from './pages/CurrentAffairDetail';
import TeacherInitialLogin from './components/TeacherInitialLogin';
import TeacherCompleteProfile from './components/TeacherCompleteProfile';
import TeacherDashboard from './components/TeacherDashboard';
import TeacherLogin from './pages/TeacherLogin';
import StudentTeacherChat from './pages/StudentTeacherChat';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/course-details/:id" element={<CourseDetails />} />
              <Route path="/course-content/:id" element={<CourseContent />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/live-classes" element={<LiveClasses />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<SimplifiedAdminDashboard />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/current-affairs" element={<CurrentAffairs />} />
              <Route path="/current-affairs/:id" element={<CurrentAffairDetail />} />
              <Route path="/teacher-login" element={<TeacherLogin />} />
              <Route path="/teacher/initial-login" element={<TeacherInitialLogin />} />
              <Route path="/teacher/complete-profile" element={<TeacherCompleteProfile />} />
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/chat" element={<StudentTeacherChat />} />
              <Route path="/about" element={<div className="p-8 text-center">About page coming soon...</div>} />
              <Route path="/contact" element={<div className="p-8 text-center">Contact page coming soon...</div>} />
              <Route path="*" element={<div className="p-8 text-center">Page not found</div>} />
            </Routes>
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
