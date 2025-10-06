# FaceSmith — Forge your identity
Open-source, IP-safe avatar generator. Minimal Astro + Tailwind + TypeScript app with dark/light mode, Jest tests, and GitHub Pages deployment.

## Prerequisites

- Node.js >= 18.17.0
- pnpm >= 8

## Quick start

```bash
# Check Node.js version
pnpm check-node

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Project structure

This is a monorepo with the following packages:

- `apps/site` - Main Astro application
- `packages/core` - Shared TypeScript utilities
- `workers/proxy` - Cloudflare Worker for API proxy

## Development

```bash
# Install dependencies for all packages
pnpm install

# Start the main site in development mode
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Start Cloudflare Worker development
pnpm dev:worker
```

## Node.js Version Management

If you're using nvm, you can use the included `.nvmrc` file:

```bash
nvm use
```

Or install the required version:

```bash
nvm install 18.17.0
nvm use 18.17.0
```

## Connect an AI engine (Cloudflare Workers AI)

1. Configure the Worker by setting `AI_ACCOUNT_ID`, `AI_API_TOKEN`, and (optionally) `AI_MODEL` in `wrangler.toml`; default model is `@cf/black-forest-labs/flux-1-schnell` if omitted. Define `ORIGIN_ALLOW` as a comma-separated list of allowed origins and be sure to include `http://localhost:4321` for local development. Secrets such as `AI_API_TOKEN` should be stored with `wrangler secret put`.
2. Deploy the proxy from `workers/proxy` using Wrangler (`pnpm --filter @facesmith/proxy-worker dev` for testing, `pnpm --filter @facesmith/proxy-worker deploy` to publish).
3. Create `apps/site/.env.local` and set `PUBLIC_FACESMITH_API_URL="https://<your-worker-subdomain>/api"` pointing to the deployed Worker.
4. Run `pnpm --filter site dev` and generate avatars. If the env variable is present the site will call the Worker and render returned images; otherwise the placeholder generator remains in use for offline demos.

### Security notes

Prompts are sanitized on the client before they reach the proxy. The Worker enforces CORS using `ORIGIN_ALLOW` and sets defensive headers; do not log prompts in production environments to preserve user privacy.
