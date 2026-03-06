import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import PathFindingPage from './pages/PathFindingPage';
import SortingPage from './pages/SortingPage';
import './styles/global.css';

/*
  App -- root component.
  Sets up routing and kicks off the initial auth check.

  All routes are publicly accessible. Users can log in for features like
  saving graphs, but the core visualization tools work without an account.

  Route structure:
    /login           - login page
    /register        - registration page
    /                - home page with module grid
    /pathfinding     - path finding workspace
    ... future modules
*/

export default function App() {
  const { checkAuth } = useAuthStore();

  // on mount, try to restore the user session if a token exists
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* auth pages (no navbar) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* main app routes with navbar -- all publicly accessible */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/pathfinding" element={<PathFindingPage />} />
          <Route path="/sorting" element={<SortingPage />} />
          {/* future module routes go here */}
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
