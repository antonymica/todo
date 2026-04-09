# TODO_SYS

> Application de gestion de tâches full-stack avec authentification JWT — containerisée et prête pour la production.

```
┌─────────────────────────────────────────────────────────────┐
│  React 19 + Vite  │  Flask 3  │  PostgreSQL 16  │  Nginx   │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack technique

| Couche           | Technologie                                                  |
| ---------------- | ------------------------------------------------------------ |
| Frontend         | React 19, TypeScript, Vite, TailwindCSS v4, DaisyUI v5       |
| Backend          | Flask 3, Flask-JWT-Extended, Flask-SQLAlchemy, Flask-Migrate |
| Base de données  | PostgreSQL 16                                                |
| Auth             | JWT (access token 1h + refresh token 30j)                    |
| State management | Zustand avec persistence localStorage                        |
| HTTP client      | Axios avec interceptors refresh automatique                  |
| Reverse proxy    | Nginx 1.27 (runtime config via envsubst)                     |
| Containerisation | Docker, Docker Compose, Docker Swarm                         |
| Orchestration    | Kubernetes (manifests inclus)                                |

---

## Structure du projet

```
project/
├── frontend/                      # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/            # TodoItem, TodoList, CreateTodoModal, UI
│   │   ├── pages/                 # Login, Register, Dashboard
│   │   ├── hooks/                 # useAuth, useTodos
│   │   ├── services/              # api.ts, auth.service.ts, todo.service.ts
│   │   ├── store/                 # authStore (Zustand)
│   │   └── types/                 # Types TypeScript partagés
│   ├── nginx.conf.template        # Config Nginx avec ${API_UPSTREAM}
│   ├── docker-entrypoint.sh       # Injection runtime de l'URL API
│   └── Dockerfile                 # Multi-stage build (node → nginx)
│
├── backend/                       # Flask REST API
│   ├── app/
│   │   ├── models/                # User, Todo (SQLAlchemy)
│   │   ├── routes/                # auth.py, todos.py
│   │   └── utils/                 # validators.py
│   ├── migrations/                # Alembic (Flask-Migrate)
│   ├── entrypoint.sh              # Wait-for-DB + migrations + start
│   ├── config.py                  # Configuration par environnement
│   └── Dockerfile                 # Multi-stage build (builder → runtime)
│
├── k8s/                           # Manifests Kubernetes
│   ├── namespace.yaml
│   ├── secrets/
│   ├── configmaps/
│   ├── postgres/
│   ├── backend/
│   ├── frontend/
│   └── ingress.yaml
│
├── .env                           # Variables locales (non commité)
├── .env.example                   # Template à copier
├── docker-compose.yml             # Dev local
└── docker-compose.swarm.yml       # Production Docker Swarm
```

---

## Prérequis

- Docker >= 24 et Docker Compose v2
- Node.js >= 22 (dev local frontend)
- Python >= 3.11 (dev local backend)
- `kubectl` (déploiement Kubernetes)

---

## Démarrage rapide

### 1. Cloner et configurer

```bash
git clone https://github.com/antonymica/todo.git
cd todo

