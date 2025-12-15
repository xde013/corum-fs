# Corum FS

Application full-stack pour gestion utilisateurs (CRUD)

## Stack Technique

**Backend** : NestJS + Fastify, TypeORM, PostgreSQL
**Frontend** : React 19 + Vite, TypeScript, Tailwind CSS
**Monorepo** : Turborepo + Yarn Workspaces

## Archi Backend

### Throttling (Rate Limiting)
**Lib** : `@nestjs/throttler`

Limitation de débit multi-niveaux (global + spécifique) :
- Niveaux : `short` (10 req/s), `medium` (20 req/10s), `long` (100 req/min)
- Endpoints auth : `/auth/register` (3/min), `/auth/login` (5/min), `/auth/forgot-password` (10/min)

### Authentification et Autorisation
`@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`

- JWT stateless : Access tokens (15min) + refresh tokens (7j) avec rotation
- Deux stratégies Passport : `JwtStrategy` (header `Authorization`) et `JwtRefreshStrategy` (body `refreshToken`)
- Secrets séparés : `JWT_SECRET` et `JWT_REFRESH_SECRET` distincts (≥32 caractères)
- Validation utilisateur à chaque requête
- Endpoint `/auth/refresh` : `POST` avec throttling (10 req/min)
- **Guards** : `JwtAuthGuard` (global, `@Public()` pour bypasser), `RolesGuard` (explicite, `@Roles(Role.ADMIN)`)
- Ordre d'exécution : ThrottlerGuard → JwtAuthGuard → RolesGuard

### Pagination par Curseur et Base de Données
**Lib** : `typeorm` (QueryBuilder, `@Index` decorator)

- **Pagination** : Curseur basé sur ID avec tiebreaker sur champ de tri
- **Tri** : `createdAt`, `updatedAt`, `firstName`, `lastName`, `email`, `birthdate` (ASC/DESC)
- **Filtrage** : Recherche unifiée ou filtres individuels
- **Limite** : 1-100 éléments/page (défaut: 10), métadonnées : `nextCursor`, `hasMore`, `count`, `limit`
- **Indexes composites** : `(champ, id)` pour pagination optimisée sur tous les champs de tri + `(role, createdAt)`
- **Index unique** : `email` pour contraintes d'intégrité

### Sécurité
`@fastify/helmet`, `bcrypt`, `class-validator`, `class-transformer`

- **En-têtes de sécurité** : Protection XSS, clickjacking, MIME sniffing, HSTS, referrer policy
- **Protection timing** : Hachage dummy si utilisateur inexistant, comparaison timing-safe avec `bcrypt.compare()`, messages d'erreur génériques
- **Hachage** : bcrypt 12 rounds pour mots de passe
- **Validation d'environnement** : Variables d'environnement validées au démarrage
- **Pas d'énumération utilisateur** : Messages identiques même si utilisateur inexistant

### Validation et Sérialisation
`class-validator`, `ValidationPipe`, `class-transformer`, `ClassSerializerInterceptor`

- **ValidationPipe global** : `whitelist`, `forbidNonWhitelisted`, `transform` activés
- **Validation par DTO** : Décorateurs `class-validator` (`@IsString()`, `@IsEmail()`, etc.)
- **Sérialisation** : Exclusion automatique des propriétés `@Exclude()` (password, passwordResetToken, passwordResetExpires)

### Documentation API (Swagger)
`@nestjs/swagger`
- **Swagger UI** : Disponible sur `/api` (ex: `http://localhost:4000/api`)
- **DTOs documentés** : Décorateurs `@ApiProperty()`, `@ApiTags()`, `@ApiOperation()` pour documentation automatique

## Archi Frontend

### Performance
- **Feature-based** : Organisation par fonctionnalités (`features/auth`, `users`, `profile`, `dashboard`) avec code partagé (`shared/`)
- **Lazy loading** : Pages chargées dynamiquement avec code splitting automatique par route (`React.lazy`, `Suspense`)

### Authentification et Routing
`react` (Context API), `react-router-dom`, `axios`

