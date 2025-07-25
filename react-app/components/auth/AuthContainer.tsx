import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import ResetPasswordForm from './ResetPasswordForm';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password';

interface AuthContainerProps {
  initialView?: AuthView;
  onAuthSuccess?: () => void;
}

const AuthContainer: React.FC<AuthContainerProps> = ({
  initialView = 'login',
  onAuthSuccess
}) => {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);

  const handleSuccess = () => {
    onAuthSuccess?.();
  };

  const handleError = (error: any) => {
    console.error('Auth error:', error);
  };

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm
            onSuccess={handleSuccess}
            onError={handleError}
            onSignUpClick={() => setCurrentView('signup')}
            onForgotPasswordClick={() => setCurrentView('forgot-password')}
          />
        );
      case 'signup':
        return (
          <SignUpForm
            onSuccess={handleSuccess}
            onError={handleError}
            onLoginClick={() => setCurrentView('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onSuccess={() => setTimeout(() => setCurrentView('login'), 3000)}
            onError={handleError}
            onBackToLogin={() => setCurrentView('login')}
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordForm
            onSuccess={handleSuccess}
            onError={handleError}
            onBackToLogin={() => setCurrentView('login')}
          />
        );
      default:
        return <LoginForm onSuccess={handleSuccess} onError={handleError} />;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      {renderView()}
    </div>
  );
};

export default AuthContainer;