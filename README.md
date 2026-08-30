# GymTrack

> Track your strength. Track your workouts. Build your best self.

GymTrack is a full-stack web application for bodybuilders and gym athletes who train seriously and want to monitor their progression over time.

This is **v1** — a production-grade foundation with a premium landing page and a complete, real JWT authentication system backed by MongoDB. Workout tracking, personal records, progress charts, etc. are coming in later versions (see [Future features](#future-features)).

---

## 1. Project overview

| Part      | What it does                                                                 |
|-----------|------------------------------------------------------------------------------|
| Frontend  | Landing page (hero, stats preview, features, CTA), Sign Up and Sign In pages |
| Backend   | REST API: register / login / me endpoints with JWT + Spring Security         |
| Database  | MongoDB — `users` collection (unique email, BCrypt-hashed passwords)          |

Authentication flow:

```
React  ──POST /api/auth/login──▶  Spring Boot ──▶ validate credentials ──▶ generate JWT ──▶ return JWT + user
React stores token (localStorage) and attaches: Authorization: Bearer <JWT> on protected calls
Spring Security ──▶ JwtAuthenticationFilter validates the token ──▶ authenticated request
```

## 2. Technologies

**Frontend:** React 18 · Vite · JavaScript · React Router v6 · Axios · Material UI (MUI) v5

**Backend:** Java 17+ · Spring Boot 3.3 · Spring Web · Spring Security · Spring Data MongoDB (**no JPA**) · JJWT · BCrypt

**Database:** MongoDB (Atlas in production, any MongoDB 4.4+ locally)

## 3. Project structure

```text
gymtrack/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/        # Navbar, Footer, Logo, AuthShell, StatCard, FeatureCard…
│   │   ├── pages/
│   │   │   ├── Home/          # Home.jsx + sections (Hero, StatsPreview, Features, CTA)
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   └── NotFound/
│   │   ├── services/          # api.js (Axios instance + interceptors), authService.js
│   │   ├── context/           # AuthContext.jsx (user, isAuthenticated, loading, login/register/logout)
│   │   ├── routes/            # AppRoutes.jsx
│   │   ├── utils/             # validation.js, errors.js, navigation.js
│   │   ├── assets/            # hero image
│   │   ├── theme.js           # MUI dark theme (volt-green accent)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
│
└── backend/
    ├── src/main/java/com/gymtrack/
    │   ├── controller/        # AuthController (thin, delegates to services)
    │   ├── service/           # AuthService (business logic)
    │   ├── repository/        # UserRepository extends MongoRepository<User, String>
    │   ├── model/             # User (@Document "users")
    │   ├── dto/               # RegisterRequest, LoginRequest, AuthResponse, UserResponse, ApiError
    │   ├── security/          # JwtService, JwtAuthenticationFilter, entry point, UserDetailsService
    │   ├── config/            # SecurityConfig, MongoConfig (auditing)
    │   └── exception/         # GlobalExceptionHandler + custom exceptions
    ├── src/main/resources/application.properties
    ├── pom.xml
    └── .env.example
```

## 4. MongoDB Atlas setup (5 minutes)

1. Create a free account at <https://www.mongodb.com/cloud/atlas> and build a free **M0 cluster**.
2. **Database Access** → *Add New Database User* → choose a username/password (password auth). Keep them safe.
3. **Network Access** → *Add IP Address* → for development add your current IP (or `0.0.0.0/0` for testing anywhere).
4. **Database → Connect → Drivers** → copy the connection string, it looks like:

   ```text
   mongodb+srv://<db_username>:<db_password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```

The database `gymtrack` is created automatically on first write — nothing else to configure.

> Local alternative: run MongoDB in Docker with `docker run -d --name gymtrack-mongo -p 27017:27017 mongo:7`
> and use `MONGODB_URI=mongodb://localhost:27017/gymtrack`.

## 5. Environment variables

### Backend (`backend/.env`, copy from `backend/.env.example`)

| Variable                | Required | Description                                                        |
|-------------------------|----------|--------------------------------------------------------------------|
| `MONGODB_URI`           | Yes      | Atlas connection string                                            |
| `JWT_SECRET`            | Yes      | ≥ 32 random chars. Generate: `openssl rand -base64 48`             |
| `JWT_EXPIRATION_MS`     | No       | Token lifetime, default `86400000` (24 h)                          |
| `CORS_ALLOWED_ORIGINS`  | No       | Comma-separated origins, default `http://localhost:5173`           |

No secret is ever hardcoded; the app refuses to start if `JWT_SECRET` is missing or too short.

### Frontend (`frontend/.env`, copy from `frontend/.env.example`)

| Variable       | Description                                    |
|----------------|------------------------------------------------|
| `VITE_API_URL` | Base URL of the API, e.g. `http://localhost:8080/api` |

## 6. Backend installation & run

Requires JDK 17+. The Maven wrapper (`./mvnw`) downloads everything else.

```bash
cd backend
cp .env.example .env          # then fill in MONGODB_URI and JWT_SECRET
set -a; source .env; set +a   # load the variables into your shell
./mvnw spring-boot:run
```

Windows (PowerShell) alternative to sourcing `.env`:

```powershell
$env:MONGODB_URI="mongodb+srv://..."; $env:JWT_SECRET="..."; ./mvnw spring-boot:run
```

API starts on **http://localhost:8080** (override with `SERVER_PORT=8081` if the port is taken).

Build without running: `./mvnw clean package` → jar in `target/`.

## 7. Frontend installation & run

Requires Node.js 18+.

```bash
cd frontend
npm install
cp .env.example .env          # adjust VITE_API_URL if you changed the backend port
npm run dev
```

Open **http://localhost:5173**

Production build: `npm run build` (output in `dist/`), preview it with `npm run preview`.

## 8. Testing registration & login end-to-end

1. Open http://localhost:5173/register → create an account (frontend validation blocks bad input).
2. You are redirected to `/` already signed in — the navbar greets you by first name.
3. Refresh the page: the session survives (token validated via `GET /api/auth/me`).
4. Click the logout icon in the navbar → authentication state cleared.
5. Log in at http://localhost:6173/../login with your credentials.
6. Verify the document in MongoDB Atlas (Browse Collections → `gymtrack` → `users`) — the password is a `$2a$10$…` BCrypt hash, never plaintext.

Quick API smoke test with curl:

```bash
# Register (201)
curl -i -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'

# Login (200)
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"john@example.com","password":"password123"}'

# Me (200 with token, 401 without)
curl -s http://localhost:8080/api/auth/me -H "Authorization: Bearer <TOKEN>"
```

## 9. Authentication API

Base URL: `/api/auth`

| Method | Endpoint    | Auth     | Success | Body in → out |
|--------|-------------|----------|---------|---------------|
| POST   | `/register` | Public   | `201 CREATED` | `{firstName, lastName, email, password}` → `{token, user}` |
| POST   | `/login`    | Public   | `200 OK` | `{email, password}` → `{token, user}` |
| GET    | `/me`       | Bearer JWT | `200 OK` | — → `{id, firstName, lastName, email}` |

Errors always use the same JSON envelope:

```json
{ "status": 409, "error": "Conflict", "message": "An account with this email already exists.", "timestamp": "…" }
```

Validation failures additionally include `"fieldErrors": { "email": "Please provide a valid email address", … }`.

| Status | When |
|--------|------|
| `201 CREATED` | Account created |
| `400 BAD REQUEST` | Validation failed / malformed body |
| `401 UNAUTHORIZED` | Missing/invalid/expired token or wrong credentials |
| `409 CONFLICT` | Email already registered |
| `500 INTERNAL SERVER ERROR` | Unexpected server error |
| `503 SERVICE UNAVAILABLE` | MongoDB unreachable |

Passwords are hashed with BCrypt before storage; no endpoint ever returns the hash.

## 10. Future features

The backend was designed so these can be added as **separate collections referencing `userId`** (no giant nested user document):

```text
User  ──▶ Workout ──▶ WorkoutExercise ──▶ Exercise
                          │
                          ▼
                 Set { weight, reps }
```

Planned: workout CRUD, exercise library, workout history, personal records, strength progression charts, body weight & measurements tracking, training statistics, streaks, goals.
