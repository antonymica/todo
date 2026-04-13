# TODO_SYS

Application full-stack de gestion de tâches avec authentification JWT.

Stack principale :

- Frontend : React 19, TypeScript, Vite, TailwindCSS, DaisyUI
- Backend : Flask 3, SQLAlchemy, Flask-Migrate, JWT
- Base de données : PostgreSQL 16
- Runtime : Docker Compose ou Kubernetes
- Reverse proxy applicatif : Nginx dans l'image frontend

---

## Architecture

```text
Utilisateur
   |
   v
Frontend Nginx
   |-- sert l'application React
   |-- proxy /api/* vers le backend Flask
   |
   v
Backend Flask
   |
   v
PostgreSQL
```

Avec Docker Compose, seul le frontend est exposé sur l'hôte. Le backend et PostgreSQL restent internes au réseau Docker.

Avec Kubernetes, l'Ingress expose le service frontend. Le frontend proxy ensuite `/api/*` vers `backend-service`.

---

## Structure

```text
.
├── backend/
│   ├── app/
│   ├── migrations/
│   ├── Dockerfile
│   └── entrypoint.sh
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   └── nginx.conf.template
├── k8s/
│   ├── backend/
│   ├── configmaps/
│   ├── frontend/
│   ├── postgres/
│   ├── secrets/
│   ├── ingress.yaml
│   └── namespace.yaml
├── docker-compose.yml
├── .env.example
└── REVERSE.md
```

---

## Prérequis

Pour Docker Compose :

- Docker 24+
- Docker Compose v2

Pour Kubernetes :

- `kubectl`
- un cluster local ou distant
- un Ingress Controller Nginx si tu veux exposer l'application avec `Ingress`

Pour le développement sans Docker :

- Node.js 22+
- Python 3.13 recommandé

---

## Variables d'environnement Docker Compose

Copie le fichier exemple :

```bash
cp .env.example .env
```

Exemple minimal :

```env
POSTGRES_USER=todo_user
POSTGRES_PASSWORD=change_me_in_production
POSTGRES_DB=todo_db

FLASK_ENV=development
JWT_SECRET_KEY=change_me_super_secret_key_min_32_chars
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000

API_UPSTREAM=backend:5000
FRONTEND_PORT=8080
```

Notes :

- `API_UPSTREAM=backend:5000` doit rester ainsi avec Docker Compose.
- `FRONTEND_PORT` est le port exposé sur la machine hôte.
- Le backend Flask n'est pas exposé directement par `docker-compose.yml`; il est accessible via `/api` depuis le frontend.

---

## Lancer en local avec Docker Compose

Depuis la racine du projet :

```bash
cp .env.example .env
```

Modifier `.env`, puis lancer :

```bash
docker compose up -d --build
```

Vérifier les containers :

```bash
docker compose ps
```

Tester l'application :

```bash
curl -I http://127.0.0.1:8080
curl http://127.0.0.1:8080/api/health
```

URLs locales :

| Service          | URL                                |
| ---------------- | ---------------------------------- |
| Application      | `http://localhost:8080`            |
| API via frontend | `http://localhost:8080/api`        |
| Healthcheck API  | `http://localhost:8080/api/health` |

Commandes utiles :

```bash
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

Rebuild d'un service :

```bash
docker compose up -d --build backend
docker compose up -d --build frontend
```

Arrêter sans supprimer les données PostgreSQL :

```bash
docker compose down
```

Arrêter et supprimer aussi le volume PostgreSQL :

```bash
docker compose down -v
```

---

## Lancer en production avec Docker Compose

Sur le serveur :

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
```

Cloner le projet :

```bash
sudo mkdir -p /opt/todo-auth
sudo chown "$USER:$USER" /opt/todo-auth
git clone https://github.com/antonymica/todo.git /opt/todo-auth
cd /opt/todo-auth
```

Créer le fichier d'environnement production :

```bash
cp .env.example .env.prod
```

Exemple `.env.prod` :

```env
POSTGRES_USER=todo_user
POSTGRES_PASSWORD=remplacer_par_un_mot_de_passe_solide
POSTGRES_DB=todo_db

FLASK_ENV=production
JWT_SECRET_KEY=remplacer_par_une_cle_jwt_minimum_32_chars
JWT_ACCESS_TOKEN_EXPIRES=3600
JWT_REFRESH_TOKEN_EXPIRES=2592000

API_UPSTREAM=backend:5000
FRONTEND_PORT=8080
```

Sécuriser le fichier :

