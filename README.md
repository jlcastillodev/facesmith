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

## Environment configuration

Create `apps/site/.env.local` and set the Cloudflare Worker base URL. The frontend reads `PUBLIC_` variables only:

```env
PUBLIC_FACESMITH_API_URL="https://facesmith-proxy.<your-subdomain>.workers.dev"
```

Ensure your Worker `ORIGIN_ALLOW` (or equivalent CORS allow list) includes **both** `http://localhost:4321` for local development and `https://<your-pages-domain>` for production deployments.

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

### Generate → Preview → Download flow

- **Generate:** The primary action requests a batch of six avatars via the Worker proxy. The preview card shows a loading overlay, sets `aria-busy="true"`, and disables all controls until the request finishes.
- **Preview:** On success the first returned data URL replaces the main preview image, and a thumbnail grid lists the entire batch with keyboard-focusable tiles announced as “Generated avatar #N”.
- **Download:** Bulk and per-image download buttons appear only after a successful batch. Each button calls `downloadDataUrl` with the proxy-provided data URLs so users always download the real images, not placeholders.

If generation fails, the placeholder image remains visible, the non-blocking toast appears, and all download controls stay hidden.

### Security notes

Prompts are sanitized on the client before they reach the proxy. The Worker enforces CORS using `ORIGIN_ALLOW` and sets defensive headers; do not log prompts in production environments to preserve user privacy.
