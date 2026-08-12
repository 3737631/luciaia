# REGLA CRÍTICA — NUNCA RESTAURAR VERSIONES ANTIGUAS

Este proyecto tiene una única fuente de verdad: el estado ACTUAL del repositorio (HEAD).

Está terminantemente prohibido recuperar código de:
- commits antiguos
- ramas de recuperación, backup o temporales
- snapshots
- deploys antiguos
- artefactos de GitHub Pages

salvo que el usuario escriba **literalmente**: `"RESTAURA EL COMMIT XXXXX"`

- No interpretes, no deduzcas, no busques versiones "parecidas", no uses ramas equivalentes.
- No hagas rollback automático.
- Si la tarea es modificar una pantalla, componente o función, trabaja SIEMPRE sobre HEAD.
- Nunca cambies de commit, hagas checkout de otro commit, ni cambies la rama activa.
- Nunca reconstruyas el proyecto usando una versión anterior como base.
- Antes de modificar cualquier archivo: identifica HEAD actual, verifica que los archivos pertenecen a ese commit, trabaja solo sobre esa versión.
- Si crees que debes recuperar una versión anterior → DETENTE y pregunta primero.

## GitHub Pages NO es fuente de verdad

Los deploys, artefactos de Pages y ramas de recuperación nunca deben usarse para reconstruir el proyecto. El deploy solo es consecuencia del código actual.

## Protección contra regresiones

Antes de finalizar cualquier tarea:
1. Compara el diff contra HEAD.
2. Verifica que solo cambiaron los archivos necesarios.
3. Verifica que no reapareció código antiguo.
4. Verifica que ningún estilo, componente o comportamiento ha retrocedido.
5. Si detectas cualquier regresión, corrígela antes de terminar.

Nunca entregues una versión visual o funcionalmente más antigua que la existente antes de empezar la tarea.

# CAMBIOS INCREMENTALES (OBLIGATORIO)

Este proyecto está en una fase de refinado.

El objetivo NO es reescribir componentes.

El objetivo es realizar cambios mínimos, precisos y seguros.

## Antes de modificar código

Antes de editar cualquier archivo debes:
1. Leer completamente el archivo.
2. Entender su comportamiento actual.
3. Identificar exactamente qué parte necesita cambiar.
4. Confirmar mentalmente que el resto del archivo debe permanecer igual.

No está permitido editar un archivo sin haber leído primero su contenido actual.

## Cambios mínimos

Está prohibido:
- Reescribir un componente completo para solucionar un problema pequeño.
- Reformatear archivos enteros.
- Mover código sin necesidad.
- Cambiar estilos no relacionados.
- Cambiar nombres de variables sin motivo.
- Modificar imports innecesariamente.
- Introducir refactorizaciones durante una tarea funcional.

Solo puede modificarse aquello estrictamente necesario para cumplir la petición del usuario.

## Protección contra regresiones (refuerzo)

Antes de finalizar una tarea debes comprobar:
- que el cambio solicitado funciona;
- que ningún comportamiento existente ha desaparecido;
- que ningún estilo ha cambiado sin haberlo pedido;
- que ningún botón ha cambiado de posición;
- que ninguna animación ha cambiado;
- que ningún texto ha cambiado;
- que ningún espaciado ha cambiado.

Si detectas cualquier regresión, debes corregirla antes de terminar.

## Verificación visual obligatoria

En cualquier cambio de interfaz debes realizar una revisión visual.
Comprueba:
- alineaciones;
- espaciados;
- tamaños;
- jerarquía visual;
- colores;
- tipografía;
- iconos;
- animaciones.

No des por terminada una tarea únicamente porque compile.

## No improvisar

Si una petición afecta a un único componente:
No modifiques otros componentes.

Si necesitas modificar más de tres archivos:
Detente.
Explica por qué.
Espera confirmación del usuario.

## PROHIBIDO REGENERAR COMPONENTES

En este proyecto no existe el concepto de "restaurar" un componente.
No existe el concepto de "reescribir" un componente.
No existe el concepto de "regenerar" una pantalla.

Toda modificación debe realizarse sobre la implementación existente.

Si durante una tarea detectas que vas a sustituir más del 20% del contenido de un archivo:
DETENTE.
Explica por qué.
Solicita confirmación del usuario antes de continuar.

En caso contrario, aplica únicamente cambios incrementales.

## PROHIBIDO CAMBIOS MASIVOS