```bash
chmod 600 .env.prod
```

Démarrer l'application :

```bash
docker compose --env-file .env.prod up -d --build
```

Vérifier :

```bash
docker compose --env-file .env.prod ps
curl http://127.0.0.1:8080/api/health
```

Mettre à jour en production :

```bash
cd /opt/todo-auth
git pull
docker compose --env-file .env.prod up -d --build --remove-orphans
docker image prune -f
```

Pour exposer le domaine `todo.antonymica.site` avec Nginx sur le serveur, utiliser les commandes dans `REVERSE.md`.

---

## Kubernetes local

Exemple avec Minikube.

### 1. Démarrer le cluster local

```bash
minikube start
minikube addons enable ingress
```

### 2. Builder les images dans le Docker de Minikube

```bash
eval "$(minikube docker-env)"

docker build -t todo-backend:local ./backend
docker build -t todo-frontend:local ./frontend
```

### 3. Appliquer les manifests

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets/
kubectl apply -f k8s/configmaps/
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/
kubectl apply -f k8s/ingress.yaml
```

### 4. Utiliser les images locales

Les manifests utilisent par défaut les images GHCR. Pour Minikube, remplacer par les images locales :

```bash
kubectl -n todo-app set image deployment/backend backend=todo-backend:local
kubectl -n todo-app set image deployment/frontend frontend=todo-frontend:local
```

Empêcher Kubernetes de tirer ces images depuis un registry :

```bash
kubectl -n todo-app patch deployment backend \
  --type=json \
  -p='[{"op":"replace","path":"/spec/template/spec/containers/0/imagePullPolicy","value":"Never"}]'

kubectl -n todo-app patch deployment frontend \
  --type=json \
  -p='[{"op":"replace","path":"/spec/template/spec/containers/0/imagePullPolicy","value":"Never"}]'
```

### 5. Vérifier le déploiement

```bash
kubectl -n todo-app get pods
kubectl -n todo-app get svc
kubectl -n todo-app get ingress
```

Attendre les rollouts :

```bash
kubectl -n todo-app rollout status statefulset/postgres
kubectl -n todo-app rollout status deployment/backend
kubectl -n todo-app rollout status deployment/frontend
```

### 6. Accéder à l'application

Option simple avec port-forward :

```bash
kubectl -n todo-app port-forward service/frontend-service 8080:80
```

Puis ouvrir :

```bash
curl -I http://127.0.0.1:8080
curl http://127.0.0.1:8080/api/health
```

Option Ingress Minikube :

```bash
MINIKUBE_IP="$(minikube ip)"
echo "$MINIKUBE_IP todo.antonymica.site" | sudo tee -a /etc/hosts
curl -I http://todo.antonymica.site
```

---

## Kubernetes production

Les manifests de production sont dans `k8s/`.

Images par défaut :

```text
ghcr.io/antonymica/todo-backend:latest
ghcr.io/antonymica/todo-frontend:latest
```

La pipeline `.github/workflows/package.yml` met à jour ces images automatiquement sur la branche `dev` :

- si le commit a un tag Git, elle utilise ce tag
- sinon elle garde `latest`

### 1. Préparer le namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### 2. Créer les secrets production

Recommandé : créer les secrets directement avec `kubectl`, plutôt que de commiter de vraies valeurs.

```bash
kubectl -n todo-app create secret generic db-secret \
  --from-literal=POSTGRES_USER=todo_user \
  --from-literal=POSTGRES_PASSWORD='remplacer_par_un_mot_de_passe_solide' \
  --from-literal=POSTGRES_DB=todo_db \
  --dry-run=client -o yaml | kubectl apply -f -
```

```bash
kubectl -n todo-app create secret generic backend-secret \
  --from-literal=JWT_SECRET_KEY="$(openssl rand -hex 32)" \
  --dry-run=client -o yaml | kubectl apply -f -
```

Si les images GHCR sont privées, créer un secret de pull :

```bash
kubectl -n todo-app create secret docker-registry ghcr-pull-secret \
  --docker-server=ghcr.io \
  --docker-username="$GITHUB_USER" \
  --docker-password="$GITHUB_TOKEN" \
  --docker-email="$GITHUB_EMAIL"
```

Puis l'associer au service account par défaut :

```bash
kubectl -n todo-app patch serviceaccount default \
  -p '{"imagePullSecrets":[{"name":"ghcr-pull-secret"}]}'
