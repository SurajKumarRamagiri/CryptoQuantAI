# DriftForge Operations Runbook

## Services
- Frontend: Vite app in frontend/
- Backend: FastAPI app in backend/
- Contracts: OpenAPI checks in contracts/
- DB policies: SQL and RLS templates in db/

## Local Start
1. Install Node 22 and pnpm 10.
2. Install Python 3.12.
3. Copy .env.example to .env and set secrets.
4. Run backend and frontend commands from README.

## Gate Commands
- Gate A/B/C/D commands are defined in plan section 15.10 and mirrored in root scripts.

## Recovery and Rollback
- For local development, rollback means restarting services and restoring baseline fixtures.
- Production rollback must be documented per deployment pipeline history.
