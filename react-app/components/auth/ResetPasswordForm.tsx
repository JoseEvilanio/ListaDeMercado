import React, { useState } from 'react';
import { AuthService } from '../../services/auth.service';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  onBackToLogin?: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSuccess,
  onError,
  onBackToLogin
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    // Validar senha
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await AuthService.updatePassword(password);
      
      if (error) {
        setError(error.message);
        onError?.(error);
      } else {
        setSuccessMessage('Senha atualizada com sucesso!');
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
      <h2 className="text-2xl font-bold mb-6 text-center">Redefinir Senha</h2>
      
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
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Nova Senha
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={6}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
            Confirmar Nova Senha
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {loading ? 'Atualizando...' : 'Atualizar Senha'}
        </button>
      </form>
      
      {successMessage && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-blue-500 hover:text-blue-700 focus:outline-none"
          >
            Voltar para o login
          </button>
        </div>
      )}
    </div>
  );
};

export default ResetPasswordForm;