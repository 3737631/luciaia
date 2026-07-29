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
