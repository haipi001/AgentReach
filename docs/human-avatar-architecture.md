# Human avatar architecture

## Product rule

The avatar is the embodied view of a Personal Agent. It is not the agent's identity, authority, policy, or memory. Changing a face can never change what the agent may know or do.

```text
SELF                    AGENCY                  WORLD                   EVIDENCE
face + body + memory -> intent + approval -> people + tools + acts -> proof + recall
        appearance          authority               effect                 trust
```

The person begins from SELF. AGENCY mediates every transition into WORLD. Only independently verified effects enter EVIDENCE and become memory.

## Rendering and intelligence layers

| Layer | Responsibility | Runtime | Status |
| --- | --- | --- | --- |
| Web renderer | Faceless BASE, detached MASK/ARMOR layers, local GLB rendering | Browser | Implemented |
| Avatar profile | Portable appearance and privacy contract | Local JSON | Implemented |
| MMHuman3D / SMPL-X | Body shape, pose parameters, mesh recovery | Optional local GPU service | Planned |
| MMPose | Body, hand, and face landmark estimation | Optional local GPU service | Planned |
| PhotoMaker | Consent-based, identity-consistent portrait assets | Private GPU media service | Planned |
| CharacterGLM | Persona-consistent dialogue candidate generation | Isolated dialogue service | Planned |

## Decisions from reference research

- MMHuman3D is the body-model integration layer, not a browser renderer. It supports SMPL, SMPL-X, MANO, FLAME, and related models. Model files have their own licenses and are never committed to this repository.
- MMPose produces observations and pose estimates. These are untrusted inputs until the user confirms them; they do not grant authority.
- PhotoMaker produces consistent 2D identity imagery. Source portraits are biometric-sensitive input and remain opt-in, private, revocable, and outside the default web path.
- CharacterGLM can propose dialogue in a chosen voice. It cannot approve disclosure, contact people, or perform world actions.

## High-fidelity model contract

The browser accepts a local rigged GLB for a high-fidelity body. The object URL is transient and is not included in persisted Zustand state. Without a qualified model, the product shows a cropped faceless BASE while MASK and ARMOR remain visibly detached interface layers. This keeps identity, capability and authority legible as separate systems.

The next rendering gate is a morph-target adapter for licensed GLB or VRM assets. It will map the portable avatar profile to named facial morphs without coupling face appearance to identity or permissions.

## Privacy boundary

- Local model import is session-only.
- Portrait uploads and biometric landmarks default to `false` in the avatar profile.
- Generated faces must be clearly user-owned or used with consent.
- Model weights, SMPL-X assets, and reference portraits are excluded from Git.
- An avatar service may return mesh or texture artifacts, never policy or action grants.

## Primary references

- [MMHuman3D](https://github.com/open-mmlab/mmhuman3d)
- [MMPose](https://github.com/open-mmlab/mmpose)
- [PhotoMaker](https://github.com/TencentARC/PhotoMaker)
- [CharacterGLM-6B](https://huggingface.co/thu-coai/CharacterGLM-6B)
