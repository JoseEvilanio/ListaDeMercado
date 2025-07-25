/**
 * Configuração do Supabase
 * 
 * Este arquivo contém as configurações necessárias para conectar ao projeto Supabase.
 */

const SUPABASE_URL = 'https://fvmkpwouqxnhtmlydjui.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2bWtwd291cXhuaHRtbHlkanVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NTM4NTAsImV4cCI6MjA2ODQyOTg1MH0.40A7LIRzqSkINx_LYibqvuBkx6cLIo5-qPn3j9VWAm8';

// Configurações para diferentes ambientes
const config = {
  development: {
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
  },
  test: {
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
  },
  production: {
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
  }
};

// Determinar o ambiente atual
const environment = process.env.NODE_ENV || 'development';

// Exportar configuração para o ambiente atual
module.exports = config[environment];