- **AuthContext** : État global (`user`, `isAuthenticated`, `isLoading`), hook `useAuth()` avec `login()`, `logout()`, `refreshUser()`
- **Client HTTP** : Intercepteurs Axios pour ajout automatique du token JWT, refresh automatique sur 401, retry avec nouveau token
- **Routing** : Routes publiques (`/auth/*`), protégées (`/dashboard`, `/profile`), admin (`/users/*`), composant `ProtectedRoute` avec validation

### Formulaires et Validation
`react-hook-form`, `@hookform/resolvers`, `zod`, `react-hot-toast`

- **Validation** : Schémas Zod TypeScript-first avec types générés (`z.infer<>`), validation optimisée avec re-renders minimaux
- **Schémas** : login, forgotPassword, resetPassword, profile, changePassword, createUser, updateUser
- **Gestion d'erreurs** : `handleApiError()` / `handleApiSuccess()` pour extraction automatique des messages, hook `useFormSubmission` (loading state, messages, redirection, callbacks)

### Données et Tableaux
`@tanstack/react-table`, `date-fns`, `react-day-picker`

- **Pagination curseur** : Hook `useUsersList` (curseur, `hasMore`, filtres, tri, chargement incrémental)
- **Tableaux** : Tri serveur (`manualSorting: true`), colonnes configurables, actions inline, sélection multiple
- **Dates** : Composant `DatePicker` avec validation (dates de naissance non futures)

### Hooks et Tests
`vitest`, `@testing-library/react`, `@testing-library/jest-dom`

- **Hooks réutilisables** : `useAsyncOperation` (loading state et erreurs), `useFormSubmission` (soumissions formulaires), `useAuth` (contexte auth), `useUsersList` (liste utilisateurs)
- **Tests** : Tests orientés utilisateur avec coverage, setup personnalisé et utilitaires de test

### Autres
`clsx` + `tailwind-merge`, `react-icons`, TypeScript strict, path aliases `@/`, React StrictMode

## Démarrage Local

### Prérequis
Node.js ≥ 18, Yarn 1.22.0, Docker & Docker Compose

### Installation et Lancement

```bash
yarn
yarn serve
```

Orchestration via Turborepo : build frontend/backend → démarrage Docker (PostgreSQL + backend) → seed DB (1 admin + 20 users) → serve frontend sur `http://localhost:3000`

**URLs** : Frontend `http://localhost:3000`, Backend `http://localhost:4000`, API docs `http://localhost:4000/api`

### Commandes
- `yarn dev` : Mode développement (HMR activé)
- `yarn dev:backend` / `yarn dev:frontend` : Backend ou frontend uniquement
- `yarn build` : Build production
- `yarn clean` : Nettoyage + arrêt Docker
- `yarn lint` : Linting
- `yarn test` : Tests unitaires

### Comptes de Test
- **Admin** : `admin@example.com` / `AdminPassword123!`
- **Utilisateurs** : `[prenom].[nom]@example.com` / `Password123!`

## Structure du Projet

```
corum-fs/
├── apps/
│   ├── backend/          # NestJS + Fastify
│   │   ├── src/
│   │   │   ├── auth/     # JWT, Passport, bcrypt
│   │   │   ├── users/    # CRUD, pagination curseur
│   │   │   ├── database/ # TypeORM, migrations, seed
│   │   │   └── config/   # Throttler, validation env
│   │   └── Dockerfile
│   └── frontend/         # React + Vite
│       ├── src/
│       │   ├── features/ # Modules métier
│       │   └── shared/   # Services, types, composants
│       └── vite.config.ts
├── docker-compose.yml
├── turbo.json
└── package.json
```

## Configuration

Variables d'environnement : `apps/backend/.env.docker` (Docker) ou `apps/backend/.env` (dev local)

**Requises** : `DATABASE_URL`, `JWT_SECRET` (≥32), `JWT_REFRESH_SECRET` (≥32), `LOAD_CA`

**Optionnelles** : `THROTTLE_*_LIMIT`, `JWT_*_EXPIRATION`, `PASSWORD_RESET_EXPIRY_HOURS`
