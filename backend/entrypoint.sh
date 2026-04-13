#!/bin/bash
set -e

echo "⏳ Attente de PostgreSQL..."

# Lire les secrets Docker Swarm si présents (fichiers dans /run/secrets/)
if [ -f /run/secrets/db_user ];     then DB_USER=$(cat /run/secrets/db_user);         fi
if [ -f /run/secrets/db_password ]; then DB_PASS=$(cat /run/secrets/db_password);     fi
if [ -f /run/secrets/db_name ];     then DB_NAME=$(cat /run/secrets/db_name);         fi
if [ -f /run/secrets/jwt_secret ];  then
  export JWT_SECRET_KEY=$(cat /run/secrets/jwt_secret)
fi

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"

# Construire DATABASE_URL avec des identifiants encodés pour supporter les
# caractères spéciaux dans le mot de passe PostgreSQL.
if [ -n "$DB_USER" ] && [ -n "$DB_PASS" ] && [ -n "$DB_NAME" ]; then
  export DB_HOST DB_PORT DB_USER DB_PASS DB_NAME
  DATABASE_URL=$(python -c 'import os; from urllib.parse import quote; print("postgresql://{}:{}@{}:{}/{}".format(quote(os.environ["DB_USER"], safe=""), quote(os.environ["DB_PASS"], safe=""), os.environ["DB_HOST"], os.environ["DB_PORT"], quote(os.environ["DB_NAME"], safe="")))')
  export DATABASE_URL
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Configuration PostgreSQL manquante: DB_USER, DB_PASS, DB_NAME ou DATABASE_URL requis."
  exit 1
fi

until python -c "
import psycopg2, os, sys
try:
    if all(os.environ.get(k) for k in ('DB_USER', 'DB_PASS', 'DB_NAME')):
        conn = psycopg2.connect(
            host=os.environ.get('DB_HOST', 'db'),
            port=os.environ.get('DB_PORT', '5432'),
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASS'],
            dbname=os.environ['DB_NAME'],
        )
    else:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.close()
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; do
  echo "   PostgreSQL non disponible, retry dans 2s..."
  sleep 2
done

echo "✅ PostgreSQL prêt."

VERSIONS_DIR="migrations/versions"
HAS_MIGRATIONS=false
if [ -d "$VERSIONS_DIR" ] && [ "$(ls -A $VERSIONS_DIR 2>/dev/null)" ]; then
  HAS_MIGRATIONS=true
fi

if [ "$HAS_MIGRATIONS" = false ]; then
  echo "📦 Initialisation des migrations..."
  python -c "
import psycopg2, os
conn = psycopg2.connect(os.environ['DATABASE_URL'])
cur = conn.cursor()
cur.execute('DROP TABLE IF EXISTS alembic_version;')
conn.commit(); cur.close(); conn.close()
" 2>/dev/null || true
  [ ! -d "migrations" ] && flask db init
  flask db migrate -m "initial"
fi

echo "🔄 Application des migrations..."
flask db upgrade

echo "🚀 Démarrage du serveur Flask..."
exec flask run --host=0.0.0.0 --port=5000
