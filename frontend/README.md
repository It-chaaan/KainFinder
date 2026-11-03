# Search prototype

Copy `.env.example` to `.env` and set `VITE_GOOGLE_MAPS_API_KEY` to a Google Maps browser key. Enable billing, Maps JavaScript API, and Places API (New) in the Google Cloud project. Restrict the key to the websites used for development and deployment and to the APIs it needs. The browser key is visible to visitors; do not use a server secret here.

Run `npm ci` and `npm run dev` from this directory. The map starts over Metro Manila. Select a city, tap the map, or request browser location; then enter a food or restaurant and submit. Search uses a 6 km location bias, which is approximate and does not enforce the Metro Manila administrative boundary. Up to eight results appear as pins and cards. Directions opens Google Maps.

The prototype does not save search queries, location, or Google place content. Google receives the query and chosen point when search is submitted. Live map, Places, billing, key restrictions, and phone behavior need verification with a configured Google project and an HTTPS phone-accessible origin.

## Changing the design

Shared colors, typography, spacing, shape, layout sizes, and motion values are defined at the top of `src/index.css`. Change those tokens to update the interface consistently. React calls the reusable `ui-label`, `ui-field`, and `ui-button` classes; button variants are `ui-button--primary` and `ui-button--outline`. Component layout rules and the 1100 px and 700 px responsive breakpoints are below the tokens. The selected map pin and search point read their colors from the same CSS palette; Google map tiles, controls, and attribution retain Google's appearance.
