import React, { useState, useEffect, useRef } from 'react';
import { ImageOptimizationService, ImageOptimizationOptions } from '../../services/image-optimization.service';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  bucket?: string;
  path?: string;
  width?: number;
  height?: number;
  className?: string;
  optimizationOptions?: Partial<ImageOptimizationOptions>;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componente de imagem otimizada para dispositivos móveis
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  bucket,
  path,
  width,
  height,
  className = '',
  optimizationOptions = {},
  onLoad,
  onError,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [placeholder, setPlaceholder] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Determinar URL da imagem
  const imageUrl = bucket && path
    ? ImageOptimizationService.getOptimizedImageUrl(bucket, path, optimizationOptions)
    : src;
  
  // Obter opções de otimização
  const options = ImageOptimizationService.getOptimizationOptions(optimizationOptions);
  
  // Gerar placeholder
  useEffect(() => {
    if (options.placeholder === 'blur') {
      // Usar placeholder de desfoque
      const blurUrl = ImageOptimizationService.generateBlurPlaceholder(
        imageUrl,
        20,
        20
      );
      setPlaceholder(blurUrl);
    } else if (options.placeholder === 'color') {
      // Usar placeholder de cor
      ImageOptimizationService.generateColorPlaceholder(imageUrl)
        .then(color => setPlaceholder(color))
        .catch(() => setPlaceholder(null));
    }
  }, [imageUrl, options.placeholder]);
  
  // Configurar observador de interseção para lazy loading
  useEffect(() => {
    if (!options.lazy || !imgRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Quando a imagem entrar na viewport, carregar a imagem
            const img = entry.target as HTMLImageElement;
            img.src = imageUrl;
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '200px 0px' } // Começar a carregar quando estiver a 200px da viewport
    );
    
    observer.observe(imgRef.current);
    
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [imageUrl, options.lazy]);
  
  // Manipuladores de eventos
  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };
  
  const handleError = () => {
    setError(true);
    onError?.();
  };
  
  // Estilo para placeholder
  const placeholderStyle: React.CSSProperties = {
    backgroundColor: options.placeholder === 'color' && typeof placeholder === 'string'
      ? placeholder
      : undefined,
    backgroundImage: options.placeholder === 'blur' && placeholder
      ? `url(${placeholder})`
      : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: options.placeholder === 'blur' ? 'blur(10px)' : undefined,
    transition: 'opacity 0.3s ease-in-out'
  };
  
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {!loaded && !error && options.placeholder !== 'none' && (
        <div
          className="absolute inset-0"
          style={placeholderStyle}
        />
      )}
      
      {/* Imagem */}
      <img
        ref={imgRef}
        src={options.lazy ? '' : imageUrl}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading={options.lazy ? 'lazy' : undefined}
        {...props}
      />
      
      {/* Indicador de erro */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-200 dark:bg-neutral-800">
          <span className="text-neutral-500 dark:text-neutral-400 text-sm">
            Erro ao carregar imagem
          </span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;