# Movie Data Warehouse Frontend

A course project for exploring an Amazon movie data warehouse. The React dashboard compares results and query times from PostgreSQL, Spark, and Neo4j. It also includes movie lineage, a static ETL report, and query history views.

## Stack

React 18, TypeScript, Vite 8, Ant Design 5, TanStack Query, Axios, and ECharts 6.

## Run locally

Requires Node.js 20.19+ or 22.12+ and a compatible backend. The backend is a separate project and is not included here.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Set `API_PROXY_TARGET` in `.env.local` to the backend origin if it does not run at `http://localhost:8080`. Open the URL printed by Vite, usually `http://localhost:5173`.

The app sends requests to `/api` by default. `VITE_API_BASE_URL` may change that public browser-side path. Values prefixed with `VITE_` are exposed in the client bundle, so they must never contain passwords, tokens, or private service addresses. A production host needs its own `/api` reverse proxy or an explicitly configured public API URL with appropriate CORS settings.

## Available views

| View | Features |
| --- | --- |
| Statistics and Comparison | Movies by time, genres, ratings, collaborations, versions, director and actor works, advanced filtering, and popular groups |
| Data Lineage | Movie source pages, merged movie details, and field provenance |
| ETL Overview | Static figures from the course ETL report, including cleaning and enrichment charts |
| System Logs | Query history returned by the backend |

The statistics view calls `/stats/*` endpoints with `pg`, `spark`, or `neo4j` engine parameters. The lineage view calls `/lineage/movie/{movieId}`; the logs view calls `/system/logs`. The ETL overview uses report figures stored in the frontend, rather than live API data. Features depend on the backend returning the expected response shapes.

## Checks

```bash
npm run typecheck
npm run build
```

## Before publishing

- Review `.env.local`, local data, screenshots, and backend configuration before committing. `.env*` files are ignored except `.env.example`.
- Check all Git history, branches, tags, and commit author metadata. Earlier commits in this project contained a hardcoded public backend address; changing `vite.config.ts` does not remove it from Git history. Publish a fresh repository from the cleaned files if that address must be absent from public history, or coordinate a history rewrite before making an existing repository public.
- Check that the backend enforces its own access controls, especially for `/system/logs` and any endpoints that expose underlying data. Frontend configuration does not secure a backend.
- Confirm that you have the rights to publish any data, project documentation, or third-party assets you add. Add a license if you intend to permit reuse.
