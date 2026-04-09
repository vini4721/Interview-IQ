import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import HomePage from "./pages/HomePage";

import { Toaster } from "react-hot-toast";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import ProblemsPage from "./pages/ProblemsPage";
import SessionPage from "./pages/SessionPage";

function ProtectedRoute({ isSignedIn, children }) {
  const location = useLocation();

  if (!isSignedIn) {
    const redirectTo = `${location.pathname}${location.search}`;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("interviewiq_redirect_target", redirectTo);
    }
    return (
      <Navigate to={`/?redirect=${encodeURIComponent(redirectTo)}`} replace />
    );
  }

  return children;
}

function App() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-300">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isSignedIn={isSignedIn}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/problems"
          element={
            <ProtectedRoute isSignedIn={isSignedIn}>
              <ProblemsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/problem/:id"
          element={
            <ProtectedRoute isSignedIn={isSignedIn}>
              <ProblemPage />
            </ProtectedRoute>
          }
        />
        <Route path="/session/:id" element={<SessionPage />} />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
