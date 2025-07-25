import React, { useState } from 'react';
import { AuthService } from '../../services/auth.service';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  onBackToLogin?: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onError,
  onBackToLogin
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    
    try {
      const { error } = await AuthService.resetPassword(email);
      
      if (error) {
        setError(error.message);
        onError?.(error);
      } else {
        setSuccessMessage(`Um email de redefinição de senha foi enviado para ${email}`);
        onSuccess?.();
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Esqueceu sua senha?</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      
      <p className="mb-4 text-gray-600">
        Digite seu email e enviaremos um link para redefinir sua senha.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar link de redefinição'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-blue-500 hover:text-blue-700 focus:outline-none"
        >
          Voltar para o login
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;