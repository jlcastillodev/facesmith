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
