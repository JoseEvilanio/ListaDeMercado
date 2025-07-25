import { ErrorService } from './error.service';

/**
 * Tipos de regras de validação
 */
export enum ValidationRuleType {
  REQUIRED = 'required',
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  PATTERN = 'pattern',
  EMAIL = 'email',
  URL = 'url',
  NUMERIC = 'numeric',
  INTEGER = 'integer',
  DECIMAL = 'decimal',
  MIN = 'min',
  MAX = 'max',
  EQUAL_TO = 'equalTo',
  CUSTOM = 'custom'
}

/**
 * Interface para regra de validação
 */
export interface ValidationRule {
  /** Tipo da regra */
  type: ValidationRuleType;
  /** Valor para comparação (se aplicável) */
  value?: any;
  /** Mensagem de erro personalizada */
  message?: string;
  /** Função de validação personalizada */
  validate?: (value: any, formValues?: Record<string, any>) => boolean;
}

/**
 * Interface para campo de validação
 */
export interface ValidationField {
  /** Nome do campo */
  name: string;
  /** Regras de validação */
  rules: ValidationRule[];
}

/**
 * Interface para resultado de validação
 */
export interface ValidationResult {
  /** Indica se a validação passou */
  valid: boolean;
  /** Erros por campo */
  errors: Record<string, string[]>;
  /** Primeiro erro encontrado */
  firstError?: string;
}

/**
 * Serviço para validação de dados
 */
export class ValidationService {
  /**
   * Mensagens de erro padrão
   */
  private static defaultMessages: Record<ValidationRuleType, string> = {
    [ValidationRuleType.REQUIRED]: 'Este campo é obrigatório',
    [ValidationRuleType.MIN_LENGTH]: 'Este campo deve ter pelo menos {value} caracteres',
    [ValidationRuleType.MAX_LENGTH]: 'Este campo deve ter no máximo {value} caracteres',
    [ValidationRuleType.PATTERN]: 'Este campo não está no formato correto',
    [ValidationRuleType.EMAIL]: 'Digite um email válido',
    [ValidationRuleType.URL]: 'Digite uma URL válida',
    [ValidationRuleType.NUMERIC]: 'Este campo deve conter apenas números',
    [ValidationRuleType.INTEGER]: 'Este campo deve ser um número inteiro',
    [ValidationRuleType.DECIMAL]: 'Este campo deve ser um número decimal',
    [ValidationRuleType.MIN]: 'Este campo deve ser maior ou igual a {value}',
    [ValidationRuleType.MAX]: 'Este campo deve ser menor ou igual a {value}',
    [ValidationRuleType.EQUAL_TO]: 'Este campo deve ser igual a {value}',
    [ValidationRuleType.CUSTOM]: 'Este campo é inválido'
  };
  
