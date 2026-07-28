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
