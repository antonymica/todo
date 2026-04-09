#!/bin/sh
set -e

# Valeur par défaut si la variable n'est pas fournie
API_UPSTREAM="${API_UPSTREAM:-localhost:5000}"

echo "🔧 API_UPSTREAM = ${API_UPSTREAM}"

# Générer nginx.conf depuis le template
envsubst '${API_UPSTREAM}' \
  < /etc/nginx/templates/nginx.conf.template \
  > /etc/nginx/conf.d/default.conf

echo "✅ nginx.conf généré"
echo "🚀 Démarrage de Nginx..."

# Passer la main à nginx (PID 1)
exec nginx -g "daemon off;"