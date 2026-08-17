import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./components/Toast.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import PublicLayout from "./layouts/PublicLayout.jsx";
import StudentLayout from "./layouts/StudentLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

import Dashboard from "./pages/student/Dashboard.jsx";
import Profile from "./pages/student/Profile.jsx";
import ResumeAnalyzer from "./pages/student/ResumeAnalyzer.jsx";
import { AssessmentList, AssessmentRunner } from "./pages/student/Assessments.jsx";
import JobIntelligence from "./pages/student/JobIntelligence.jsx";
import SkillGapPage from "./pages/student/SkillGap.jsx";
import CareerSimulator from "./pages/student/CareerSimulator.jsx";
import Roadmap from "./pages/student/Roadmap.jsx";
import { InterviewList, InterviewSession, InterviewReport } from "./pages/student/InterviewCoach.jsx";
import ProgressPage from "./pages/student/Progress.jsx";
import Reports from "./pages/student/Reports.jsx";
import Settings from "./pages/student/Settings.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import Students from "./pages/admin/Students.jsx";

function HomeRedirect() {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"} replace />;
  return <Landing />;
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        <Route element={<ProtectedRoute role="STUDENT" />}>
          <Route element={<StudentLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="/assessments" element={<AssessmentList />} />
            <Route path="/assessments/:id" element={<AssessmentRunner />} />
            <Route path="/job-intelligence" element={<JobIntelligence />} />
            <Route path="/skill-gap" element={<SkillGapPage />} />
            <Route path="/career-simulator" element={<CareerSimulator />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/interview-coach" element={<InterviewList />} />
            <Route path="/interview-coach/:id" element={<InterviewSession />} />
            <Route path="/interview-coach/:id/report" element={<InterviewReport />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<Students />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
