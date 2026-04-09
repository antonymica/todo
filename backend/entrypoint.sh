#!/bin/bash
set -e

echo "⏳ Attente de PostgreSQL..."

until python -c "
import psycopg2, os, sys
try:
    psycopg2.connect(os.environ['DATABASE_URL'])
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; do
  echo "   PostgreSQL non disponible, retry dans 2s..."
  sleep 2
done

echo "✅ PostgreSQL prêt."

# Vérifie si des fichiers de migration existent déjà dans l'image
VERSIONS_DIR="migrations/versions"
HAS_MIGRATIONS=false

if [ -d "$VERSIONS_DIR" ] && [ "$(ls -A $VERSIONS_DIR 2>/dev/null)" ]; then
    HAS_MIGRATIONS=true
fi

if [ "$HAS_MIGRATIONS" = false ]; then
    echo "📦 Aucune migration trouvée — initialisation..."

    # Nettoyer la table alembic_version si elle existe (évite le conflit de hash)
    python -c "
import psycopg2, os
conn = psycopg2.connect(os.environ['DATABASE_URL'])
cur = conn.cursor()
cur.execute(\"DROP TABLE IF EXISTS alembic_version;\")
conn.commit()
cur.close()
conn.close()
print('   Table alembic_version réinitialisée.')
" 2>/dev/null || true

    [ ! -d "migrations" ] && flask db init
    flask db migrate -m "initial"
fi

echo "🔄 Application des migrations..."
flask db upgrade

echo "🚀 Démarrage du serveur Flask..."
exec flask run --host=0.0.0.0 --port=5000