Si un cambio solicitado consiste en:
- mover un botón,
- cambiar un color,
- modificar un espaciado,
- corregir una animación,
- arreglar una llamada,

está prohibido:
- reescribir el componente;
- cambiar la estructura JSX;
- cambiar nombres de clases;
- cambiar variables;
- mover elementos del DOM;
- cambiar la arquitectura.

Solo puede modificarse aquello estrictamente necesario para cumplir la petición.

## Prohibición de reescritura sin autorización

Está prohibido reescribir un bloque grande sin autorización expresa del usuario.
Si la solución requiere sustituir una parte importante del archivo, debo detenerme antes de escribir una sola línea y explicar por qué un cambio incremental no es suficiente.

## Estado actual

La única fuente de verdad es el contenido ACTUAL del repositorio.

Nunca reconstruyas una implementación utilizando recuerdos de conversaciones anteriores.
Nunca recrees una interfaz desde cero cuando únicamente se ha solicitado una mejora.
Siempre modifica la implementación existente.

## Regla de una tarea = un objetivo

Cada petición del usuario tiene un único objetivo.

No aproveches una tarea para mejorar otras partes del proyecto.

No reorganices.
No limpies código.
No simplifiques.
No rediseñes.
No modernices.
No optimices.

A menos que el usuario lo solicite expresamente.

Si durante una tarea detectas algo mejorable, NO lo cambies.
Menciónalo al usuario y espera aprobación.

## Calidad

Antes de finalizar, pregúntate:
¿Si el usuario no conociera el cambio realizado, notaría alguna diferencia no solicitada?
Si la respuesta es sí, el trabajo NO está terminado.

---

# CONTEXTO REAL DEL PROYECTO (verificado a 2026-08-12, HEAD b971ada)

## Qué es Nuvia (nombre interno del paquete: `lunacall`)

NuviaChat: web estática (Next.js exportada) de chat/videollamada con personajes ficticios +18 generados por IA. Sin registro, sin anuncios. Frontend en GitHub Pages → Edge Functions de Supabase → servicios de IA externos. **No hay base de datos**: la memoria viva del usuario vive 100% en `localStorage`/`sessionStorage` del navegador.

## Arquitectura

```
GitHub Pages (out/ estático)        https://github.com/3737631/luciaia (Pages: /luciaia)
  └─ Supabase Edge Functions (proyecto Supabase real, sin JWT)
       ├─ /chat      → OpenRouter → texto IA (chica)
       ├─ /imagine   → cadena de generadores de imagen (ver abajo)
       └─ /voice     → STT (Groq) + TTS (Edge TTS → ElevenLabs → Google TTS)
```

Flujo chat: `src/app/chat/[id]` → `ChatWindow` → `src/lib/chatClient.sendChatMessage` → POST `/chat` → OpenRouter → respuesta se guarda en localStorage (historial, memoria, resumen).

Flujo llamada: `src/app/call/[id]` → `CallScreen` (WebAudio, MediaRecorder, SpeechRecognition nativo) → captura audio → `voiceClient.sttAudio` → `/voice` (Groq whisper) → `chatClient.sendChatMessage` → `/chat` → `voiceClient.ttsText` → `/voice` (TTS). La "videollamada" es simulada (tu cámara en miniatura + retrato de la IA con anillo animado).

## Estructura de carpetas