```

### 3. Appliquer la configuration

```bash
kubectl apply -f k8s/configmaps/
```

Adapter le domaine et CORS si besoin :

```bash
kubectl -n todo-app edit configmap backend-config
kubectl -n todo-app edit ingress todo-ingress
```

### 4. Déployer PostgreSQL

```bash
kubectl apply -f k8s/postgres/
kubectl -n todo-app rollout status statefulset/postgres
```

### 5. Déployer le backend et le frontend

```bash
kubectl apply -f k8s/backend/
kubectl apply -f k8s/frontend/

kubectl -n todo-app rollout status deployment/backend
kubectl -n todo-app rollout status deployment/frontend
```

### 6. Déployer l'Ingress

```bash
kubectl apply -f k8s/ingress.yaml
kubectl -n todo-app get ingress
```

Le manifest Ingress est en HTTP. Ajouter TLS ensuite avec cert-manager ou avec la solution de ton cluster.

### 7. Utiliser une version d'image précise

Si tu veux déployer une version taguée :

```bash
TAG=v1.0.0

kubectl -n todo-app set image deployment/backend \
  backend=ghcr.io/antonymica/todo-backend:$TAG

kubectl -n todo-app set image deployment/frontend \
  frontend=ghcr.io/antonymica/todo-frontend:$TAG

kubectl -n todo-app rollout status deployment/backend
kubectl -n todo-app rollout status deployment/frontend
```

Rollback :

```bash
kubectl -n todo-app rollout undo deployment/backend
kubectl -n todo-app rollout undo deployment/frontend
```

---

## Pipeline images Kubernetes

La pipeline [.github/workflows/package.yml](.github/workflows/package.yml) s'active sur push vers `dev`.

Elle fait :

1. détecte le tag Git du commit courant
2. utilise `latest` si aucun tag n'existe
3. build l'image backend
4. build l'image frontend
5. push les images dans GitHub Container Registry
6. met à jour les images dans les deployments Kubernetes
7. commit les manifests modifiés sur `dev`

Format des images :

```text
ghcr.io/antonymica/todo-backend:<tag-ou-latest>
ghcr.io/antonymica/todo-frontend:<tag-ou-latest>
```

Pour créer un tag et déclencher une version :

```bash
git checkout dev
git tag v1.0.0
git push origin dev --tags
```

---

## Commandes Kubernetes utiles

```bash
kubectl -n todo-app get all
kubectl -n todo-app get pods -o wide
kubectl -n todo-app describe pod <pod>
```

Logs :

```bash
kubectl -n todo-app logs -f deployment/backend
kubectl -n todo-app logs -f deployment/frontend
kubectl -n todo-app logs -f statefulset/postgres
```

Shell dans un pod :

```bash
kubectl -n todo-app exec -it deployment/backend -- sh
kubectl -n todo-app exec -it deployment/frontend -- sh
```

Redémarrer un composant :

```bash
kubectl -n todo-app rollout restart deployment/backend
kubectl -n todo-app rollout restart deployment/frontend
```

Supprimer l'application Kubernetes :

```bash
kubectl delete namespace todo-app
```

---

## API

Healthcheck :

```bash
GET /api/health
```

Auth :

| Méthode | Endpoint             | Description         |
| ------- | -------------------- | ------------------- |
| `POST`  | `/api/auth/register` | Inscription         |
| `POST`  | `/api/auth/login`    | Connexion           |
| `POST`  | `/api/auth/refresh`  | Renouveler le token |
| `GET`   | `/api/auth/me`       | Utilisateur courant |

Todos :

| Méthode  | Endpoint                | Description             |
| -------- | ----------------------- | ----------------------- |
| `GET`    | `/api/todos/`           | Lister les tâches       |
| `POST`   | `/api/todos/`           | Créer une tâche         |
| `GET`    | `/api/todos/:id`        | Détail d'une tâche      |
| `PATCH`  | `/api/todos/:id`        | Modifier une tâche      |
| `DELETE` | `/api/todos/:id`        | Supprimer une tâche     |
| `PATCH`  | `/api/todos/:id/toggle` | Basculer l'état terminé |

---

## Sécurité

- Les mots de passe utilisateurs sont hashés avec bcrypt.
- Les tokens JWT ont une durée d'expiration configurable.
- PostgreSQL n'est pas exposé publiquement.
- Le backend n'est pas exposé directement avec Docker Compose.
- Les secrets de production doivent être créés sur le serveur ou dans le cluster, pas commités avec de vraies valeurs.
- Pour Kubernetes, préférer External Secrets, Sealed Secrets ou le secret manager du cloud en production.
