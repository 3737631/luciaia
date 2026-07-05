# LunaCall

Demo de chat y videollamada con chicas IA ficticias con contexto real de conversación.

## Arquitectura

```
GitHub Pages (frontend estático)
  → llama a Supabase Edge Function
    → Edge Function llama a xAI API (Grok)
      → respuesta con contexto real
```

## Requisitos

- Node.js 18+
- npm
- Cuenta en [Supabase](https://supabase.com) (plan gratuito)
- API key de [xAI](https://console.x.ai) (con crédito)

## Setup local

### 1. Variables de entorno

Crea `.env.local`:

```bash
# URL de Supabase Edge Functions (local o producción)
NEXT_PUBLIC_SUPABASE_FUNCTION_URL=http://localhost:54321/functions/v1
```

### 2. Supabase Edge Function

```bash
# Instalar Supabase CLI (https://supabase.com/docs/guides/cli)
# Iniciar sesión
supabase login

# Iniciar entorno local
supabase start

# Configurar API key de xAI
supabase secrets set XAI_API_KEY=tu_api_key
supabase secrets set XAI_MODEL=grok-4.3

# Iniciar función local
supabase functions serve chat --no-verify-jwt
```

### 3. Frontend

```bash
npm install
npm run dev
```

## Desplegar

### 1. Supabase (Edge Function)

```bash
# Desplegar la función
supabase functions deploy chat --no-verify-jwt

# Configurar secrets en producción
supabase secrets set XAI_API_KEY=tu_api_key
supabase secrets set XAI_MODEL=grok-4.3
```

### 2. GitHub Pages (frontend)

1. En tu repo de GitHub, ve a Settings > Secrets and variables > Actions > Variables
2. Añade `NEXT_PUBLIC_SUPABASE_FUNCTION_URL` = `https://tu-proyecto.supabase.co/functions/v1`
3. En Settings > Pages, selecciona "GitHub Actions" como origen
4. Pushea a `main` — el workflow despliega automáticamente

## Notas

- Solo +18
- Personajes ficticios generados por IA
- Sin registro, sin anuncios, 100% gratis
- API key de xAI nunca se expone al frontend
