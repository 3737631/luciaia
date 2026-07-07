#!/bin/bash
# Script para desplegar la Edge Function de chat en Supabase
#
# Requisitos:
# 1. Tener instalado Supabase CLI (https://supabase.com/docs/guides/cli)
# 2. Tener un proyecto Supabase creado en https://supabase.com
# 3. Tener una API key de OpenRouter (https://openrouter.ai/keys)
#
# Uso:
#   ./scripts/deploy-supabase.sh
#
# Pasos manuales previos (solo la primera vez):
#   1. supabase login
#   2. supabase link --project-ref <TU_PROJECT_REF>
#      (El project-ref lo encuentras en: Dashboard > Project Settings > General > Reference ID)

set -e

echo "=== Desplegando función chat a Supabase ==="

# Verificar que supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "ERROR: Supabase CLI no encontrado. Instálalo con:"
    echo "  npm install -g supabase"
    echo "  o desde: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Desplegar la función
echo "Desplegando función chat..."
supabase functions deploy chat --no-verify-jwt

echo ""
echo "=== ¡Despliegue completado! ==="
echo ""
echo "Ahora configura las variables de entorno en Supabase:"
echo "  1. Ve a: https://supabase.com/dashboard/project/<TU_PROJECT>/settings/functions"
echo "  2. Agrega OPENROUTER_API_KEY con tu API key de OpenRouter"
echo "  3. (Opcional) Agrega OPENROUTER_MODEL si quieres cambiar el modelo (default: sao10k/l3-lunaris-8b)"
echo ""
echo "Luego configura las variables en GitHub:"
echo "  1. Ve a: https://github.com/3737631/luciaia/settings/variables/actions"
echo "  2. Agrega estas variables:"
echo "     - NEXT_PUBLIC_SUPABASE_FUNCTION_URL = https://<TU_PROJECT_REF>.supabase.co/functions/v1"
echo "     - NEXT_PUBLIC_SUPABASE_ANON_KEY = <TU_ANON_KEY> (de Project Settings > API)"
echo ""
echo "Finalmente, haz push a main para que se redeploye el sitio."
