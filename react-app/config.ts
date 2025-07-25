// Configurações para diferentes ambientes

// Determinar o ambiente atual
const environment = import.meta.env.MODE || 'development';

// Configurações específicas para cada ambiente
const configs = {
  development: {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://fvmkpwouqxnhtmlydjui.supabase.co',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTM4NTAsImV4cCI6MjA2ODQyOTg1MH0.40A7LIRzqSkINx_LYibqvuBkx6cLIo5-qPn3j9VWAm8',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    debug: import.meta.env.VITE_DEBUG === 'true'
  },
  test: {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://fvmkpwouqxnhtmlydjui.supabase.co',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTM4NTAsImV4cCI6MjA2ODQyOTg1MH0.40A7LIRzqSkINx_LYibqvuBkx6cLIo5-qPn3j9VWAm8',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    debug: import.meta.env.VITE_DEBUG === 'true'
  },
  production: {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://fvmkpwouqxnhtmlydjui.supabase.co',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTM4NTAsImV4cCI6MjA2ODQyOTg1MH0.40A7LIRzqSkINx_LYibqvuBkx6cLIo5-qPn3j9VWAm8',
    apiUrl: import.meta.env.VITE_API_URL || 'https://api.seudominio.com',
    debug: import.meta.env.VITE_DEBUG === 'true'
  }
};

// Exportar configuração para o ambiente atual
export default configs[environment as keyof typeof configs];