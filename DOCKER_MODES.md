# Frontend Docker Modes

This folder now supports two Docker modes.

## 1) Development (hot reload)
Uses `Dockerfile.dev` and mounts source files.

```bash
docker compose -f docker-compose.dev.yml up --build
```

Open: `http://localhost:3001`

## 2) Production (nginx static)
Uses `Dockerfile.prod` and serves optimized build via Nginx.

```bash
docker compose -f docker-compose.prod.yml up --build
```

Open: `http://localhost:3001`

## Files
- `Dockerfile.dev`
- `Dockerfile.prod`
- `docker-compose.dev.yml`
- `docker-compose.prod.yml`
