# 📱 Mobile Device Database

> Aplicativo web responsivo para gerenciamento de listas de compras com design moderno e funcionalidades avançadas

![Status](https://img.shields.io/badge/Status-Concluído-brightgreen)
![React](https://img.shields.io/badge/React-18.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-cyan)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)

## ✨ Características Principais

### 🎨 **Interface Moderna**
- **Glassmorphism Design**: Efeitos visuais modernos com transparência e blur
- **Responsivo**: Adaptado para desktop, tablet e mobile
- **Animações Suaves**: Transições e hover effects em todos os elementos
- **Dark Theme**: Interface escura elegante com gradientes

### 🔐 **Sistema de Autenticação**
- **Login/Registro**: Sistema completo com Supabase Auth
- **Sessão Persistente**: Mantém usuário logado entre sessões
- **Recuperação de Senha**: Funcionalidade de reset de senha
- **Perfis de Usuário**: Gerenciamento de dados do usuário

### 🛒 **Gerenciamento de Listas**
- **Criar Listas**: Interface intuitiva para novas listas
- **Adicionar Produtos**: Campo otimizado com validação
- **Editar Itens**: Edição inline de nomes e preços
- **Sistema de Carrinho**: Marcar itens como comprados
- **Cálculo Automático**: Total da lista atualizado em tempo real

### 📊 **Funcionalidades Avançadas**
- **Venda por Peso**: Suporte a produtos vendidos por kg
- **Quantidades**: Controle de quantidade por produto
- **Preços Flexíveis**: Preço unitário ou por peso
- **Progresso Visual**: Barra de progresso da lista
- **Estatísticas**: Métricas detalhadas por lista

### 🔧 **Recursos Técnicos**
- **Offline First**: Funciona mesmo sem conexão
- **Real-time**: Atualizações em tempo real
- **Debug Tools**: Ferramentas avançadas de debug
- **Performance**: Otimizado para dispositivos móveis
- **PWA Ready**: Preparado para Progressive Web App

## 🚀 Tecnologias Utilizadas

### **Frontend**
- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de estilos
- **Vite** - Build tool e dev server
- **Lucide React** - Ícones modernos

### **Backend**
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Row Level Security** - Segurança de dados
- **Real-time Subscriptions** - Atualizações em tempo real

### **Ferramentas**
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **Git** - Controle de versão

## 📦 Instalação e Execução

### **Pré-requisitos**
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### **1. Clone o Repositório**
```bash
git clone https://github.com/SEU_USUARIO/mobile-device-database.git
cd mobile-device-database
```

### **2. Instale as Dependências**
```bash
npm install
```

### **3. Configure as Variáveis de Ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas credenciais do Supabase
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### **4. Execute o Projeto**
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

### **5. Acesse a Aplicação**
- **Desenvolvimento**: http://localhost:5173
- **Produção**: Após build, servir a pasta `dist`

## 🗄️ Estrutura do Banco de Dados

### **Tabelas Principais**

#### **users**
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- name (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### **shopping_lists**
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- name (VARCHAR)
- total_amount (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### **shopping_items**
```sql
- id (BIGSERIAL, PK)
- shopping_list_id (UUID, FK)
- name (VARCHAR)
- quantity (INTEGER)
- price (DECIMAL)
- is_in_cart (BOOLEAN)
- is_sold_by_weight (BOOLEAN)
- weight_kg (DECIMAL)
- price_per_kg (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🎯 Funcionalidades Implementadas

### ✅ **Autenticação**
- [x] Sistema de login/registro
- [x] Recuperação de senha
- [x] Sessão persistente
- [x] Logout seguro

### ✅ **Listas de Compras**
- [x] Criar novas listas
- [x] Visualizar listas existentes
- [x] Editar nomes das listas
- [x] Excluir listas

### ✅ **Gerenciamento de Itens**
- [x] Adicionar produtos
- [x] Editar nomes e preços
- [x] Marcar como comprado
- [x] Remover itens
- [x] Suporte a venda por peso
- [x] Controle de quantidades

### ✅ **Interface e UX**
- [x] Design responsivo
- [x] Animações suaves
- [x] Feedback visual
- [x] Estados de loading
- [x] Tratamento de erros

### ✅ **Performance e Confiabilidade**
- [x] Otimizações de performance
- [x] Sistema de fallback
- [x] Cache inteligente
- [x] Tratamento de offline

## 📱 Screenshots

### **Tela de Login**
Interface moderna com gradientes e glassmorphism

### **Lista de Compras**
Visualização organizada com progresso e estatísticas

### **Adicionar Produtos**
Campo otimizado com validação e feedback

### **Gerenciar Itens**
Controles intuitivos para preço, quantidade e peso

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**José Evilânio**
- Email: jose_evilanio@hotmail.com
- GitHub: [@SEU_USUARIO](https://github.com/SEU_USUARIO)

## 🙏 Agradecimentos

- **Supabase** - Backend as a Service incrível
- **Tailwind CSS** - Framework de estilos fantástico
- **Lucide** - Ícones lindos e consistentes
- **React Team** - Por uma biblioteca incrível

---

⭐ **Se este projeto foi útil para você, considere dar uma estrela!**