- `src/app/` — páginas App Router: `/` (redirige a `/girls`), `girls`, `chicos`, `anime`, `chat/[id]`, `call/[id]`, `customize/[id]`, `history`, `age`, `age-notice`, `info`, `privacy`, `terms`, `not-found`.
- `src/components/` — UI. Importante: `ChatWindow`, `CallScreen` (2117 líneas, llamada simulada), `CreateYourGirl` (wizard crear-fantasía, usa `/imagine`), `GirlCard`, `StoriesRow`/`StoryViewer` (stories estilo Instagram), `CustomizeClient`, `Header`, `BottomNav`, `Avatar`, `AgeGate`, `FantasyCTA`, `RetryImage`, `HeroShowcaseCarousel`, etc.
- `src/data/girls.ts` — único catálogo de personajes (26): 21 mujeres, 2 hombres (axel, liam), 3 "anime" (maya, iris, yuki). Campos clave: `cloudinaryImage`, `defaultHair/Pose/Background`, `storyImages` (arrays), `voiceLineExamples`, `style`, `personality`.
- `src/lib/` — `ai.ts` (fallback offline), `chatClient.ts`, `voiceClient.ts`, `memory.ts` (localStorage, patrones de memoria, summary), `storage.ts` (customización + chicas personalizadas), `images.ts` + `image-manifest.ts`, `getDailyStoryIndex.ts` (selección diaria deterministic por fecha), `preloadImage.ts` (caché módulo), `storySeenService.ts`, `storyInteractionsService.ts`.
- `src/hooks/` — `useStoryProgress.ts`, `useVisualViewport.ts`.
- `supabase/functions/{chat,imagine,voice}/index.ts` — Deno Edge Functions. Se despliegan con `supabase functions deploy`.
- `public/` — assets estáticos: `girls/<id>/<hair>_<pose>_<bg>.jpg`, carpetas `*_stories/` (imágenes diarias), `hero-banner*.png`, `fantasy-neon.jpg`, `_headers`, `.nojekyll`.
- `scripts/` — generadores de imágenes offline (FLUX/HF, µltiples lorees de gen), `build-manifest.mjs` regenera `src/lib/image-manifest.ts`, `check-faces.mjs`, `fix-bad-faces.mjs`, `deploy-supabase.sh`.
- `deploy.ps1` — deploy manual legacy a `gh-pages` (NO usar: Pages se despliega por CI; y la regla dice que Pages/artefactos NO son fuente de verdad).
- `out/`, `.next/`, `_next/`, `age/`, `chat/`, `call/` (raíz) — artefactos de build/export commitados o locales. Se ignoran en `.gitignore` (`out`, `.next`) pero `_next/` y carpetas de páginas estáticas sí están trackeadas en HEAD (restos de exports antiguos). NO editarlos.

## Tecnologías

Next.js 14.2.5 (App Router, `output: "export"`, basePath `/luciaia`), React 18, TypeScript, Tailwind CSS + variables CSS en `globals.css` (colores: `--bg #111`, `--pink #FF5798`), framer-motion, lucide-react, `@vladmandic/face-api` + tensorflow (solo en scripts de comprobación de rostros), `replicate` y `@huggingface/inference` (deps instaladas, usadas en scripts de imagen).

## APIs y servicios externos (todos vía Edge Functions o scripts)

| Función | Uso | Secretos env |
|---|---|---|
| OpenRouter `/chat` | texto de la chica (modelo `OPENROUTER_MODEL`, default `openai/gpt-4o-mini`) | `OPENROUTER_API_KEY` |
| Groq `/voice` (stt) | transcripción whisper-large-v3, idioma `es` | `GROQ_API_KEY`, `STT_MODEL` |
| Edge TTS (`npm:edge-tts-universal`) `/voice` (tts) | TTS primario gratis, voces es-MX/es-ES/... map `VOICE_MAP` | — |
| ElevenLabs `/voice` (tts) | fallback si key real (`sk_...`) | `ELEVENLABS_API_KEY` |
| Google Translate TTS `/voice` (tts) | fallback final | — |
| Pollinations `/imagine` | generación realista principal (modelo `sana` vía `pollinationsGenerate`) | — |
| Hugging Face (nscale + hf-inference) `/imagine` | fallbacks (`FLUX.1-schnell`, `stable-diffusion-3-medium`) | `HUGGINGFACE_TOKEN` (obligatorio: la función devuelve 500 si falta) |
| SiliconFlow `/imagine` | FLUX.1-dev / Qwen-Image / FLUX.1-Kontext-dev (referencia de rostro en `siliconflowRef`) | `SILICONFLOW_API_KEY` |
| Cloudflare Workers AI `/imagine` | `flux-2-klein-9b` con imagen de referencia (`cloudflareRefGenerate`, identity facial) | `CF_ACCOUNT_ID`, `CF_API_TOKEN` |
| fal `/imagine` | `fal-ai/flux/dev` ("falDirectGenerate", solo si `FAL_KEY`) | `FAL_KEY` |
| AI Horde `/imagine` | Juggernaut XL, desactivado por defecto | `HORDE_API_KEY`, `HORDE_ENABLED` |
| Cloudinary | alojamiento de las fotos de perfil de los personajes (`cloudinaryImage` en girls.ts) | — (URLs públicas en código) |

`supabase/functions/imagine/index.ts` es un árbol de fallback delicado. Orden con foto de referencia: Cloudflare klein-9b (reintenta 1 vez) → SiliconFlow Kontext → Horde img2img → (working tree) devuelve la foto de referencia tal cual. Sin referencia: SiliconFlow/Nscale/HF/Pollinations; si `FAL_KEY`: fal primero, luego cadena.

