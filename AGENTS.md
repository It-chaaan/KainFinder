# KainFinder project guidance

KainFinder aims to help people discover food around a chosen point in Metro Manila. Today it has a responsive landing page and `GET /api/health`; search, maps, geolocation, Google integration, and deployment are planned. Read `README.md` for setup and `docs/design.md` for proposed UI direction.

- `frontend/` owns the React, TypeScript, Vite, and Tailwind interface. `backend/` owns the Laravel JSON API and database access. Root `compose.yaml` configures local frontend, API, and PostgreSQL containers; copy the example environment files before using it.
- Run `npm --prefix frontend run lint` and `npm --prefix frontend run build` for frontend changes. With Compose running, use `docker compose exec api php artisan test` for backend changes and `docker compose config` for Compose changes. Report checks blocked by an unavailable Docker engine rather than claiming they passed.
- Keep PostgreSQL access in Laravel, but do not make it a dependency of the first public-search flow. Plan that flow in React with the Maps JavaScript API and browser-side `Place.searchByText`; Laravel remains for future application-owned data. A browser Maps key is visible, so restrict it by website and API; keep database credentials and other secrets out of source control. Check Google's terms before storing any Google place content.
- Make focused changes, preserve existing work, and verify the affected part of the app. Do not describe planned product behavior as implemented.
