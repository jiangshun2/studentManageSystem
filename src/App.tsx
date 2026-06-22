import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MessageHost } from './components/MessageHost';
import { ModalHost } from './components/ModalHost';
import Layout from './components/Layout';
import LoginPage from './pages/Login';
import StudentHome from './pages/student/Home';
import StudentScore from './pages/student/Score';
import StudentVisual from './pages/student/Visual';
import StudentProfile from './pages/student/Profile';
import StudentDeregister from './pages/student/Deregister';
import TeacherHome from './pages/teacher/Home';
import TeacherScore from './pages/teacher/Score';
import TeacherCourse from './pages/teacher/Course';
import TeacherAnalytics from './pages/teacher/Analytics';
import TeacherProfile from './pages/teacher/Profile';
import AdminHome from './pages/admin/Home';
import AdminUsers from './pages/admin/Users';
import AdminCourses from './pages/admin/Courses';
import AdminScores from './pages/admin/Scores';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStats from './pages/admin/Stats';
import { Role } from './mock/data';

function ProtectedRoute({
  children,
  role,
}: {
  children: JSX.Element;
  role?: Role;
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/student" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <MessageHost />
      <ModalHost />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/student/*"
          element={
            <ProtectedRoute role="student">
              <Layout role="student" />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentHome />} />
          <Route path="score" element={<StudentScore />} />
          <Route path="visual" element={<StudentVisual />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="deregister" element={<StudentDeregister />} />
        </Route>
        <Route
          path="/teacher/*"
          element={
            <ProtectedRoute role="teacher">
              <Layout role="teacher" />
            </ProtectedRoute>
          }
        >
          <Route index element={<TeacherHome />} />
          <Route path="score" element={<TeacherScore />} />
          <Route path="course" element={<TeacherCourse />} />
          <Route path="analytics" element={<TeacherAnalytics />} />
          <Route path="profile" element={<TeacherProfile />} />
        </Route>
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <Layout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="scores" element={<AdminScores />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="stats" element={<AdminStats />} />
        </Route>
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
