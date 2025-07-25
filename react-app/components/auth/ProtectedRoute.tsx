import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabase } from '../SupabaseProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login'
}) => {
  const { user, loading } = useSupabase();

  if (loading) {
    // Mostrar um indicador de carregamento enquanto verifica a autenticação
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Se o usuário não estiver autenticado, redirecionar para a página de login
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Se o usuário estiver autenticado, renderizar o conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute;