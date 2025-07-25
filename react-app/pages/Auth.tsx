import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContainer } from '../components/auth';
import { useSupabase } from '../components/SupabaseProvider';
import DebugAuth from '../components/DebugAuth';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSupabase();
  
  // Obter o parâmetro view da URL (login, signup, forgot-password, reset-password)
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get('view') as 'login' | 'signup' | 'forgot-password' | 'reset-password' || 'login';
  
  // Obter o parâmetro redirectTo da URL
  const redirectTo = searchParams.get('redirectTo') || '/';
  
  // Se o usuário já estiver autenticado, redirecionar para a página inicial
  React.useEffect(() => {
    if (user) {
      navigate(redirectTo);
    }
  }, [user, navigate, redirectTo]);
  
  const handleAuthSuccess = () => {
    navigate(redirectTo);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <AuthContainer
          initialView={view}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
      <DebugAuth />
    </div>
  );
};

export default AuthPage;