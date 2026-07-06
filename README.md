# LunaCall

Demo de chat y videollamada con chicas IA ficticias con contexto real de conversación.

## Arquitectura

```
GitHub Pages (frontend estático)
  → Supabase Edge Function
    → xAI API (Grok)
      → respuestas con IA real
```

## Setup

### 1. Supabase

Crea un proyecto gratis en [supabase.com](https://supabase.com). Luego:

```bash
# Instalar Supabase CLI
# https://supabase.com/docs/guides/cli

# Iniciar sesión
supabase login

# Desplegar la función chat
supabase functions deploy chat --no-verify-jwt

# Guardar la API key de xAI como secreto
supabase secrets set XAI_API_KEY=tu_api_key
supabase secrets set XAI_MODEL=grok-4.3
```

### 2. Variables de entorno

En GitHub, ve a Settings > Secrets and variables > Actions > Variables y añade:

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_FUNCTION_URL` | `https://tu-proyecto.supabase.co/functions/v1` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu anon key pública (Settings > API) |

Para desarrollo local, crea `.env.local`:

```
NEXT_PUBLIC_SUPABASE_FUNCTION_URL=http://localhost:54321/functions/v1
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 3. Frontend

```bash
npm install
npm run dev
```

### 4. Desplegar

Pushea a `main` — el workflow despliega automáticamente a GitHub Pages.

## Notas

- Solo +18
- Personajes ficticios generados por IA
- Sin registro, sin anuncios, 100% gratis
- API key de xAI guardada en Supabase (nunca en el frontend)