# Copier et éditer les variables d'environnement
cp .env.example .env
```

Éditer `.env` avec tes valeurs :

```env
POSTGRES_USER=todo_user
POSTGRES_PASSWORD=Str0ngP@ssw0rd_2024!
POSTGRES_DB=todo_db
JWT_SECRET_KEY=genere_avec_openssl_rand_hex_32
API_UPSTREAM=backend:5000
FRONTEND_PORT=80
BACKEND_PORT=5000
DB_PORT=5432
```

### 2. Lancer avec Docker Compose

```bash
docker compose up --build
```

| Service    | URL                   |
| ---------- | --------------------- |
| Frontend   | http://localhost      |
| API Flask  | http://localhost:5000 |
| PostgreSQL | localhost:5432        |

---

## Développement local (sans Docker)

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Lancer PostgreSQL seul
docker compose up db -d

# Migrations
flask db init
flask db migrate -m "initial"
flask db upgrade

# Démarrer Flask
python run.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

> Le proxy Vite redirige `/api/*` vers `http://localhost:5000` automatiquement.

---

## API REST

### Authentification

| Méthode | Endpoint             | Auth          | Description                |
| ------- | -------------------- | ------------- | -------------------------- |
| `POST`  | `/api/auth/register` | ❌            | Inscription                |
| `POST`  | `/api/auth/login`    | ❌            | Connexion                  |
| `POST`  | `/api/auth/refresh`  | Refresh token | Renouveler l'access token  |
| `GET`   | `/api/auth/me`       | ✅            | Profil utilisateur courant |

### Todos

| Méthode  | Endpoint                | Auth | Description                                         |
| -------- | ----------------------- | ---- | --------------------------------------------------- |
| `GET`    | `/api/todos/`           | ✅   | Lister les todos (filtres: `completed`, `priority`) |
| `POST`   | `/api/todos/`           | ✅   | Créer un todo                                       |
| `GET`    | `/api/todos/:id`        | ✅   | Détail d'un todo                                    |
| `PATCH`  | `/api/todos/:id`        | ✅   | Modifier un todo (partiel)                          |
| `DELETE` | `/api/todos/:id`        | ✅   | Supprimer un todo                                   |
| `PATCH`  | `/api/todos/:id/toggle` | ✅   | Basculer completed                                  |

#### Exemple — Créer un todo

```bash
curl -X POST http://localhost:5000/api/todos/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Apprendre Kubernetes",
    "description": "Déployer todo-sys sur un cluster K8s",
    "priority": "high",
    "due_date": "2025-12-31T23:59:59"
  }'
```

#### Filtres disponibles sur `GET /api/todos/`

```bash
# Todos non complétés
GET /api/todos/?completed=false

# Todos urgents
GET /api/todos/?priority=high

# Combiné
GET /api/todos/?completed=false&priority=high
```

#### Modèle Todo

```json
{
  "id": 1,
  "title": "Apprendre Kubernetes",
  "description": "Déployer todo-sys sur un cluster K8s",
  "completed": false,
  "priority": "high",
  "due_date": "2025-12-31T23:59:59",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

---

## Tests API

Un fichier REST Client est fourni pour tester tous les endpoints :

```bash
# Avec l'extension VS Code "REST Client"
open backend/api.http
```

---

## Variables d'environnement

### `.env` (racine)

| Variable                    | Description                     | Défaut         |
| --------------------------- | ------------------------------- | -------------- |
| `POSTGRES_USER`             | Utilisateur PostgreSQL          | `todo_user`    |
| `POSTGRES_PASSWORD`         | Mot de passe PostgreSQL         | —              |
| `POSTGRES_DB`               | Nom de la base                  | `todo_db`      |
| `JWT_SECRET_KEY`            | Clé secrète JWT (min. 32 chars) | —              |
| `JWT_ACCESS_TOKEN_EXPIRES`  | Durée access token (secondes)   | `3600`         |
| `JWT_REFRESH_TOKEN_EXPIRES` | Durée refresh token (secondes)  | `2592000`      |
| `API_UPSTREAM`              | URL backend pour Nginx          | `backend:5000` |
| `FRONTEND_PORT`             | Port exposé frontend            | `80`           |
| `BACKEND_PORT`              | Port exposé backend             | `5000`         |
| `DB_PORT`                   | Port exposé PostgreSQL          | `5432`         |

### Flexibilité de `API_UPSTREAM`

L'image frontend est buildée **une seule fois** — l'URL de l'API est injectée au démarrage du container :

```bash
# Docker Compose local
API_UPSTREAM=backend:5000

# Kubernetes (DNS interne)
API_UPSTREAM=backend-service.todo-app.svc.cluster.local:5000

# Backend externe
API_UPSTREAM=api.mondomaine.com:443

# Run manuel
docker run -p 80:80 -e API_UPSTREAM=mon-backend:5000 todo-frontend
```

---

## Docker

### Build des images

```bash
# Backend
docker build -t todo-backend:latest ./backend

# Frontend
docker build -t todo-frontend:latest ./frontend
```

### Docker Compose — commandes utiles

```bash
# Démarrer tout
docker compose up --build

# Logs d'un service
docker compose logs -f backend
docker compose logs -f frontend

# Rebuild un seul service
docker compose up --build backend

# Arrêter et supprimer les volumes (reset DB)
docker compose down -v
```

---

## Docker Swarm

### Initialisation et déploiement

```bash
# 1. Initialiser le swarm
docker swarm init

# 2. Créer les secrets (stdin — rien n'est écrit sur le disque)
echo "Str0ngP@ssw0rd_2024!"    | docker secret create db_password -
echo "todo_user"                | docker secret create db_user -
echo "todo_db"                  | docker secret create db_name -
openssl rand -hex 32            | docker secret create jwt_secret -

# 3. Builder et tagger les images
docker build -t localhost/todo-backend:latest  ./backend
docker build -t localhost/todo-frontend:latest ./frontend

# 4. Déployer la stack
REGISTRY=localhost TAG=latest \
  docker stack deploy -c docker-compose.swarm.yml todo_app

# 5. Vérifier l'état
docker stack services todo_app
```

### Rolling update sans downtime

```bash
docker service update \
  --image localhost/todo-backend:v2 \
  todo_app_backend

# Rollback si problème
docker service rollback todo_app_backend
```

---

## Kubernetes

### Prérequis cluster

- Nginx Ingress Controller installé
- cert-manager installé (TLS Let's Encrypt)
- StorageClass disponible (`standard` pour minikube/kind)

### Déploiement

```bash
# 1. Générer les valeurs base64 pour les secrets
echo -n "todo_user"             | base64
echo -n "Str0ngP@ssw0rd_2024!" | base64
echo -n "todo_db"               | base64
openssl rand -hex 32            | base64

# Mettre à jour k8s/secrets/*.yaml avec ces valeurs

# 2. Appliquer les manifests dans l'ordre
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets/
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/ingress.yaml

# 3. Vérifier
kubectl get all -n todo-app
kubectl get ingress -n todo-app
```

### Minikube (test local)

```bash
minikube start
minikube addons enable ingress

# Utiliser le daemon Docker de minikube
eval $(minikube docker-env)
docker build -t todo-backend:latest  ./backend
docker build -t todo-frontend:latest ./frontend

# Dans les Deployments, ajouter imagePullPolicy: Never
kubectl apply -f k8s/
```

### Commandes utiles

```bash
# Logs backend en temps réel
kubectl logs -n todo-app deployment/backend -f

# Shell dans un pod
kubectl exec -it -n todo-app deployment/backend -- bash

# Rolling update
kubectl set image deployment/backend \
  backend=monregistry/todo-backend:v2 -n todo-app

# Rollback
kubectl rollout undo deployment/backend -n todo-app

# Scaling
kubectl scale deployment/backend --replicas=3 -n todo-app
```

---

## Sécurité

### Mesures implémentées

- Mots de passe hashés avec **bcrypt** (salt auto-généré)
- **JWT** avec expiration courte (access 1h) + refresh long (30j)
- Refresh token automatique côté client via interceptor Axios
- **CORS** restreint aux origines autorisées
- Utilisateur **non-root** dans les containers Docker
- Secrets via **Docker Secrets** (Swarm) ou **Kubernetes Secrets**
- Réseau `internal: true` pour PostgreSQL (non exposé en Swarm)
- Headers de sécurité Nginx (`X-Frame-Options`, `X-Content-Type-Options`)
- Validation des inputs côté backend (email, password, username)

### Recommandations production

```bash
# Générer un JWT_SECRET_KEY solide
openssl rand -hex 32

# Ne jamais commiter
echo ".env" >> .gitignore
echo "secrets/" >> .gitignore

# Rotation des secrets Kubernetes sans downtime
kubectl create secret generic backend-secret \
  --from-literal=JWT_SECRET_KEY=$(openssl rand -hex 32) \
  -n todo-app --dry-run=client -o yaml | kubectl apply -f -
kubectl rollout restart deployment/backend -n todo-app
```

---

## Validation des données

### Règles password

- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 chiffre

### Règles username

- 3 à 50 caractères
- Lettres, chiffres et underscores uniquement

### Priorités Todo

- `low` — faible priorité
- `medium` — priorité normale (défaut)
- `high` — priorité élevée

---

## Contribuer

```bash
# Fork + clone
git clone https://github.com/antonymica/todo.git

# Créer une branche
git checkout -b feature/ma-fonctionnalite

# Développer, tester, commiter
git commit -m "feat: description de la fonctionnalité"

# Push + Pull Request
git push origin feature/ma-fonctionnalite
```

---

## Licence

MIT — voir [LICENSE](LICENSE)

---

```
// TODO_SYS — built with Flask + React + PostgreSQL
// Containerized. Scalable. Production-ready.
```
