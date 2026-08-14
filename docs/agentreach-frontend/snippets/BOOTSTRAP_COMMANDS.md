# Frontend bootstrap commands

Assumption:

- macOS / Linux / WSL2
- Node 22+
- Rust toolchain
- pnpm
- Tauri prerequisites installed

## 1. Create pnpm workspace

```bash
mkdir -p apps packages protected
cat > pnpm-workspace.yaml <<'EOF'
packages:
  - "apps/*"
  - "packages/*"
  - "protected/*"
EOF
```

## 2. Create desktop app

Recommended:

```bash
pnpm create vite apps/desktop --template react-ts
cd apps/desktop

pnpm add \
  three \
  @react-three/fiber \
  @react-three/drei \
  motion \
  zustand \
  xstate \
  @xstate/react \
  @tanstack/react-query \
  zod \
  clsx \
  tailwind-merge \
  lucide-react

pnpm add -D \
  @tauri-apps/cli \
  @tauri-apps/api \
  vitest \
  jsdom \
  @testing-library/react \
  @testing-library/jest-dom \
  @playwright/test

pnpm tauri init
cd ../..
```

## 3. Create shared packages

```bash
for pkg in \
  design-system \
  agent-orb \
  spatial-runtime \
  surface-runtime \
  ui-schema \
  component-registry \
  agency-events \
  agency-state \
  evolution-engine \
  preview-sandbox \
  protocol \
  accessibility \
  telemetry \
  test-kit
do
  mkdir -p "packages/$pkg/src"
  printf '{\n  "name": "@agentreach/%s",\n  "version": "0.0.1",\n  "private": true,\n  "type": "module"\n}\n' "$pkg" > "packages/$pkg/package.json"
done
```

## 4. Protected modules

```bash
for pkg in \
  approval \
  disclosure \
  credentials \
  security \
  update-engine \
  evolution-policy
do
  mkdir -p "protected/$pkg/src"
  printf '{\n  "name": "@agentreach/protected-%s",\n  "version": "0.0.1",\n  "private": true,\n  "type": "module"\n}\n' "$pkg" > "protected/$pkg/package.json"
done
```

## 5. Suggested desktop source tree

```bash
mkdir -p \
  apps/desktop/src/orb \
  apps/desktop/src/halo \
  apps/desktop/src/workspace \
  apps/desktop/src/screens \
  apps/desktop/src/components \
  apps/desktop/src/stores \
  apps/desktop/src/machines \
  apps/desktop/src/lib \
  apps/desktop/src/debug
```

## 6. First runnable target

Implement in this order:

```text
Design tokens
Agency event types
Orb state machine
Orb shader
orb-window
halo-window
Surface Runtime
SELF
LOCAL WORLD
REACH
ACTION
EVIDENCE
Workspace
Engineering Mode
```

## 7. Test commands

```bash
cd apps/desktop
pnpm test
pnpm exec playwright test
pnpm build
pnpm tauri dev
```

## 8. Evolution code workflow

Example:

```bash
git worktree add \
  ../agentreach-ui-evolution-001 \
  -b agent/evolution-001

cd ../agentreach-ui-evolution-001

pnpm install
pnpm lint
pnpm test
pnpm exec playwright test
pnpm build
```

Only after human approval should the branch be merged.

## Important

Do not blindly execute bootstrap commands if the repository already contains an existing frontend. Codex must inspect and migrate/reuse existing code first.
