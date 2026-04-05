import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, GameProvider } from './context/GameContext';
import Login from './pages/Login';
import Register from './pages/Register';
import GamePage from './pages/GamePage';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function PublicOnlyRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </GameProvider>
    </AuthProvider>
  );
}
