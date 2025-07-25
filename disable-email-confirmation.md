# Como Desabilitar Confirmação de Email no Supabase

## Método 1: Via Dashboard (Recomendado)

1. **Acesse o Dashboard do Supabase**: https://app.supabase.io
2. **Selecione seu projeto**: fvmkpwouqxnhtmlydjui
3. **Vá para Authentication > Settings**
4. **Encontre a seção "User Signups"**
5. **Desabilite "Enable email confirmations"**
6. **Clique em "Save"**

## Método 2: Via Código (Temporário)

Você pode configurar o cliente Supabase para não exigir confirmação:

```javascript
// No arquivo supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fvmkpwouqxnhtmlydjui.supabase.co',
  'sua_anon_key',
  {
    auth: {
      // Configurações de autenticação
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
```

## Método 3: Confirmar Email Programaticamente

Se você tiver a service role key, pode confirmar emails programaticamente:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  'https://fvmkpwouqxnhtmlydjui.supabase.co',
  'sua_service_role_key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Confirmar email do usuário
await supabaseAdmin.auth.admin.updateUserById(
  'user_id_aqui',
  { email_confirm: true }
);
```

## Status Atual

- ✅ **jose_evilanio@hotmail.com** - Email confirmado, pode fazer login
- ⏳ **cometa_jal@hotmail.com** - Usuário criado, aguardando confirmação de email

## Recomendação

Para resolver imediatamente:
1. Use `jose_evilanio@hotmail.com` com senha `Mae@2106`
2. Ou desabilite confirmação de email no Dashboard
3. Ou confirme o email `cometa_jal@hotmail.com` clicando no link enviado por email

## Teste Rápido

Você pode testar com o componente de debug na aplicação:
- Clique em "Testar Login" - deve funcionar
- Use o formulário normal com `jose_evilanio@hotmail.com` - deve funcionar
- Use o formulário normal com `cometa_jal@hotmail.com` - só funciona após confirmação