# AgentReach × Lando interaction fidelity audit

Reference inspected: `https://landonorris.com/` (public desktop markup and styles, August 2026).

The implementation reproduces the interaction grammar and visual pacing with original AgentReach content and assets. It does not copy Lando Norris logos, photography, copy, or proprietary 3D material.

| Reference mechanism | AgentReach implementation | Status |
| --- | --- | --- |
| 200vh sticky hero | `ImmersiveHero` with a 200vh track and 100vh sticky stage | Complete |
| Central interactive WebGL subject | Layered faceless body, independent armor/mask field, R3F atmosphere, pointer spring parallax | Complete |
| Oversized condensed hero typography | Full-bleed `MY / AI` typography behind the subject | Complete |
| Fixed navigation and chapter metadata | Persistent AgentReach navigation, chapter number, privacy state | Complete |
| Vertical side data module | Live agent system card replacing the racing “next event” module | Complete |
| Scroll-position feedback | Fixed mixed-blend progress rail and section progress line | Complete |
| Full-screen message transition | Animated manifesto marquee and oversized editorial statement | Complete |
| Pinned horizontal content sequence | Five trust-system cards move across a 500vh sticky track | Complete |
| Responsive fallback | Horizontal sequence becomes a vertical stacked story below 620px | Complete |
| Reduced-motion support | Existing global reduced-motion policy plus static card fallback | Complete |
| Original AgentReach product flows | Reach, capsule, connected state, trace, composer, persona controls remain wired | Complete |

## Intentional differences

- The subject is a faceless personal-agent body, not a driver likeness or helmet.
- Armor and mask appear as an independent capability layer rather than being baked onto the base body.
- The horizontal chapter explains privacy, agency, tools, relations, and evidence instead of racing stories.
- The implementation uses Motion and CSS rather than copying the reference site's Webflow/Three runtime.

## Verification

- `npm run lint` passes.
- `npm run build` passes with all static routes generated.
- Browser review covered the desktop hero, hero-to-manifesto transition, horizontal atlas entry, and responsive overflow behavior.
