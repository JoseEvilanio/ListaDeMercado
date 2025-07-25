import { ValidationService, ValidationRuleType } from '../../services/validation.service';

describe('ValidationService', () => {
  describe('validateField', () => {
    it('should validate required field', () => {
      const rule = ValidationService.required('Campo obrigatório');
      
      // Campo vazio
      const errors1 = ValidationService.validateField('test', '', [rule]);
      expect(errors1).toHaveLength(1);
      expect(errors1[0]).toBe('Campo obrigatório');
      
      // Campo preenchido
      const errors2 = ValidationService.validateField('test', 'valor', [rule]);
      expect(errors2).toHaveLength(0);
    });
    
    it('should validate minLength field', () => {
      const rule = ValidationService.minLength(3, 'Mínimo 3 caracteres');
      
      // Texto curto
      const errors1 = ValidationService.validateField('test', 'ab', [rule]);
      expect(errors1).toHaveLength(1);
      expect(errors1[0]).toBe('Mínimo 3 caracteres');
      
      // Texto com tamanho mínimo
      const errors2 = ValidationService.validateField('test', 'abc', [rule]);
      expect(errors2).toHaveLength(0);
      
      // Texto mais longo
      const errors3 = ValidationService.validateField('test', 'abcde', [rule]);
      expect(errors3).toHaveLength(0);
    });
    
    it('should validate maxLength field', () => {
      const rule = ValidationService.maxLength(5, 'Máximo 5 caracteres');
      
      // Texto dentro do limite
      const errors1 = ValidationService.validateField('test', 'abc', [rule]);
      expect(errors1).toHaveLength(0);
      
      // Texto no limite
      const errors2 = ValidationService.validateField('test', 'abcde', [rule]);
      expect(errors2).toHaveLength(0);
      
      // Texto além do limite
      const errors3 = ValidationService.validateField('test', 'abcdef', [rule]);
      expect(errors3).toHaveLength(1);
      expect(errors3[0]).toBe('Máximo 5 caracteres');
    });
    
    it('should validate email field', () => {
      const rule = ValidationService.email('Email inválido');
      
      // Email válido
      const errors1 = ValidationService.validateField('test', 'test@example.com', [rule]);
      expect(errors1).toHaveLength(0);
      
      // Email inválido
      const errors2 = ValidationService.validateField('test', 'test@', [rule]);
      expect(errors2).toHaveLength(1);
      expect(errors2[0]).toBe('Email inválido');
      
      const errors3 = ValidationService.validateField('test', 'test.com', [rule]);
      expect(errors3).toHaveLength(1);
      expect(errors3[0]).toBe('Email inválido');
    });
    
    it('should validate pattern field', () => {
      const rule = ValidationService.pattern(/^[A-Z][a-z]+$/, 'Formato inválido');
      
      // Padrão válido
      const errors1 = ValidationService.validateField('test', 'Nome', [rule]);
      expect(errors1).toHaveLength(0);
      
      // Padrão inválido
      const errors2 = ValidationService.validateField('test', 'nome', [rule]);
      expect(errors2).toHaveLength(1);
      expect(errors2[0]).toBe('Formato inválido');
    });
    
    it('should validate numeric field', () => {
      const rule = ValidationService.createRule(ValidationRuleType.NUMERIC, undefined, 'Deve ser numérico');
      
      // Valor numérico
      const errors1 = ValidationService.validateField('test', '123', [rule]);
      expect(errors1).toHaveLength(0);
      
      // Valor não numérico
      const errors2 = ValidationService.validateField('test', '123a', [rule]);
      expect(errors2).toHaveLength(1);
      expect(errors2[0]).toBe('Deve ser numérico');
    });
    
    it('should validate min value', () => {
      const rule = ValidationService.min(18, 'Deve ser maior ou igual a 18');
      
      // Valor abaixo do mínimo
      const errors1 = ValidationService.validateField('test', '17', [rule]);
      expect(errors1).toHaveLength(1);
      expect(errors1[0]).toBe('Deve ser maior ou igual a 18');
      
      // Valor igual ao mínimo
      const errors2 = ValidationService.validateField('test', '18', [rule]);
      expect(errors2).toHaveLength(0);
      
      // Valor acima do mínimo
      const errors3 = ValidationService.validateField('test', '19', [rule]);
      expect(errors3).toHaveLength(0);
    });
    
    it('should validate max value', () => {
      const rule = ValidationService.max(100, 'Deve ser menor ou igual a 100');
      
      // Valor abaixo do máximo
      const errors1 = ValidationService.validateField('test', '99', [rule]);
      expect(errors1).toHaveLength(0);
      
      // Valor igual ao máximo
      const errors2 = ValidationService.validateField('test', '100', [rule]);
      expect(errors2).toHaveLength(0);
      
      // Valor acima do máximo
      const errors3 = ValidationService.validateField('test', '101', [rule]);
      expect(errors3).toHaveLength(1);
      expect(errors3[0]).toBe('Deve ser menor ou igual a 100');
    });
    
    it('should validate equalTo field', () => {
      const rule = ValidationService.equalTo('password', 'As senhas não conferem');
      
      // Valores iguais
      const errors1 = ValidationService.validateField(
        'confirmPassword',
        'senha123',
        [rule],
        { password: 'senha123' }
      );
      expect(errors1).toHaveLength(0);
      
      // Valores diferentes
      const errors2 = ValidationService.validateField(
        'confirmPassword',
        'senha456',
        [rule],
        { password: 'senha123' }
      );
      expect(errors2).toHaveLength(1);
      expect(errors2[0]).toBe('As senhas não conferem');
    });
    
    it('should validate custom rule', () => {
      const rule = ValidationService.createCustomRule(
        (value) => value.includes('@') && value.includes('.'),
        'Formato inválido'
      );
      
      // Valor válido
      const errors1 = ValidationService.validateField('test', 'test@example.com', [rule]);
      expect(errors1).toHaveLength(0);
      
      // Valor inválido
      const errors2 = ValidationService.validateField('test', 'test.com', [rule]);
      expect(errors2).toHaveLength(1);
      expect(errors2[0]).toBe('Formato inválido');
    });
    
    it('should validate multiple rules', () => {
      const rules = [
        ValidationService.required('Campo obrigatório'),
        ValidationService.minLength(3, 'Mínimo 3 caracteres'),
        ValidationService.maxLength(10, 'Máximo 10 caracteres')
      ];
      
      // Campo vazio (falha na primeira regra)
      const errors1 = ValidationService.validateField('test', '', rules);
      expect(errors1).toHaveLength(1);
      expect(errors1[0]).toBe('Campo obrigatório');
      
      // Campo muito curto (falha na segunda regra)
      const errors2 = ValidationService.validateField('test', 'ab', rules);
      expect(errors2).toHaveLength(1);
      expect(errors2[0]).toBe('Mínimo 3 caracteres');
      
      // Campo muito longo (falha na terceira regra)
      const errors3 = ValidationService.validateField('test', 'abcdefghijk', rules);
      expect(errors3).toHaveLength(1);
      expect(errors3[0]).toBe('Máximo 10 caracteres');
      
      // Campo válido
      const errors4 = ValidationService.validateField('test', 'abcdef', rules);
      expect(errors4).toHaveLength(0);
    });
  });
  
  describe('validateForm', () => {
    it('should validate form with multiple fields', () => {
      const fields = [
        {
          name: 'name',
          rules: [ValidationService.required('Nome é obrigatório')]
        },
        {
          name: 'email',
          rules: [
            ValidationService.required('Email é obrigatório'),
            ValidationService.email('Email inválido')
          ]
        },
        {
          name: 'age',
          rules: [
            ValidationService.min(18, 'Deve ser maior de idade')
          ]
        }
      ];
      
      // Formulário válido
      const validForm = {
        name: 'João',
        email: 'joao@example.com',
        age: '20'
      };
      
      const validResult = ValidationService.validateForm(validForm, fields);
      expect(validResult.valid).toBe(true);
      expect(validResult.errors).toEqual({});
      
      // Formulário inválido
      const invalidForm = {
        name: '',
        email: 'email-invalido',
        age: '17'
      };
      
      const invalidResult = ValidationService.validateForm(invalidForm, fields);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toHaveProperty('name');
      expect(invalidResult.errors).toHaveProperty('email');
      expect(invalidResult.errors).toHaveProperty('age');
      expect(invalidResult.errors.name).toContain('Nome é obrigatório');
      expect(invalidResult.errors.email).toContain('Email inválido');
      expect(invalidResult.errors.age).toContain('Deve ser maior de idade');
    });
  });
});