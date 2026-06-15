# LinkedIn Clone — Frontend

Next.js 16 app para a rede social profissional com analytics.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Abre [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Backend

O API roda em `http://127.0.0.1:8080` (veja `../backend`).

```bash
cd ../backend
cp .env.example .env
docker compose up -d --build
curl -X POST http://127.0.0.1:8080/v1/internal/seed-demo -H "X-Internal-Token: dev-internal-token"
```

Login demo: `alice@demo.com` / `password123`

## Páginas

| Rota | Descrição |
|---|---|
| `/feed` | Feed com A/B variant, posts, sugestões |
| `/search` | Busca pessoas e posts |
| `/network` | Grafo Cytoscape + influenciadores |
| `/analytics` | DAU, churn, coortes, top posts |
| `/users/{slug}` | Perfil público |
