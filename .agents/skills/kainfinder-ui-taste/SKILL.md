---
name: kainfinder-ui-taste
description: Design, implement, or review KainFinder frontend UI and interactive prototypes for the food discovery search and map experience. Use for visual, responsive, interaction, or accessibility work in the frontend; do not use for backend-only API or database work.
---

# KainFinder UI taste

Apply this skill to frontend UI or prototype work. Read [the design reference](../../../docs/design.md) for proposed screens, tokens, and states. The current app is only a landing scaffold; do not claim the search or map journey already works.

## Direction

- Design for a person finding food on a phone. Make the search control, chosen location, results, and map the primary task; avoid a marketing-style hero once the discovery view exists.
- Use black, white, and neutral grays for KainFinder's own search controls, cards, sheets, and temporary wordmark. The application map is the real Google Maps UI with its official appearance; do not draw a grayscale or Google-like replacement. Establish hierarchy through type, weight, borders, and spacing rather than accent color or decoration.
- Use clear labels, restrained spacing, consistent buttons/cards/inputs, strong text contrast, and visible keyboard focus. Keep content usable at narrow widths and with long place names.
- Treat each result card and Google map pin as two views of the same place: selecting either highlights and reveals the other. On mobile, keep a results sheet usable without hiding the whole map; on desktop, favor a stable list beside the map. Retain familiar built-in map interaction and appropriate controls; never obscure Google's logo, copyright, or required attributions.
- Give immediate, subtle feedback for submit, selection, drag, and retry. Motion should explain a state change, be interruptible, and respect `prefers-reduced-motion`; avoid decorative animation.
- Design denied-location, loading, empty, network-error, and API-limit states with a clear next action. Do not rely on a successful-result mockup alone.
- Label computed proximity as **straight-line distance**; do not imply walking time or a route calculation.

## Seven interface checks

| Principle | Apply it to KainFinder |
| --- | --- |
| Clarity | Show the active search point and what the submit action will search. |
| Hierarchy | Give search and results priority over secondary controls and decoration. |
| Consistency | Reuse the same selected, disabled, loading, and error patterns across cards, pins, and controls. |
| Feedback | Acknowledge location choice, search progress, pin/card selection, and failures promptly. |
| User control | Let people choose a point manually, retry, clear selection, and dismiss or resize the mobile sheet. |
| Accessibility | Keep keyboard operation, visible focus, readable contrast, text alternatives, and reduced motion. |
| Efficiency | Make repeat searches and moving from a result to directions easy, without extra confirmation steps. |

When implementing or reviewing, inspect the actual narrow and wide layouts and test keyboard, focus, and failure states. Keep visual decisions tied to the user's search task. This approach draws on [Apple Design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles/) and [motion guidance](https://developer.apple.com/design/human-interface-guidelines/motion/), [Emil Kowalski's design-engineering notes](https://emilkowal.ski/ui/agents-with-taste), and [Impeccable's task-led design and review guidance](https://impeccable.style/designing/).
