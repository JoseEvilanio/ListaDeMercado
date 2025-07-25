import { StorageService } from './storage.service';

/**
 * Opções para otimização de imagens
 */
export interface ImageOptimizationOptions {
  /** Largura máxima da imagem */
  maxWidth?: number;
  /** Altura máxima da imagem */
  maxHeight?: number;
  /** Qualidade da imagem (1-100) */
  quality?: number;
  /** Formato da imagem */
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  /** Habilitar carregamento progressivo */
  progressive?: boolean;
  /** Habilitar carregamento lazy */
  lazy?: boolean;
  /** Placeholder a ser exibido durante o carregamento */
  placeholder?: 'blur' | 'color' | 'none';
}

/**
 * Serviço para otimização de imagens
 */
export class ImageOptimizationService {
  /**
   * Opções padrão para otimização de imagens
   */
  private static defaultOptions: ImageOptimizationOptions = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 80,
    format: 'auto',
    progressive: true,
    lazy: true,
    placeholder: 'blur'
  };
  
  /**
   * Opções para dispositivos móveis
   */
  private static mobileOptions: ImageOptimizationOptions = {
    maxWidth: 640,
    maxHeight: 640,
    quality: 75,
    format: 'webp',
    progressive: true,
    lazy: true,
    placeholder: 'blur'
  };
  
  /**
   * Opções para dispositivos com conexão lenta
   */
  private static slowConnectionOptions: ImageOptimizationOptions = {
    maxWidth: 480,
    maxHeight: 480,
    quality: 60,
    format: 'webp',
    progressive: true,
    lazy: true,
    placeholder: 'color'
  };
  
  /**
   * Verifica se o dispositivo é móvel
   * @returns Verdadeiro se for um dispositivo móvel
   */
  private static isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }
  
  /**
   * Verifica se a conexão é lenta
   * @returns Verdadeiro se a conexão for lenta
   */
  private static isSlowConnection(): boolean {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return false;
    }
    
    // @ts-ignore - Propriedade connection não está definida no tipo Navigator
    const connection = navigator.connection;
    
    if (!connection) return false;
    
    // Verificar se a conexão é lenta (2G ou saveData ativado)
    return (
      connection.effectiveType === 'slow-2g' ||
      connection.effectiveType === '2g' ||
      connection.saveData === true
    );
  }
  
  /**
   * Obtém opções de otimização com base no dispositivo e conexão
   * @param customOptions Opções personalizadas
   * @returns Opções de otimização
   */
  static getOptimizationOptions(
    customOptions: Partial<ImageOptimizationOptions> = {}
  ): ImageOptimizationOptions {
    // Determinar opções base com base no dispositivo e conexão
    let baseOptions = this.defaultOptions;
    
    if (this.isSlowConnection()) {
      baseOptions = this.slowConnectionOptions;
    } else if (this.isMobileDevice()) {
      baseOptions = this.mobileOptions;
    }
    
    // Mesclar com opções personalizadas
    return { ...baseOptions, ...customOptions };
  }
  
  /**
   * Gera URL otimizada para uma imagem do Supabase Storage
   * @param bucket Nome do bucket
   * @param path Caminho da imagem
   * @param options Opções de otimização
   * @returns URL otimizada
   */
  static getOptimizedImageUrl(
    bucket: string,
    path: string,
    options: Partial<ImageOptimizationOptions> = {}
  ): string {
    // Obter URL pública da imagem
    const publicUrl = StorageService.getPublicUrl(bucket, path);
    
    // Se não houver URL pública, retornar vazio
    if (!publicUrl) return '';
    
    // Obter opções de otimização
    const opts = this.getOptimizationOptions(options);
    
    // Para imagens do Supabase Storage, podemos usar parâmetros de transformação
    // Nota: O Supabase Storage não suporta transformações de imagem nativamente,
    // então esta é uma simulação. Em um ambiente real, você usaria um serviço como
    // Imgix, Cloudinary ou similar.
    
    // Simular URL de transformação
    let optimizedUrl = publicUrl;
    
    // Em um ambiente real, você adicionaria parâmetros de transformação aqui
    // Por exemplo, com Imgix seria algo como:
    // optimizedUrl += `?w=${opts.maxWidth}&h=${opts.maxHeight}&q=${opts.quality}&fm=${opts.format}`;
    
    return optimizedUrl;
  }
  
  /**
   * Pré-carrega uma imagem
   * @param url URL da imagem
   * @returns Promise que resolve quando a imagem for carregada
   */
  static preloadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
  
  /**
   * Gera um placeholder de cor para uma imagem
   * @param url URL da imagem
   * @returns Promise que resolve com a cor dominante
   */
  static async generateColorPlaceholder(url: string): Promise<string> {
    // Em um ambiente real, você usaria uma biblioteca como color-thief
    // para extrair a cor dominante da imagem
    // Esta é uma implementação simplificada que retorna uma cor aleatória
    
    // Simular atraso de processamento
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Gerar cor aleatória
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    
    return `rgb(${r}, ${g}, ${b})`;
  }
  
  /**
   * Gera um placeholder de desfoque para uma imagem
   * @param url URL da imagem
   * @param width Largura do placeholder
   * @param height Altura do placeholder
   * @returns URL do placeholder
   */
  static generateBlurPlaceholder(
    url: string,
    width: number = 20,
    height: number = 20
  ): string {
    // Em um ambiente real, você geraria uma versão muito pequena da imagem
    // e a codificaria em base64 para usar como placeholder
    // Esta é uma implementação simplificada que retorna a URL original
    
    // Simular URL de placeholder
    // Em um ambiente real, seria algo como:
    // return `${url}?w=${width}&h=${height}&q=10&blur=200`;
    
    return url;
  }
}