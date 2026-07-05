# LunaCall

Demo gratuita de chat y videollamada simulada con chicas IA ficticias.

## Requisitos

- Node.js 18+
- npm

## Instalar y ejecutar

```bash
npm install
npm run dev
```

### Para IA real (recomendado)

1. Consigue una API key de xAI (Grok) en https://console.x.ai (recibes $25 gratis al registrarte)
2. Crea un archivo `.env.local` en la raíz del proyecto
3. Añade: `NEXT_PUBLIC_XAI_API_KEY=tu_api_key_aqui`
4. Reinicia el servidor: `npm run dev`

Sin API key las respuestas serán variadas pero predefinidas (demo).

## Imágenes de las chicas

Para que las chicas tengan imágenes realistas:

1. Genera imágenes con Midjourney, Stable Diffusion, DALL-E o similar
2. Guárdalas en `public/girls/` con estos nombres:
   - `luna.jpg`
   - `nia.jpg`
   - `vera.jpg`
   - `alma.jpg`
   - `kira.jpg`
   - `maya.jpg`
3. Formato vertical (ej. 768×1024), JPG, <500KB cada una
4. Si falta alguna imagen se verá un fondo de gradiente

## Desplegar en GitHub Pages

```bash
npm run build
npx serve out -l 3000
```

Para desplegar, sube el contenido de la carpeta `out/` a la rama `gh-pages`.

## Probar

- Chat real con IA: `/chat/luna`
- Videollamada simulada con IA + voz: `/call/luna`
- Personalización: `/customize/luna`
- Galería: `/girls`

## Notas

- Solo +18
- Personajes ficticios generados por IA
- Sin registro, sin anuncios, 100% gratis
