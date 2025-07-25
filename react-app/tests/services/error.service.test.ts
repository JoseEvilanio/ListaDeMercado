import { ErrorService } from '../../services/error.service';

describe('ErrorService', () => {
  describe('formatError', () => {
    it('should format error message string', () => {
      const errorMessage = 'Test error message';
      const formattedError = ErrorService.formatError(errorMessage);
      expect(formattedError).toBe(errorMessage);
    });
    
    it('should format error object with message', () => {
      const error = new Error('Test error message');
      const formattedError = ErrorService.formatError(error);
      expect(formattedError).toBe('Test error message');
    });
    
    it('should handle null or undefined error', () => {
      expect(ErrorService.formatError(null)).toBe('Ocorreu um erro desconhecido');
      expect(ErrorService.formatError(undefined)).toBe('Ocorreu um erro desconhecido');
    });
    
    it('should format Supabase authentication errors', () => {
      const emailNotConfirmedError = { message: 'Email not confirmed' };
      expect(ErrorService.formatError(emailNotConfirmedError)).toBe('Email não confirmado. Verifique sua caixa de entrada.');
      
      const invalidCredentialsError = { message: 'Invalid login credentials' };
      expect(ErrorService.formatError(invalidCredentialsError)).toBe('Credenciais inválidas. Verifique seu email e senha.');
      
      const userAlreadyRegisteredError = { message: 'User already registered' };
      expect(ErrorService.formatError(userAlreadyRegisteredError)).toBe('Este email já está registrado.');
      
      const passwordTooShortError = { message: 'Password should be at least 6 characters' };
      expect(ErrorService.formatError(passwordTooShortError)).toBe('A senha deve ter pelo menos 6 caracteres.');
    });
    
    it('should format Supabase permission errors', () => {
      const rlsError = { message: 'new row violates row-level security' };
      expect(ErrorService.formatError(rlsError)).toBe('Você não tem permissão para realizar esta operação.');
    });
    
    it('should format connection errors', () => {
      const connectionError = { message: 'Failed to fetch' };
      expect(ErrorService.formatError(connectionError)).toBe('Falha na conexão com o servidor. Verifique sua conexão com a internet.');
    });
  });
  
  describe('createError', () => {
    it('should create error with message', () => {
      const error = ErrorService.createError('Test error message');
      expect(error.message).toBe('Test error message');
      expect(error.code).toBeUndefined();
      expect(error.details).toBeUndefined();
    });
    
    it('should create error with message and code', () => {
      const error = ErrorService.createError('Test error message', 'TEST_ERROR');
      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toBeUndefined();
    });
    
    it('should create error with message, code and details', () => {
      const details = { field: 'test', value: 123 };
      const error = ErrorService.createError('Test error message', 'TEST_ERROR', details);
      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual(details);
    });
  });
  
  describe('logError', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    afterEach(() => {
      jest.restoreAllMocks();
    });
    
    it('should log error to console', () => {
      const error = new Error('Test error message');
      ErrorService.logError(error);
      expect(console.error).toHaveBeenCalledWith('Erro:', error, undefined);
    });
    
    it('should log error with context', () => {
      const error = new Error('Test error message');
      const context = { component: 'TestComponent', action: 'testAction' };
      ErrorService.logError(error, context);
      expect(console.error).toHaveBeenCalledWith('Erro:', error, context);
    });
  });
});