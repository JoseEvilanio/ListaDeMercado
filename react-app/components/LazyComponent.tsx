import React, { Suspense, lazy, ComponentType } from 'react';

interface LazyComponentProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  props?: Record<string, any>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

/**
 * Componente para carregamento lazy de outros componentes
 */
const LazyComponent: React.FC<LazyComponentProps> = ({
  component,
  props = {},
  fallback = <DefaultLoadingFallback />,
  errorFallback = <DefaultErrorFallback />
}) => {
  // Usar React.lazy para carregar o componente sob demanda
  const LazyLoadedComponent = lazy(component);
  
  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary fallback={errorFallback}>
        <LazyLoadedComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

/**
 * Componente de fallback padrão para carregamento
 */
const DefaultLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center p-4 min-h-[100px]">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

/**
 * Componente de fallback padrão para erros
 */
const DefaultErrorFallback: React.FC = () => (
  <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
    Erro ao carregar componente. Tente recarregar a página.
  </div>
);

/**
 * Componente de boundary de erro
 */
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}, {
  hasError: boolean;
}> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro em componente lazy:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    
    return this.props.children;
  }
}

export default LazyComponent;