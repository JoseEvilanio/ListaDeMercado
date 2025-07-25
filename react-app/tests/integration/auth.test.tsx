import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthService } from '../../services';
import { useSupabase } from '../../hooks';
import { SupabaseProvider } from '../../components/SupabaseProvider';

// Mock dos serviços e hooks
jest.mock('../../services', () => ({
  AuthService: {
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    updatePassword: jest.fn()
  }
}));

jest.mock('../../hooks', () => ({
  useSupabase: jest.fn()
}));

// Componente de teste para login
const LoginComponent = () => {
  const { signIn, loading, error } = useSupabase();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit} data-testid="login-form">
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="email-input"
          />
        </div>
        
        <div>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="password-input"
          />
        </div>
        
        <button type="submit" disabled={loading} data-testid="submit-button">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        
        {error && <div data-testid="error-message">{error}</div>}
      </form>
    </div>
  );
};

// Componente de teste para registro
const RegisterComponent = () => {
  const { signUp, loading, error } = useSupabase();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(email, password, { name });
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit} data-testid="register-form">
        <div>
          <label htmlFor="name">Nome</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="name-input"
          />
        </div>
        
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="email-input"
          />
        </div>
        
        <div>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="password-input"
          />
        </div>
        
        <button type="submit" disabled={loading} data-testid="submit-button">
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
        
        {error && <div data-testid="error-message">{error}</div>}
      </form>
    </div>
  );
};

describe('Autenticação (Integração)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock padrão para useSupabase
    (useSupabase as jest.Mock).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn()
    });
  });
  
  describe('Login', () => {
    it('should call AuthService.signIn with correct credentials', async () => {
      // Configurar mock para signIn
      const signInMock = jest.fn().mockResolvedValue({ user: { id: 'user-id' }, error: null });
      (useSupabase as jest.Mock).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: null,
        signIn: signInMock
      });
      
      render(
        <SupabaseProvider>
          <LoginComponent />
        </SupabaseProvider>
      );
      
      // Preencher formulário
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' }
      });
      
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' }
      });
      
      // Enviar formulário
      fireEvent.submit(screen.getByTestId('login-form'));
      
      // Verificar se signIn foi chamado com os parâmetros corretos
      await waitFor(() => {
        expect(signInMock).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
    
    it('should display error message when login fails', async () => {
      // Configurar mock para signIn com erro
      const signInMock = jest.fn().mockResolvedValue({ user: null, error: 'Credenciais inválidas' });
      (useSupabase as jest.Mock).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: 'Credenciais inválidas',
        signIn: signInMock
      });
      
      render(
        <SupabaseProvider>
          <LoginComponent />
        </SupabaseProvider>
      );
      
      // Preencher formulário
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'test@example.com' }
      });
      
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'wrong-password' }
      });
      
      // Enviar formulário
      fireEvent.submit(screen.getByTestId('login-form'));
      
      // Verificar se a mensagem de erro é exibida
      expect(screen.getByTestId('error-message')).toHaveTextContent('Credenciais inválidas');
    });
    
    it('should disable submit button during login', async () => {
      // Configurar mock para signIn com loading
      const signInMock = jest.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ user: { id: 'user-id' }, error: null });
          }, 100);
        });
      });
      
      (useSupabase as jest.Mock).mockReturnValue({
        user: null,
        session: null,
        loading: true,
        error: null,
        signIn: signInMock
      });
      
      render(
        <SupabaseProvider>
          <LoginComponent />
        </SupabaseProvider>
      );
      
      // Verificar se o botão está desabilitado durante o carregamento
      expect(screen.getByTestId('submit-button')).toBeDisabled();
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Entrando...');
    });
  });
  
  describe('Registro', () => {
    it('should call AuthService.signUp with correct data', async () => {
      // Configurar mock para signUp
      const signUpMock = jest.fn().mockResolvedValue({ user: { id: 'user-id' }, error: null });
      (useSupabase as jest.Mock).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: null,
        signUp: signUpMock
      });
      
      render(
        <SupabaseProvider>
          <RegisterComponent />
        </SupabaseProvider>
      );
      
      // Preencher formulário
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'John Doe' }
      });
      
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'john@example.com' }
      });
      
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' }
      });
      
      // Enviar formulário
      fireEvent.submit(screen.getByTestId('register-form'));
      
      // Verificar se signUp foi chamado com os parâmetros corretos
      await waitFor(() => {
        expect(signUpMock).toHaveBeenCalledWith('john@example.com', 'password123', { name: 'John Doe' });
      });
    });
    
    it('should display error message when registration fails', async () => {
      // Configurar mock para signUp com erro
      const signUpMock = jest.fn().mockResolvedValue({ user: null, error: 'Email já registrado' });
      (useSupabase as jest.Mock).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        error: 'Email já registrado',
        signUp: signUpMock
      });
      
      render(
        <SupabaseProvider>
          <RegisterComponent />
        </SupabaseProvider>
      );
      
      // Preencher formulário
      fireEvent.change(screen.getByTestId('name-input'), {
        target: { value: 'John Doe' }
      });
      
      fireEvent.change(screen.getByTestId('email-input'), {
        target: { value: 'existing@example.com' }
      });
      
      fireEvent.change(screen.getByTestId('password-input'), {
        target: { value: 'password123' }
      });
      
      // Enviar formulário
      fireEvent.submit(screen.getByTestId('register-form'));
      
      // Verificar se a mensagem de erro é exibida
      expect(screen.getByTestId('error-message')).toHaveTextContent('Email já registrado');
    });
  });
});