  /**
   * Expressões regulares para validação
   */
  private static patterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    numeric: /^[0-9]+$/,
    integer: /^-?[0-9]+$/,
    decimal: /^-?[0-9]+(\.[0-9]+)?$/
  };
  
  /**
   * Valida um valor com base em uma regra
   * @param value Valor a ser validado
   * @param rule Regra de validação
   * @param formValues Valores do formulário (para validação cruzada)
   * @returns Verdadeiro se o valor for válido
   */
  private static validateValue(
    value: any,
    rule: ValidationRule,
    formValues?: Record<string, any>
  ): boolean {
    // Tratar valor nulo ou indefinido
    if (value === null || value === undefined) {
      value = '';
    }
    
    // Converter para string para validação
    const strValue = String(value);
    
    switch (rule.type) {
      case ValidationRuleType.REQUIRED:
        return strValue.trim() !== '';
        
      case ValidationRuleType.MIN_LENGTH:
        return strValue.length >= (rule.value || 0);
        
      case ValidationRuleType.MAX_LENGTH:
        return strValue.length <= (rule.value || 0);
        
      case ValidationRuleType.PATTERN:
        return new RegExp(rule.value).test(strValue);
        
      case ValidationRuleType.EMAIL:
        return this.patterns.email.test(strValue);
        
      case ValidationRuleType.URL:
        return this.patterns.url.test(strValue);
        
      case ValidationRuleType.NUMERIC:
        return this.patterns.numeric.test(strValue);
        
      case ValidationRuleType.INTEGER:
        return this.patterns.integer.test(strValue);
        
      case ValidationRuleType.DECIMAL:
        return this.patterns.decimal.test(strValue);
        
      case ValidationRuleType.MIN:
        return parseFloat(strValue) >= (rule.value || 0);
        
      case ValidationRuleType.MAX:
        return parseFloat(strValue) <= (rule.value || 0);
        
      case ValidationRuleType.EQUAL_TO:
        if (typeof rule.value === 'string' && formValues) {
          // Comparar com outro campo do formulário
          return strValue === String(formValues[rule.value] || '');
        }
        return strValue === String(rule.value || '');
        
      case ValidationRuleType.CUSTOM:
        if (rule.validate) {
          return rule.validate(value, formValues);
        }
        return true;
        
      default:
        return true;
    }
  }
  
  /**
   * Obtém a mensagem de erro para uma regra
   * @param rule Regra de validação
   * @returns Mensagem de erro
   */
  private static getErrorMessage(rule: ValidationRule): string {
    if (rule.message) {
      return rule.message;
    }
    
    let message = this.defaultMessages[rule.type] || 'Campo inválido';
    
    // Substituir placeholders
    if (rule.value !== undefined) {
      message = message.replace('{value}', String(rule.value));
    }
    
    return message;
  }
  
  /**
   * Valida um campo
   * @param name Nome do campo
   * @param value Valor do campo
   * @param rules Regras de validação
   * @param formValues Valores do formulário (para validação cruzada)
   * @returns Lista de erros
   */
  static validateField(
    name: string,
    value: any,
    rules: ValidationRule[],
    formValues?: Record<string, any>
  ): string[] {
    const errors: string[] = [];
    
    for (const rule of rules) {
      const isValid = this.validateValue(value, rule, formValues);
      
      if (!isValid) {
        errors.push(this.getErrorMessage(rule));
      }
    }
    
    return errors;
  }
  
  /**
   * Valida um formulário
   * @param values Valores do formulário
   * @param fields Campos de validação
   * @returns Resultado da validação
   */
  static validateForm(
    values: Record<string, any>,
    fields: ValidationField[]
  ): ValidationResult {
    const errors: Record<string, string[]> = {};
    let valid = true;
    let firstError: string | undefined;
    
    for (const field of fields) {
      const fieldErrors = this.validateField(
        field.name,
        values[field.name],
        field.rules,
        values
      );
      
      if (fieldErrors.length > 0) {
        errors[field.name] = fieldErrors;
        valid = false;
        
        if (!firstError) {
          firstError = fieldErrors[0];
        }
      }
    }
    
    return {
      valid,
      errors,
      firstError
    };
  }
  
  /**
   * Cria uma regra de validação
   * @param type Tipo da regra
   * @param value Valor para comparação (se aplicável)
   * @param message Mensagem de erro personalizada
   * @returns Regra de validação
   */
  static createRule(
    type: ValidationRuleType,
    value?: any,
    message?: string
  ): ValidationRule {
    return { type, value, message };
  }
  
  /**
   * Cria uma regra de validação personalizada
   * @param validate Função de validação
   * @param message Mensagem de erro
   * @returns Regra de validação
   */
  static createCustomRule(
    validate: (value: any, formValues?: Record<string, any>) => boolean,
    message?: string
  ): ValidationRule {
    return {
      type: ValidationRuleType.CUSTOM,
      validate,
      message: message || this.defaultMessages[ValidationRuleType.CUSTOM]
    };
  }
  
  /**
   * Cria uma regra de validação de campo obrigatório
   * @param message Mensagem de erro personalizada
   * @returns Regra de validação
   */
  static required(message?: string): ValidationRule {
    return this.createRule(ValidationRuleType.REQUIRED, undefined, message);
  }
  
  /**
   * Cria uma regra de validação de comprimento mínimo
   * @param length Comprimento mínimo
   * @param message Mensagem de erro personalizada
   * @returns Regra de validação
   */
  static minLength(length: number, message?: string): ValidationRule {
    return this.createRule(ValidationRuleType.MIN_LENGTH, length, message);
  }
  
  /**
   * Cria uma regra de validação de comprimento máximo
   * @param length Comprimento máximo
   * @param message Mensagem de erro personalizada
   * @returns Regra de validação
   */
  static maxLength(length: number, message?: string): ValidationRule {
    return this.createRule(ValidationRuleType.MAX_LENGTH, length, message);
  }
  
  /**
   * Cria uma regra de validação de padrão
   * @param pattern Expressão regular
   * @param message Mensagem de erro personalizada
   * @returns Regra de validação
   */
  static pattern(pattern: RegExp, message?: string): ValidationRule {
    return this.createRule(ValidationRuleType.PATTERN, pattern, message);
  }
  
  /**
   * Cria uma regra de validação de email
   * @param message Mensagem de erro personalizada
   * @returns Regra de validação
   */
  static email(message?: string): ValidationRule {
    return this.createRule(ValidationRuleType.EMAIL, undefined, message);
  }
  
  /**
   * Cria uma regra de validação de URL
   * @param message Mensagem de erro personalizada
   * @returns Regra de validação
   */
  static url(message?: string): ValidationRule {
    return this.createRule(ValidationRuleType.URL, undefined, message);
  }
  
  /**
   * Cria uma regra de validação de valor mínimo
   * @param min Valor mínimo
   * @param message Mensagem de erro personalizada
   * @returns Regra de validação
   */
  static min(min: number, message?: string): ValidationRule {
    return this.createRule(ValidationRuleType.MIN, min, message);
  }
  
  /**
   * Cria uma regra de validação de valor máximo
   * @param max Valor máximo
   * @param message Mensagem de erro personalizada
   * @returns Regra de validação
   */
  static max(max: number, message?: string): ValidationRule {
    return this.createRule(ValidationRuleType.MAX, max, message);
  }
  
  /**
   * Cria uma regra de validação de igualdade
   * @param value Valor para comparação ou nome do campo
   * @param message Mensagem de erro personalizada
   * @returns Regra de validação
   */
  static equalTo(value: any, message?: string): ValidationRule {
    return this.createRule(ValidationRuleType.EQUAL_TO, value, message);
  }
}