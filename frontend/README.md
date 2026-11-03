# Search prototype

## Source layout

```text
src/
  App.tsx                         Screen composition
  main.tsx                        React entry point and global styles
  index.css                       Shared design tokens and component styles
  features/discovery/
    SearchControls.tsx            Query, city, and location controls
    GoogleMap.tsx                 Map lifecycle, search point, and result pins
    ResultsPanel.tsx              Result states, cards, distances, and directions links
    distance.ts                   Local straight-line distance calculation
    useDiscovery.ts               Search and location state/actions
    googleMaps.ts                 Google Maps loader and local API types
    locations.ts                  Metro Manila starting point and city centers
```

Copy `.env.example` to `.env` and set `VITE_GOOGLE_MAPS_API_KEY` to a Google Maps browser key. A Maps Demo Key works for local prototyping with limited features and quotas; it is not a production credential. For production, configure billing and the Maps JavaScript API plus Places API (New), and restrict the browser key by website and API. The browser key is visible to visitors; do not use a server secret here.

Run `npm ci` and `npm run dev` from this directory. The map starts over Metro Manila. Select a city center, tap the map, or request browser location; then enter a restaurant, chain, cuisine, or dish and submit. A city is a search center rather than a city filter. Dish results are place suggestions, not menu confirmation. Search uses a 6 km location bias, which is approximate and does not enforce the Metro Manila administrative boundary. Up to eight results appear as pins and cards. Directions opens Google Maps.

The prototype does not save search queries, location, or Google place content. Google receives the query and chosen point when search is submitted. Each card shows a locally computed straight-line distance when the coordinates exist; otherwise it says the distance is unavailable. The user confirmed a live desktop search on localhost with a Maps Demo Key; a dedicated narrow browser check also verified search, city-center changes, cards/pins, the skip link, and visible map attribution. The new distance labels and legal links still need a browser check. Real-phone behavior, external Directions handoff, production key restrictions and billing, and owner review of the draft privacy and terms pages remain unverified.

Static legal drafts are in `public/privacy.html` and `public/terms.html`, with shared `public/legal.css`. The app footer links to them. Replace the marked owner name and contact placeholders and review the text before a public launch.

## Changing the design

Shared colors, typography, spacing, shape, layout sizes, and motion values are defined at the top of `src/index.css`. Change those tokens to update the interface consistently. React calls the reusable `ui-label`, `ui-field`, and `ui-button` classes; button variants are `ui-button--primary` and `ui-button--outline`. Component layout rules and the 1100 px and 700 px responsive breakpoints are below the tokens. The selected map pin and search point read their colors from the same CSS palette; Google map tiles, controls, and attribution retain Google's appearance.
