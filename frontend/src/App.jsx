import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./components/layout/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";

import HomePage from "./pages/HomePage";
import StandingsPage from "./pages/StandingsPage";
import CalendarPage from "./pages/CalendarPage";
import ResultsPage from "./pages/ResultsPage";
import TeamsPage from "./pages/TeamsPage";
import TeamDetailPage from "./pages/TeamDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

import LoginPage from "./pages/admin/LoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminTeamsPage from "./pages/admin/AdminTeamsPage";
import AdminPlayersPage from "./pages/admin/AdminPlayersPage";
import AdminMatchesPage from "./pages/admin/AdminMatchesPage";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ---- Vista publica ---- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/clasificacion" element={<StandingsPage />} />
          <Route path="/calendario" element={<CalendarPage />} />
          <Route path="/resultados" element={<ResultsPage />} />
          <Route path="/equipos" element={<TeamsPage />} />
          <Route path="/equipos/:teamId" element={<TeamDetailPage />} />
        </Route>

        {/* ---- Login admin (sin layout publico) ---- */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* ---- Area administrativa protegida ---- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="equipos" element={<AdminTeamsPage />} />
          <Route path="jugadores" element={<AdminPlayersPage />} />
          <Route path="partidos" element={<AdminMatchesPage />} />
        </Route>

        {/* ---- Redirecciones y 404 ---- */}
        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
