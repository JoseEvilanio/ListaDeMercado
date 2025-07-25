import React, { useState } from 'react';
import { Card, Button, ErrorFeedback, FormField } from '../ui';
import { useValidation } from '../../hooks';
import { ValidationService, ValidationRuleType } from '../../services/validation.service';

/**
 * Componente de exemplo para demonstrar o uso do serviço de validação
 */
const ValidationExample: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  // Configurar validação
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldProps,
    setTouched,
    reset
  } = useValidation(
    {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: '',
      terms: false
    },
    [
      {
        name: 'name',
        rules: [
          ValidationService.required('Nome é obrigatório'),
          ValidationService.minLength(3, 'Nome deve ter pelo menos 3 caracteres')
        ]
      },
      {
        name: 'email',
        rules: [
          ValidationService.required('Email é obrigatório'),
          ValidationService.email('Email inválido')
        ]
      },
      {
        name: 'password',
        rules: [
          ValidationService.required('Senha é obrigatória'),
          ValidationService.minLength(6, 'Senha deve ter pelo menos 6 caracteres'),
          ValidationService.createCustomRule(
            value => /[A-Z]/.test(value) && /[0-9]/.test(value),
            'Senha deve conter pelo menos uma letra maiúscula e um número'
          )
        ]
      },
      {
        name: 'confirmPassword',
        rules: [
          ValidationService.required('Confirmação de senha é obrigatória'),
          ValidationService.equalTo('password', 'Senhas não conferem')
        ]
      },
      {
        name: 'age',
        rules: [
          ValidationService.required('Idade é obrigatória'),
          ValidationService.pattern(/^\d+$/, 'Idade deve ser um número'),
          ValidationService.min(18, 'Você deve ter pelo menos 18 anos')
        ]
      },
      {
        name: 'terms',
        rules: [
          ValidationService.createCustomRule(
            value => value === true,
            'Você deve aceitar os termos'
          )
        ]
      }
    ],
    {
      validateOnChange: true,
      validateOnBlur: true,
      validateAllOnSubmit: true
    }
  );
  
  // Enviar formulário
  const onSubmit = (values: Record<string, any>) => {
    setFormSubmitted(true);
    
    // Simular envio para API
    setTimeout(() => {
      setSubmitResult({
        success: true,
        message: 'Formulário enviado com sucesso!'
      });
      
      console.log('Valores do formulário:', values);
    }, 1000);
  };
  
  // Resetar formulário
  const handleReset = () => {
    reset();
    setFormSubmitted(false);
    setSubmitResult(null);
  };
  
  return (
    <Card>
      <Card.Header>
        <h2 className="text-xl font-semibold">Exemplo de Validação</h2>
      </Card.Header>
      
      <Card.Body>
        <p className="mb-4">
          Este exemplo demonstra o uso do serviço de validação para validar formulários.
        </p>
        
        {submitResult && (
          <ErrorFeedback
            message={submitResult.message}
            type={submitResult.success ? 'info' : 'error'}
            className="mb-4"
          />
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="name"
            label="Nome"
            placeholder="Digite seu nome"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            errors={errors.name}
            touched={touched.name}
            required
          />
          
          <FormField
            name="email"
            type="email"
            label="Email"
            placeholder="Digite seu email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            errors={errors.email}
            touched={touched.email}
            required
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="password"
              type="password"
              label="Senha"
              placeholder="Digite sua senha"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              errors={errors.password}
              touched={touched.password}
              required
              helpText="Mínimo 6 caracteres, uma letra maiúscula e um número"
            />
            
            <FormField
              name="confirmPassword"
              type="password"
              label="Confirmar Senha"
              placeholder="Confirme sua senha"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              errors={errors.confirmPassword}
              touched={touched.confirmPassword}
              required
            />
          </div>
          
          <FormField
            name="age"
            type="number"
            label="Idade"
            placeholder="Digite sua idade"
            value={values.age}
            onChange={handleChange}
            onBlur={handleBlur}
            errors={errors.age}
            touched={touched.age}
            required
          />
          
          <FormField
            name="terms"
            type="checkbox"
            label="Eu aceito os termos e condições"
            value={values.terms}
            onChange={handleChange}
            onBlur={handleBlur}
            errors={errors.terms}
            touched={touched.terms}
            required
          />
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={formSubmitted && !submitResult}
            >
              Limpar
            </Button>
            <Button
              type="submit"
              disabled={formSubmitted && !submitResult}
            >
              {formSubmitted && !submitResult ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
};

export default ValidationExample;