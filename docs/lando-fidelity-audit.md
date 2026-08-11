# AgentReach × Lando interaction fidelity audit

Reference inspected: `https://landonorris.com/` (public desktop markup and styles, August 2026).

The implementation reproduces the interaction grammar and visual pacing with original AgentReach content and assets. It does not copy Lando Norris logos, photography, copy, or proprietary 3D material.

| Reference mechanism | AgentReach implementation | Status |
| --- | --- | --- |
| 200vh sticky hero | `ImmersiveHero` with a 200vh track and 100vh sticky stage | Complete |
| Central interactive WebGL subject | Continuous 160×120-segment faceless head mesh with physical material and pointer-driven rotation | Complete |
| Interactive helmet fragments | Two curved metallic visor shells and signal rails separate/recompose from pointer position | Complete |
| Fixed navigation and chapter metadata | Persistent AgentReach navigation, chapter number, privacy state | Complete |
| Vertical side data module | Live agent system card replacing the racing “next event” module | Complete |
| Scroll-position feedback | Fixed mixed-blend progress rail and section progress line | Complete |
| Full-screen message transition | Dark inverted manifesto marquee and oversized editorial statement | Complete |
| Pinned horizontal content sequence | Five trust-system cards move across a 500vh sticky track | Complete |
| Responsive fallback | Horizontal sequence becomes a vertical stacked story below 620px | Complete |
| Reduced-motion support | Existing global reduced-motion policy plus static card fallback | Complete |
| Original AgentReach product flows | Reach, capsule, connected state, trace, composer, persona controls remain wired | Complete |

## Intentional differences

- The subject is a generated faceless 3D head, not a driver likeness or photograph.
- The mask is live WebGL geometry rather than a copied racing helmet texture.
- The horizontal chapter explains privacy, agency, tools, relations, and evidence instead of racing stories.
- The implementation uses Motion and CSS rather than copying the reference site's Webflow/Three runtime.

## Verification

- `npm run lint` passes.
- `npm run build` passes with all static routes generated.
- Browser review covered the desktop hero at rest and with pointer displacement, hero-to-manifesto transition, the fifth horizontal card, the final summary screen, and a 600 CSS-pixel responsive viewport.
- The hero contains zero raster images. The two obsolete body/armor PNG assets and their renderer were removed.
- The horizontal travel distance is measured from live content width. A single document scroll root preserves `position: sticky`; the final card remains visible before the final summary screen.
