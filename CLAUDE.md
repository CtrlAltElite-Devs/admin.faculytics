# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Faculytics Admin Console — a standalone SPA for monitoring and managing Faculytics API instances across environments (local, staging, production). Built for SUPER_ADMIN users. MVP focuses on Moodle sync monitoring and control.

## Tech Stack

React 19, Vite 8, TypeScript (strict), Tailwind CSS 4, shadcn/ui (new-york style), TanStack React Query, Zustand, React Router, native `fetch` (no Axios), Bun (package manager).

## Commands

- `bun dev` — start dev server (port 4100)
- `bun run build` — production build (runs tsc + vite build)
- `bun run lint` — ESLint

## Architecture

### Multi-environment design

- **Environment store** (`stores/env-store.ts`): persisted to localStorage. Stores environment definitions (label, baseUrl, color).
- **Auth store** (`stores/auth-store.ts`): in-memory only (NOT persisted). Keyed by environment ID. Tokens are cleared on page refresh for security.
- **API client** (`lib/api-client.ts`): thin `fetch` wrapper that resolves the active environment's baseUrl and injects the Bearer token. Handles 401 with silent refresh.

### Feature structure

- `features/auth/` — login page, auth hooks
- `features/health/` — health check indicator (no auth required)
- `features/moodle-sync/` — sync status, trigger, schedule, history
- `features/settings/` — environment management UI

### Routes

| Path | Auth | Description |
|------|------|-------------|
| `/login` | No | Login form for active environment |
| `/settings` | No | Add/edit/remove environments |
| `/sync` | Yes | Moodle sync dashboard |
| `/` | Yes | Redirects to `/sync` |

### Key patterns

- **Native `fetch` only** — do NOT add Axios (supply chain attack concern)
- `erasableSyntaxOnly` is enabled in tsconfig — no `public` constructor parameter properties
- shadcn components are in `src/components/ui/` — use `bunx shadcn add <component>` to add new ones (components.json is configured for `src/` paths)
- Health check calls `GET /health` directly (no auth), all other API calls require JWT via `apiClient()`
- Sync status polling adapts: 3s when active/queued, 30s when idle

## API Endpoints Consumed

All endpoints are prefixed with `/api/v1` (global prefix `api` + URI versioning default `v1`). The `apiClient()` adds this prefix automatically.

- `POST /api/v1/auth/login` — login (no auth)
- `POST /api/v1/auth/refresh` — token refresh
- `GET /api/v1/auth/me` — current user profile
- `GET /api/v1/health` — health check (no auth)
- `GET /api/v1/moodle/sync/status` — sync pipeline state (SUPER_ADMIN)
- `POST /api/v1/moodle/sync` — trigger sync (SUPER_ADMIN)
- `GET /api/v1/moodle/sync/history` — paginated sync history (SUPER_ADMIN)
- `GET /api/v1/moodle/sync/schedule` — current schedule (SUPER_ADMIN)
- `PUT /api/v1/moodle/sync/schedule` — update schedule (SUPER_ADMIN)

When calling `apiClient('/moodle/sync/status')`, the full URL becomes `{baseUrl}/api/v1/moodle/sync/status`.

Types in `src/types/api.ts` mirror the API DTOs defined in `api.faculytics/src/modules/moodle/dto/`.
