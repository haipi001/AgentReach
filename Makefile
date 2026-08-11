.PHONY: api web build test e2e demo

api:
	python3 scripts/run_demo.py

web:
	cd apps/web && pnpm dev

build:
	cd apps/web && pnpm build

test:
	python3 scripts/validate_day0.py
	python3 -m pytest -q
	cd apps/web && pnpm lint

e2e:
	cd apps/web && pnpm test:e2e

demo:
	@echo "Terminal 1: make api"
	@echo "Terminal 2: make web"
	@echo "Open: http://127.0.0.1:3000"