## Sistema de imágenes

- **Perfil**: `girl.cloudinaryImage` (Cloudinary) es la fuente principal en toda la UI (`GirlCard`, `ChatWindow`, `CallScreen`, `StoriesRow`).
- **Combinaciones galería**: `public/girls/<id>/<hair>_<pose>_<bg>.jpg`, validadas en `src/lib/image-manifest.ts` (regenerar con `node scripts/build-manifest.mjs`). Los DEFAULTS de cada chica están en `src/lib/images.ts` y en `girls.ts`.
- **Stories diarios**: `public/<id>_stories/` (jpg/png según chica). Selección determinista por día: `getDailyStoryIndex.getDailyStorySelection(id, length)` → `StoriesRow`/`StoryViewer`. Vistos se guardan en localStorage (`storySeen`) con firma del día.
- **Crear fantasía**: `CreateYourGirl.buildPrompt()` construye el prompt (numpy explicito → bikini cubierto; identidades famosas mapeadas; ducha/escenarios), llama `/imagine`, comprime la imagen en canvas (`compressImage`) y guarda la chica en localStorage (`lunacall_custom_girls`). Modo "Mi imagen": usa tu foto como avatar (`imageUrl`) sin llamar a la IA.

## Estado Git (verificado)

- Rama: `main`, local = `origin/main` (HEAD `b971ada`, sincronizado tras fetch).
- Cambios **sin commit** (working tree): `supabase/functions/imagine/index.ts` (el fallback "SILICONFLOW ref tal cual") y `tsconfig.tsbuildinfo`.
- Último commit: `b971ada feat: simplificar UI sin emojis, selector limpio, y identidad facial al máximo en klein`.
- Solo `deploy.yml` en CI despliega (push a main). También `generate-images.yml` (manual) y `keepalive.yml` (cron diario ping a `/voice`).
- Remoto: `https://github.com/3737631/luciaia.git`. Tag `backup/gh-pages-2026-07-29` existe (prohibido usarlo como fuente).

## Comandos importantes

- `npm install` / `npm run dev` / `npm run build` / `npm start` / `npm run lint` (usa `next lint`).
- Regenerar manifest de imágenes: `node scripts/build-manifest.mjs`.
- Desplegar funciones: `supabase functions deploy chat --no-verify-jwt` (idem `imagine`, `voice`).
- Secretos de funciones: `supabase secrets set NOMBRE=valor`.

## Errores conocidos / incoherencias (NO arreglar sin pedirlo)

1. **BUG real (working tree, sin commit)**: `imagine/index.ts` línea ~357 llama a `siliconflowRefBytes(refImage)` pero esa función **no está definida** en el archivo → si se alcanza esa rama, `ReferenceError` en runtime (el fallback a "foto de referencia tal cual" NO funciona).
2. `supabase/.env.example` y README están desactualizados (README habla de xAI/Grok; la realidad es OpenRouter).
3. `CustomizeClient` usa `animeIds = {sakura,yumi,rin}` que NO existen en `girls.ts` (restos), mientras `anime/page.tsx` usa `{maya,iris,yuki}`.
4. `storyInteractionsService.ts` hardcodea `creatorId: "iris"`.
5. La función `voice` no tiene rama `ping` (keepalive recibe 400 "Unknown action" — se consideró aceptable en el código).
6. Hero de `girls/chicos/anime` referencia `hero-banner*.png` que existen en raíz y en `public/`.

## Restricciones adicionales de seguridad

- La única fuente de la verdad es HEAD; prohibido heredar de commits/ramas/Pages/despliegues antiguos (regla al inicio de este archivo).
- NO tocar `girls.ts` / `image-manifest.ts` / scripts de generación de imágenes / `imagine/index.ts` / mapa de voces de `CallScreen`↔`voice/index.ts` sin leerlos y entender los fallbacks.
- `AGENTS.md` debe reflejar la realidad comprobada; si algo cambia, actualízalo tras verificar.
- No exponer secretos (envs están gitignoreados salvo los `.env.example`, que solo tienen placeholders).
- Convención (ultimo commit "simplificar UI sin emojis"): al tocar UI, prioriza los SVG inline de lucide (patrón de los componentes actuales) y no introduzcas emojis nuevos.
