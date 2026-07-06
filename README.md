# LunaCall

Demo de chat y videollamada con chicas IA ficticias con contexto real de conversación.

## Arquitectura

```
GitHub Pages (frontend estático, 100% client-side)
  → Puter.js (IA gratis desde el navegador)
    → xAI / Grok / GPT / Claude
      → respuestas con contexto real
```

No necesita servidor, API keys ni backend. Puter.js usa un modelo "user-pays": el usuario de la web cubre su propio uso de IA. Sin registro obligatorio.

## Requisitos

- Node.js 18+
- npm

## Instalar y ejecutar

```bash
npm install
npm run dev
```

## Desplegar

Pushea a `main` — el workflow despliega automáticamente a GitHub Pages.

## Notas

- Solo +18
- Personajes ficticios generados por IA
- Sin registro, sin anuncios, 100% gratis
