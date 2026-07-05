# LunaCall

Demo de chat y videollamada con chicas IA ficticias con contexto real de conversación.

## Requisitos

- Node.js 18+
- npm

## Instalar y ejecutar

```bash
npm install
npm run dev
```

### API Key de xAI (Grok)

Para que funcione la IA real con contexto:

1. Crea una cuenta en https://console.x.ai y añade crédito
2. Crea un archivo `.env.local` en la raíz del proyecto
3. Añade:

```
XAI_API_KEY=tu_api_key
XAI_MODEL=grok-4.3
```

4. Reinicia el servidor: `npm run dev`

**Importante**: `XAI_API_KEY` solo se usa desde el servidor (API route), nunca desde el frontend. No uses `NEXT_PUBLIC_` para esta variable.

Sin API key, la web usa respuestas locales de relleno sin contexto real.

## Arquitectura

- `POST /api/chat` — API route que llama a Grok con el historial completo
- `src/lib/memory.ts` — sistema de memoria en localStorage por chica
- `src/components/ChatWindow.tsx` — chat con contexto real
- `src/components/CallScreen.tsx` — videollamada con contexto real + voz

En cada mensaje se envía al servidor:
- Mensaje actual
- Últimos 20 mensajes de historial
- Resumen de conversación
- Memoria sobre el usuario extraída automáticamente
- Datos y personalización de la chica

## Desplegar

```bash
npm run build
npm start
```

Para desplegar, usa un host que soporte Next.js API routes (Vercel, Railway, etc.). No funciona en GitHub Pages porque necesita un servidor Node.js.

## Notas

- Solo +18
- Personajes ficticios generados por IA
- Sin registro, sin anuncios, 100% gratis
