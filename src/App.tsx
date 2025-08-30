import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import VerifyEmail from "./component/VerifyEmail";
import PasswordResetPage from "./pages/PasswordResetPage";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ParentDashboard from "./pages/ParentDashboard";


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = localStorage.getItem("accessToken") || localStorage.getItem("token");

  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  useEffect(() => {
    const win = window as any;
    if (win.__tokenRefreshIntervalId) {
      clearInterval(win.__tokenRefreshIntervalId);
      win.__tokenRefreshIntervalId = null;
    }

    const refreshAccessToken = async () => {
      try {
        const refresh = localStorage.getItem('refreshToken');
        if (!refresh) return;
        const res = await fetch('/user/token/refresh/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh })
        });
        if (!res.ok) {
          // Stop auto-refresh if refresh fails
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          return;
        }
        const data = await res.json();
        if (data.access) {
          localStorage.setItem('accessToken', data.access);
        }
      } catch (e) {
        // ignore network errors; will retry on next tick
      }
    };

    // Immediately attempt a refresh on mount (optional)
    refreshAccessToken();

    // Refresh every 5 minutes
    win.__tokenRefreshIntervalId = setInterval(refreshAccessToken, 5 * 60 * 1000);

    return () => {
      if (win.__tokenRefreshIntervalId) {
        clearInterval(win.__tokenRefreshIntervalId);
        win.__tokenRefreshIntervalId = null;
      }
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/password-reset" element={<PasswordResetPage />} />
      <Route
        path="/redirect-by-role"
        element={
          <ProtectedRoute>
            {(() => {
              const userType = (localStorage.getItem('userType') || '').toLowerCase();
              if (userType === 'طالب' || userType === 'student') return <Navigate to="/dashboard/student" replace />;
              if (userType === 'معلم' || userType === 'teacher') return <Navigate to="/dashboard/teacher" replace />;
              if (userType === 'ولي أمر' || userType === 'parent') return <Navigate to="/dashboard/parent" replace />;
              return <Navigate to="/dashboard" replace />;
            })()}
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/student"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/teacher"
        element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/parent"
        element={
          <ProtectedRoute>
            <ParentDashboard />
          </ProtectedRoute>
        }
      />
    




    </Routes>


  );
};

export default App;