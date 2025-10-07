# Astro Basics for FaceSmith

A concise, complete primer to be productive with **Astro** in this repository.

---

## 1) Project layout

```text
facesmith/
├─ apps/
│  └─ site/                      # Astro app (frontend)
│     ├─ public/                 # Static assets (copied as-is)
│     │  └─ favicon.svg
│     ├─ src/
│     │  ├─ pages/               # Routes (each .astro = a page)
│     │  │  ├─ index.astro
│     │  │  └─ docs.astro
│     │  ├─ components/          # Reusable UI (React .tsx too)
│     │  │  ├─ ThemeToggle.tsx
│     │  │  ├─ CategoryPicker.tsx
│     │  │  ├─ PromptTuner.tsx
│     │  │  └─ AvatarCard.tsx
│     │  ├─ lib/
│     │  │  ├─ safety/
│     │  │  │  └─ ip-safety.ts
│     │  │  ├─ prompts/
│     │  │  │  └─ categories.ts
│     │  │  ├─ download.ts
│     │  │  └─ generate.ts
│     │  └─ styles/
│     │     └─ tailwind.css
│     ├─ __tests__/              # Jest tests
│     │  ├─ ip-safety.test.ts
│     │  ├─ prompttuner.test.tsx
│     │  └─ themetoggle.test.tsx
│     ├─ astro.config.mjs
│     ├─ tailwind.config.mjs
│     ├─ postcss.config.cjs
│     ├─ jest.config.ts
│     ├─ tsconfig.json
│     ├─ package.json
│     └─ .env.local              # local-only (gitignored)
│
├─ workers/
│  └─ proxy/                     # Cloudflare Worker (AI proxy)
│     ├─ src/
│     │  └─ index.ts
│     ├─ wrangler.toml
│     └─ package.json
│
├─ docs/
│  ├─ AGENTS.md
│  ├─ SECURITY.md
│  └─ astro-basics.md            # ← put this file here
│
├─ .github/workflows/
│  ├─ pages.yml
│  └─ audit.yml
├─ pnpm-workspace.yaml
├─ .gitignore
├─ package.json
├─ LICENSE
└─ README.md
```

---

## 2) Environment variables

Astro (frontend) only reads variables that start with `PUBLIC_`.

Create the local file:

```bash
apps/site/.env.local
```

Example content:

```env
# apps/site/.env.local
PUBLIC_FACESMITH_API_URL="https://facesmith-proxy.<your-subdomain>.workers.dev"
```

You also have an example file in the project root. Copy it with:

```bash
cp .env.example apps/site/.env.local
```

**Secret variables** are *not* stored locally.  
You must set them in the Cloudflare dashboard → your Worker → **Settings → Variables and Secrets**.

Recommended variables:

```text
AI_PROVIDER=cloudflare
AI_ACCOUNT_ID=<your-account-id>
AI_MODEL=@cf/black-forest-labs/flux-1-schnell
ORIGIN_ALLOW=http://localhost:4321,https://<your-pages-domain>
AI_API_TOKEN=<your-api-token>  # Secret type
```

---

## 3) .gitignore essentials

Make sure to ignore temporary and environment files:

```gitignore
# Node / build
node_modules/
dist/
pnpm-debug.log*
.pnpm-store/

# Local env
.env.local
apps/site/.env.local

# Coverage / logs
coverage/
*.log

# OS / editor
.DS_Store
.vscode/
.idea/
```

---

## 4) Run, build & test

From the Astro site directory:

```bash
cd apps/site
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # generates ./dist
pnpm preview    # serves compiled site
pnpm test       # runs Jest + Testing Library
```

From the monorepo root (using workspace filters):

```bash
pnpm -F "*/site" dev
pnpm -F "*/site" test
```

---

## 5) Pages & routing (Astro)

Each `.astro` file inside `src/pages/` becomes a route.

For example:
- `src/pages/index.astro` → `/`
- `src/pages/docs.astro` → `/docs`

Minimal example:

```astro
---
const title = "Hello Astro";
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>{title}</title>
  </head>
  <body>
    <h1>{title}</h1>
  </body>
</html>
```

---

## 6) Using React in Astro

You can include React components (`.tsx`) in Astro and control when to hydrate them:

