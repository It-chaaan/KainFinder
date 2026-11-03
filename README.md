# Crave It

Crave It is a Metro Manila food discovery prototype. The React app displays a real Google Map, lets people choose a city center, tap a map point, or request browser location, and runs Places (New) `Place.searchByText` **only when Search is submitted**. Up to eight place suggestions appear as linked map pins and cards; cards show locally calculated straight-line distance when coordinates are available. Directions opens Google Maps. A city is a search center, not a strict boundary. A dish query suggests places and does not prove a dish is on the menu.

The user confirmed a live desktop “ramen” search on localhost using a Maps Demo Key. A dedicated narrow browser check on 2026-11-03 also verified live “ramen” and “sisig” searches, city-center changes, linked cards/pins, the skip-to-results link, and visible Google map attribution. Real-phone location permissions, the external Directions handoff, and production deployment remain unverified.

## Architecture

```text
Browser -> React / TypeScript / Vite -> Maps JavaScript API + Places (New)
Browser -> GET /api/health -> Laravel
Laravel -> PostgreSQL (configured in Compose; not used by public search)
```

Laravel currently has a health route, not a search or directions endpoint. The health route does not check PostgreSQL. Accounts, saved places, and deployment are not implemented. See [docs/design.md](docs/design.md) for UI direction and [frontend/README.md](frontend/README.md) for frontend setup and styling.

## Run the frontend

From the repository root:

```powershell
Copy-Item frontend/.env.example frontend/.env
# Set VITE_GOOGLE_MAPS_API_KEY in frontend/.env.
npm --prefix frontend ci
npm --prefix frontend run dev
```

Open the local URL printed by Vite. A Maps Demo Key supports prototyping only and has limited features and quotas; do not deploy it as a production credential. For production, use an appropriately configured Google Cloud project, enable the required Maps JavaScript and Places (New) APIs and billing, and restrict the browser key to authorized websites and APIs. The browser key is visible to visitors; never put server secrets in frontend code.

The app loads a Google map and keeps its own results beside or below it so Google's built-in logo, controls, copyright, and attribution remain visible. It requests only place ID, name, address, and location. Search uses an approximate 6 km location bias, not an administrative Metro Manila boundary. Distance is calculated in the browser from coordinates, not a route or travel time. Results without coordinates remain in the list with an unavailable-distance label and no map pin or Directions link. It does not persist the query, precise location, or returned Places content; submitting a search sends the query and chosen center to Google.

The app links to draft [Privacy](frontend/public/privacy.html) and [Terms of use](frontend/public/terms.html) pages. **They are not launch-ready:** the owner must supply a legal name and contact email and review the deployed service and Google policy requirements before publication.

## Run the full local stack

Docker Desktop with its Linux engine is required for Compose. From the repository root:

```powershell
Copy-Item .env.example .env
Copy-Item backend/.env.example backend/.env
# Choose a local POSTGRES_PASSWORD in .env.
docker compose build
docker compose run --rm api php artisan key:generate
docker compose up -d
docker compose exec api php artisan migrate
```

If `APP_KEY` is already set in `backend/.env`, do not regenerate it. The root `.env` provides PostgreSQL settings; `backend/.env` provides Laravel settings. Both and `frontend/.env` are Git-ignored. Compose runs the frontend at <http://localhost:5173> and the API health route at <http://localhost:8000/api/health>. Stop with `docker compose down`. Live database connectivity and container startup are separate checks from the frontend search.

## Checks and remaining verification

```powershell
npm --prefix frontend run lint
npm --prefix frontend run build
git diff --check
docker compose config
docker compose exec api php artisan test
```

The Docker commands require the local Docker engine and running containers for the Laravel test. A real-phone check still needs a phone-accessible HTTPS origin: allow and deny location, choose a city after denial, tap a point, search, confirm distance labels, select pins and cards, open Directions, follow the legal links, and inspect Google attribution at narrow widths. Before public launch, replace the Demo Key with a production credential, verify usage and quotas, and complete the privacy and terms drafts.
