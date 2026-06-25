import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // On cherche le token dans le stockage du navigateur
  const token = localStorage.getItem('token');

  // S'il n'y a pas de token, on redirige vers /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si le token est là, on laisse passer et on affiche le composant enfant
  return children;
}