```astro
---
import ThemeToggle from "../components/ThemeToggle.tsx";
---
<ThemeToggle client:visible />
```

**Hydration directives:**
- `client:load` → hydrates on page load  
- `client:visible` → hydrates when in viewport  
- `client:idle` → hydrates when browser is idle  
- `client:only="react"` → purely client-side, no SSR  

---

## 7) Styling (Tailwind)

Configuration:
- Entry file: `src/styles/tailwind.css`
- Dark mode: toggled via `html.dark` class
- Customization: `tailwind.config.mjs`

If you need to install it:

```bash
npm install -D @astrojs/tailwind tailwindcss
```

Integration in `astro.config.mjs`:

```js
import tailwind from "@astrojs/tailwind";
export default {
  integrations: [tailwind()],
};
```

---

## 8) AI proxy (Cloudflare Worker)

The Worker acts as a secure proxy for the Cloudflare AI API.  
It exposes a `POST /generate` endpoint.

**Request:**

```json
{
  "prompt": "create an original avatar concept",
  "n": 2
}
```

**Response:**

```json
{
  "images": [
    "data:image/png;base64,iVBORw0KGgoAAA...",
    "data:image/png;base64,iVBORw0KGgoBBB..."
  ]
}
```

The client (`src/lib/generate.ts`) handles:
- A max limit of 8 images (`n ≤ 8`)
- Prompt cleaning (`ip-safety.ts`)
- Placeholder fallback on error

Deploy the Worker:

```bash
cd workers/proxy
wrangler deploy
```

Quick test:

```bash
curl -X POST "https://facesmith-proxy.<your-subdomain>.workers.dev/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"original character, graphic novel portrait","n":2}'
```

---

## 9) Security posture

Implemented for FaceSmith:

- **IP Safety:** blocks flagged or banned entities (`src/lib/safety/ip-safety.ts`)
- **CORS:** restricted to domains defined in `ORIGIN_ALLOW`
- **No secrets in client:** only `PUBLIC_` variables are exposed
- **Abuse limits:** payload size (~1KB) and image count limits
- **Secure CSP:** no unsafe `eval` or unsanitized `innerHTML`

---

## 10) Debugging tips

| Problem | Likely cause | Solution |
|----------|--------------|-----------|
| Variables not loading | Missing `.env.local` or `PUBLIC_` prefix | Check `.env` and restart `pnpm dev` |
| 403 from Worker | CORS blocked | Add your domain to `ORIGIN_ALLOW` |
| Images not showing | Missing files in `/public/` | Copy to `/apps/site/public/` |
| Jest + TS errors | Monorepo config mismatch | Run from `apps/site` or use `pnpm -F "*/site" test` |

---

## 11) Common tasks

```bash
# Create a new page
touch apps/site/src/pages/new.astro

# Add a new React component
touch apps/site/src/components/NewComponent.tsx

# Add a new prompt category
code apps/site/src/lib/prompts/categories.ts

# Adjust IP or content filters
code apps/site/src/lib/safety/ip-safety.ts

# Create a new test
touch apps/site/__tests__/feature.test.ts
```

---

## 12) Handy commands (cheatsheet)

```bash
# From the repo root
pnpm install                 # install dependencies
pnpm -r build                # build all packages
pnpm -F "*/site" dev         # start the Astro server
pnpm -F "*/site" test        # run tests

# Worker
cd workers/proxy
wrangler dev                 # local development
wrangler deploy              # deploy to Cloudflare
```

---

## 13) Why Astro?

- 🚀 **Hybrid SSR + SSG:** static by default, dynamic when needed  
- 💡 **Selective hydration:** React only where you need it  
- ⚙️ **Perfect fit for Cloudflare Pages**  
- 💅 **Tailwind + TypeScript built-in**  
- 🧩 **Clean monorepo:** `apps/`, `packages/`, `workers/`

---

## ✅ Summary

FaceSmith combines **Astro + Cloudflare Workers AI** in a secure, modular setup:

- Clear monorepo layout (`apps/`, `workers/`, `packages/`)
- `.env.local` for dev config
- Secrets handled in Cloudflare
- Hardened security (CORS, IP filters, payload limits)
- Jest testing
- Lightweight UI with Tailwind + React
- Fully functional Worker verified with `curl`

---

# Happy coding! 🚀