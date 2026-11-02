# KainFinder

KainFinder is a Metro Manila food discovery project. The planned public MVP will let people search around their location or a chosen point and inspect places on a real Google Map, without an account. **Implemented today:** a responsive React landing page, a Laravel `GET /api/health` endpoint, local CORS configuration, and a Docker Compose setup for frontend, API, and PostgreSQL. Search, maps, geolocation, Google integration, restaurant data, and deployment are not implemented. The proposed UI is documented in [docs/design.md](docs/design.md).

## Architecture

```text
Browser → React / TypeScript / Vite / Tailwind (frontend/)
Browser → GET /api/health → Laravel (backend/)
Laravel → PostgreSQL (configured in Compose; live connection unverified)
Planned public search: browser point → React → Maps JavaScript Places Text Search → Google map pins and cards
```

The browser does not access PostgreSQL. Planned public search calls Google's `Place.searchByText` from React; Laravel and PostgreSQL are outside that first search flow. Laravel remains the API for future application-owned data. The health route currently makes no database query.

## Repository

- `frontend/src/App.tsx` — landing page; `frontend/package.json` — lint and build commands.
- `backend/routes/api.php` — health route; `backend/tests/Feature/HealthTest.php` — response and CORS tests.
- `compose.yaml` — local frontend, API, and PostgreSQL services.
- `.env.example` and `backend/.env.example` — local configuration templates; `docs/design.md` — proposed interface reference.

## Prerequisites and start

Install Docker Desktop with its Linux engine running and Docker Compose. Ports `5173`, `8000`, and `5432` must be available. From the repository root in PowerShell:

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
# Replace the example PostgreSQL password in .env with your own local value.
docker compose build
docker compose run --rm api php artisan key:generate
docker compose up -d
docker compose exec api php artisan migrate
```

Open <http://localhost:5173> for the landing page and <http://localhost:8000/api/health> for `{"success":true}`. Stop with `docker compose down`. These startup commands match the Compose configuration, but the running stack has **not** been verified in this workspace because the Docker Linux engine was unavailable.

## Environment variables

Copy the example files; local `.env` files are Git-ignored. The root file supplies `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` to both database and API containers. Laravel's `backend/.env` supplies `APP_NAME`, `APP_ENV`, `APP_KEY`, `APP_DEBUG`, `APP_URL`, `FRONTEND_URL`, and its local `DB_*`, logging, session, cache, queue, and mail settings. Compose overrides the Laravel `DB_*` values with the root PostgreSQL settings. `FRONTEND_URL` controls the allowed frontend CORS origin. Keep database credentials out of browser code and source control. A future browser Maps key will be visible to users and must be restricted to authorized websites and APIs; none is configured today.

## Checks

From the repository root, with Node.js/npm available and the environment files copied:

```powershell
npm --prefix frontend ci
npm --prefix frontend run lint
npm --prefix frontend run build
docker compose config
docker compose exec api php artisan test
docker compose exec api php artisan db:show --database=pgsql
```

The last two commands require running containers. Laravel tests use in-memory SQLite; `db:show` is the separate PostgreSQL connection check. Frontend lint/build, local Laravel tests, and Compose configuration passed during scaffold setup. Docker image builds, container startup, host URLs, migrations, and live PostgreSQL connectivity remain unverified here.

## API and limitations

`GET /api/health` returns HTTP 200 with `{"success":true}` and does not query PostgreSQL. The feature tests also cover a CORS preflight request from the local frontend origin. There is no search route yet. Browser location, Google Maps and Places, result cards, map pins, and directions through Google Maps URLs are future work. PostgreSQL, accounts, and JWT are not required for the first public-search flow; a production database host is undecided. No user location or Google place content is collected by the current code.
