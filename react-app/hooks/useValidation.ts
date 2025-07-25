import { useState, useCallback } from 'react';
import {
  ValidationService,
  ValidationField,
  ValidationResult,
  ValidationRule,
  ValidationRuleType
} from '../services/validation.service';

interface UseValidationOptions {
  /** Validar automaticamente ao mudar valores */
  validateOnChange?: boolean;
  /** Validar automaticamente ao perder o foco */
  validateOnBlur?: boolean;
  /** Validar todos os campos ao enviar */
  validateAllOnSubmit?: boolean;
}

interface UseValidationResult {
  /** Valores do formulário */
  values: Record<string, any>;
  /** Erros de validação */
  errors: Record<string, string[]>;
  /** Indica se o formulário é válido */
  isValid: boolean;
  /** Indica se o formulário foi tocado */
  touched: Record<string, boolean>;
  /** Atualiza um valor */
  setValue: (name: string, value: any) => void;
  /** Atualiza vários valores */
  setValues: (values: Record<string, any>) => void;
  /** Marca um campo como tocado */
  setTouched: (name: string, isTouched?: boolean) => void;
  /** Marca todos os campos como tocados */
  setAllTouched: (isTouched?: boolean) => void;
  /** Reseta o formulário */
  reset: (newValues?: Record<string, any>) => void;
  /** Valida um campo específico */
  validateField: (name: string) => string[];
  /** Valida todo o formulário */
  validateForm: () => ValidationResult;
  /** Manipulador de envio do formulário */
  handleSubmit: (onSubmit: (values: Record<string, any>) => void) => (e: React.FormEvent) => void;
  /** Manipulador de mudança de campo */
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  /** Manipulador de perda de foco */
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  /** Obtém props para um campo */
  getFieldProps: (name: string) => {
    name: string;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  };
}

/**
 * Hook para validação de formulários
 * @param initialValues Valores iniciais
 * @param fields Campos de validação
 * @param options Opções de validação
 * @returns Funções e estado para validação
 */
const useValidation = (
  initialValues: Record<string, any> = {},
  fields: ValidationField[] = [],
  options: UseValidationOptions = {}
): UseValidationResult => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateAllOnSubmit = true
  } = options;
  
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValid, setIsValid] = useState<boolean>(true);
  
  // Validar um campo específico
  const validateField = useCallback((name: string): string[] => {
    const field = fields.find(f => f.name === name);
    
    if (!field) {
      return [];
    }
    
    const fieldErrors = ValidationService.validateField(
      name,
      values[name],
      field.rules,
      values
    );
    
    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors
    }));
    
    return fieldErrors;
  }, [fields, values]);
  
  // Validar todo o formulário
  const validateForm = useCallback((): ValidationResult => {
    const result = ValidationService.validateForm(values, fields);
    
    setErrors(result.errors);
    setIsValid(result.valid);
    
    return result;
  }, [fields, values]);
  
  // Atualizar um valor
  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validateOnChange && touched[name]) {
      setTimeout(() => validateField(name), 0);
    }
  }, [validateOnChange, touched, validateField]);
  
  // Atualizar vários valores
  const setMultipleValues = useCallback((newValues: Record<string, any>) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
    
    if (validateOnChange) {
      Object.keys(newValues).forEach(name => {
        if (touched[name]) {
          setTimeout(() => validateField(name), 0);
        }
      });
    }
  }, [validateOnChange, touched, validateField]);
  
  // Marcar um campo como tocado
  const setFieldTouched = useCallback((name: string, isTouched: boolean = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched
    }));
    
    if (validateOnBlur && isTouched) {
      setTimeout(() => validateField(name), 0);
    }
  }, [validateOnBlur, validateField]);
  
  // Marcar todos os campos como tocados
  const setAllTouched = useCallback((isTouched: boolean = true) => {
    const newTouched: Record<string, boolean> = {};
    
    fields.forEach(field => {
      newTouched[field.name] = isTouched;
    });
    
    setTouched(newTouched);
    
    if (validateOnBlur && isTouched) {
      setTimeout(() => validateForm(), 0);
    }
  }, [fields, validateOnBlur, validateForm]);
  
  // Resetar o formulário
  const reset = useCallback((newValues: Record<string, any> = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsValid(true);
  }, [initialValues]);
  
  // Manipulador de envio do formulário
  const handleSubmit = useCallback((onSubmit: (values: Record<string, any>) => void) => {
    return (e: React.FormEvent) => {
      e.preventDefault();
      
      if (validateAllOnSubmit) {
        const result = validateForm();
        setAllTouched(true);
        
        if (result.valid) {
          onSubmit(values);
        }
      } else {
        onSubmit(values);
      }
    };
  }, [validateAllOnSubmit, validateForm, setAllTouched, values]);
  
  // Manipulador de mudança de campo
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Tratar tipos especiais
    if (type === 'checkbox') {
      setValue(name, (e.target as HTMLInputElement).checked);
    } else if (type === 'number' || type === 'range') {
      setValue(name, e.target.value === '' ? '' : Number(e.target.value));
    } else {
      setValue(name, value);
    }
  }, [setValue]);
  
  // Manipulador de perda de foco
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setFieldTouched(name, true);
  }, [setFieldTouched]);
  
  // Obter props para um campo
  const getFieldProps = useCallback((name: string) => {
    return {
      name,
      value: values[name] || '',
      onChange: handleChange,
      onBlur: handleBlur
    };
  }, [values, handleChange, handleBlur]);
  
  return {
    values,
    errors,
    isValid,
    touched,
    setValue,
    setValues: setMultipleValues,
    setTouched: setFieldTouched,
    setAllTouched,
    reset,
    validateField,
    validateForm,
    handleSubmit,
    handleChange,
    handleBlur,
    getFieldProps
  };
};

export default useValidation;