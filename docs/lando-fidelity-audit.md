# AgentReach × Lando interaction fidelity audit

Reference inspected: `https://landonorris.com/` (public desktop markup and styles, August 2026).

The implementation reproduces the interaction grammar and visual pacing with original AgentReach content and assets. It does not copy Lando Norris logos, photography, copy, or proprietary 3D material.

| Reference mechanism | AgentReach implementation | Status |
| --- | --- | --- |
| 200vh sticky hero | `ImmersiveHero` with a 200vh track and 100vh sticky stage | Complete |
| Central interactive subject | Original pearl-ceramic virtual human portrait with a seamless faceplate and pointer/scroll parallax | Complete |
| Interactive helmet fragments | Three portrait slices, two graphic mask plates and signal rails separate/recompose with different spring ratios | Complete |
| Fixed navigation and chapter metadata | Persistent AgentReach navigation, chapter number, privacy state | Complete |
| Vertical side data module | Live agent system card replacing the racing “next event” module | Complete |
| Scroll-position feedback | Fixed mixed-blend progress rail and section progress line | Complete |
| Full-screen message transition | Dark inverted manifesto marquee and oversized editorial statement | Complete |
| Pinned horizontal content sequence | Five trust-system cards move across a 500vh sticky track | Complete |
| Responsive fallback | Horizontal sequence becomes a vertical stacked story below 620px | Complete |
| Reduced-motion support | Existing global reduced-motion policy plus static card fallback | Complete |
| Parameter decomposition | Seven hero nodes expand Identity, Memory, Intent, Boundary, Skills, Relations and Reach before the detailed 01—05 system chapters | Complete |
| Runtime atmosphere | Unicorn Studio 2.2.8 scene runs as a restrained 30fps/0.45-scale ambient layer with production caching and unmount cleanup | Complete |
| Original AgentReach product flows | Reach, capsule, connected state, trace, composer, persona controls remain wired | Complete |

## Intentional differences

- The subject is an original virtual human render, not a driver likeness or photograph.
- The mask uses original AgentReach graphic plates and portrait slices rather than a copied racing helmet texture.
- The horizontal chapter explains privacy, agency, tools, relations, and evidence instead of racing stories.
- The interaction uses Motion and original CSS composition; Unicorn Studio remains a low-opacity ambient layer rather than the source of product interaction.

## Verification

- `npm run lint` passes.
- `npm run build` passes with all static routes generated.
- Browser review covered the desktop hero, live parameter selection, hero-to-manifesto transition, detailed system chapters, the fifth horizontal card, the final summary screen, and a responsive viewport.
- The hero uses one original virtual-human raster asset; the old human portrait, uncanny faceless photo, body/armor PNGs and procedural default head are not rendered in the hero.
- The horizontal travel distance is measured from live content width. A single document scroll root preserves `position: sticky`; the final card remains visible before the final summary screen.
