# Crave It design reference

**Status:** proposed direction for the public food discovery MVP, not a finished prototype. The implemented frontend is a responsive landing page in `frontend/src/App.tsx`; it currently uses emerald accents. The monochrome Crave It controls around a real Google Map have not been built. The root `README.md` describes current application behavior.

## User and journey

The target user is someone in Metro Manila choosing where to eat near their current location or another point. On a phone, they should be able to search without first learning a map interface.

**Proposed primary journey:** choose browser location or place a point manually → submit a food search from React with `Place.searchByText` → scan linked result cards and pins on a real Google Map → inspect one place → open directions through a Google Maps URL. No account is needed. Ask for location only when the user chooses that option; route calculation inside Crave It is outside this MVP. Laravel and PostgreSQL are not in this first search flow.

## Screen and state inventory (proposed)

| Surface | Content and action |
| --- | --- |
| Discovery start | Search field, active point, location choice, and map; explain manual point choice before requesting permission. |
| Results | Count or summary, cards linked to pins, selected-place detail, and a directions action. |
| Location denied/unavailable | Explain the outcome without blame; keep manual point selection available. |
| Loading | Keep search context visible, show progress, and allow a later search or point change. |
| Empty | Say that no places matched this point and query; offer a revised search or location. |
| Network error | Preserve the query and point; offer retry. |
| API limit | Explain that search is temporarily unavailable; avoid automatic repeated requests. |

Do not present example results as live data in a prototype. Show both successful and failure states in review.

## Responsive layout (proposed)

- **Mobile first:** place search and location controls above the map. Use a results sheet that can be collapsed or expanded without losing the point or map context. Keep the sheet handle and close/resize controls discoverable, with a keyboard equivalent to dragging. Account for safe areas and the on-screen keyboard.
- **Desktop:** use a persistent result list beside the real Google Map. Keep search controls and the selected place visible without covering attribution, built-in controls, or pins. At intermediate widths, favor a narrower list over cramped cards.
- Pins and cards share one selected state. Selection scrolls or reveals the partner item without surprising map jumps. Directions is a deliberate handoff from the selected place.

## Monochrome tokens (proposed)

| Token | Starting value | Use |
| --- | --- | --- |
| Ink | `#111111` | Primary text and filled primary actions |
| Canvas | `#FFFFFF` | Main surface |
| Soft surface | `#F5F5F5` | Sheet and subdued areas |
| Muted text | `#525252` | Secondary copy, checked for contrast |
| Border | `#D4D4D4` | Inputs, cards, separators |
| Focus | `#000000` | Clear outline with offset on light surfaces |

These tokens apply to Crave It's search controls, cards, sheets, and logo placeholder, **not** to Google map tiles or built-in map UI. Use system sans-serif type. Start with a small type scale (body 16px, supporting text 14px, headings 24–32px) and a 4px spacing base; adjust after viewing real content. Use a temporary text wordmark, not an invented final logo. Selected states need shape, border, and text changes, since color alone must not carry meaning.

## Component behavior (proposed)

- **Search and location:** show the active point before submission. Search only on explicit submit; avoid requests for every keystroke or map movement. Offer a clear way to change or clear the point.
- **Result card and pin:** use a shared place identifier and selection state. A selected card identifies its pin and vice versa. Keep place name and useful details readable when truncated. Label any computed proximity **straight-line distance**; never call it travel time.
- **Results sheet:** preserve access to the map, scroll results within the sheet, and keep the selected item reachable. Do not trap keyboard focus unless using a true modal.
- **Feedback and motion:** acknowledge submit, selection, retry, and sheet movement immediately. Animate only transitions that clarify spatial or state relationships; keep them brief, cancelable, and replace them with direct state changes under reduced-motion settings.
- **Map:** embed the real Google Maps JavaScript map with familiar pan/zoom interaction and appropriate built-in controls. Preserve its official appearance and keep Google's logo, copyright, and required attributions visible in every layout and sheet position. Do not make a hand-drawn, grayscale, or Google-like replacement map in the application. A Figma prototype may represent the map without a live API only when clearly labeled as a prototype.

## Accessibility checks

Review at phone and desktop widths, with keyboard only and at browser zoom. Verify semantic labels for search, location, pins, sheet controls, retry, and directions; visible focus and a logical focus order; readable contrast; touch targets that are comfortable on mobile; non-color selected states; status messages announced without stealing focus; and `prefers-reduced-motion`. Verify manual point choice remains possible after location denial. Check map and list equivalents for actions that cannot be completed precisely by keyboard on the map.

## Design non-goals

The first public-search MVP does not include registration, favorites, JWT, saved places, reviews, a social feed, restaurant management, in-app route computation, or persistent restaurant storage. It does not establish a final brand identity or claim a completed Figma prototype. Google Maps and Places integration and deployment remain planned as described in the README.
