# Backend bootstrap commands

以下默认：

- macOS / Linux / WSL2
- Python 3.12+
- uv
- Docker
- PostgreSQL
- Node 22+（用于部分工具）

如果已有仓库，Codex 必须先扫描现有结构再执行，不能机械重建。

## 1. 初始化后端

```bash
mkdir -p backend
cd backend

uv init --python 3.12
```

## 2. 依赖

```bash
uv add \
  fastapi \
  "uvicorn[standard]" \
  pydantic \
  pydantic-settings \
  sqlalchemy \
  alembic \
  aiosqlite \
  asyncpg \
  "psycopg[binary]" \
  pgvector \
  httpx \
  orjson \
  structlog \
  cryptography \
  pyjwt \
  authlib \
  python-multipart \
  jsonschema \
  tenacity \
  networkx \
  "mcp[cli]" \
  opentelemetry-api \
  opentelemetry-sdk \
  opentelemetry-exporter-otlp \
  opentelemetry-instrumentation-fastapi \
  opentelemetry-instrumentation-httpx

uv add --dev \
  pytest \
  pytest-asyncio \
  pytest-cov \
  ruff \
  mypy \
  pre-commit
```

## 3. 目录

```bash
mkdir -p \
  src/agentreach/api \
  src/agentreach/identity \
  src/agentreach/agency/kernel \
  src/agentreach/agency/planner \
  src/agentreach/agency/context \
  src/agentreach/memory/episodic \
  src/agentreach/memory/semantic \
  src/agentreach/memory/preference \
  src/agentreach/memory/relational \
  src/agentreach/memory/procedural \
  src/agentreach/habits/collector \
  src/agentreach/habits/normalizer \
  src/agentreach/habits/pattern_miner \
  src/agentreach/habits/synthesizer \
  src/agentreach/aip/registry \
  src/agentreach/aip/compiler \
  src/agentreach/aip/runtime \
  src/agentreach/capabilities/registry \
  src/agentreach/capabilities/resolver \
  src/agentreach/entities/registry \
  src/agentreach/entities/graph \
  src/agentreach/affordances/resolver \
  src/agentreach/models/router \
  src/agentreach/models/providers \
  src/agentreach/actions/gateway \
  src/agentreach/actions/adapters/filesystem \
  src/agentreach/actions/adapters/shell \
  src/agentreach/actions/adapters/mcp \
  src/agentreach/actions/adapters/browser \
  src/agentreach/actions/adapters/accessibility \
  src/agentreach/actions/adapters/vision \
  src/agentreach/policy/engine \
  src/agentreach/policy/delegation \
  src/agentreach/policy/disclosure \
  src/agentreach/policy/approval \
  src/agentreach/verification/engine \
  src/agentreach/verification/evidence \
  src/agentreach/network/gateway \
  src/agentreach/network/claims \
  src/agentreach/network/presence \
  src/agentreach/network/mailbox \
  src/agentreach/network/trust_domains \
  src/agentreach/agentteams/bridge \
  src/agentreach/observability/traces \
  src/agentreach/observability/audit \
  src/agentreach/evolution/proposals \
  src/agentreach/evolution/sandbox \
  src/agentreach/evolution/release \
  tests/unit \
  tests/contracts \
  tests/integration \
  tests/security \
  tests/evals
```

## 4. Alembic

```bash
uv run alembic init migrations
```

## 5. PostgreSQL + pgvector

项目根目录：

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: agentreach
      POSTGRES_PASSWORD: agentreach
      POSTGRES_DB: agentreach
    ports:
      - "5432:5432"
```

启动：

```bash
docker compose up -d postgres
```

启用：

```bash
docker exec -it agentreach-postgres \
  psql -U agentreach -d agentreach \
  -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

## 6. 开发服务器

```bash
cd backend

uv run uvicorn \
  agentreach.main:app \
  --app-dir src \
  --reload \
  --port 8000
```

## 7. MCP 开发

```bash
uv run mcp dev \
  src/agentreach/mcp/personal/server.py
```

## 8. 测试

```bash
uv run ruff check .
uv run mypy src
uv run pytest -q
uv run pytest tests/contracts -q
uv run pytest tests/integration -q
uv run pytest tests/security -q
```

## 9. Code Evolution worktree

```bash
git worktree add \
  ../agentreach-backend-evolution-001 \
  -b agent/backend-evolution-001

cd ../agentreach-backend-evolution-001

cd backend
uv sync

uv run ruff check .
uv run mypy src
uv run pytest -q
```

通过后才能进入 preview / canary / merge。

## 10. 推荐 Makefile 目标

```text
make db
make api
make test
make lint
make mcp
make eval
make agentteams-status
make skills-list
make evolution-test
```
