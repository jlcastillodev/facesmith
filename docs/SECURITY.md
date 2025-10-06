# Security Overview

FaceSmith is designed to ship secure defaults for an IP-safe avatar generation pipeline. This document summarizes the key controls and how to extend them.

## Threat model
- **Prompt abuse**: users attempting to reference copyrighted or trademarked entities.
- **Supply chain risk**: dependency vulnerabilities in the Astro frontend.
- **Content injection**: cross-site scripting (XSS) or malicious asset loading through user prompts or integrations.
- **Secrets exposure**: accidental leakage of API keys for future AI providers.

## Current controls
- **Content Security Policy**: Strict CSP defined in `apps/site/astro.config.mjs` with `default-src 'self'`, locked-down script/style allowances, and denied framing.
- **Input sanitization**: `apps/site/src/lib/safety/ip-safety.ts` strips disallowed terms, normalizes whitespace, and rewrites prompts to generic descriptors before any generation requests are created.
- **Prompt rewrite for safety**: `cleanPrompt` removes brand references and ensures sanitized categories, returning both flagged terms and a safe fallback prompt.
- **Dependency hygiene**: GitHub Actions `audit.yml` runs `pnpm audit --prod` against the site workspace on a schedule, complemented by Dependabot for npm packages.
- **Secrets handling**: No secrets committed. Future integrations must rely on environment variables (e.g., `CLOUDFLARE_API_TOKEN`) injected via GitHub Secrets or worker KV. The worker stub demonstrates environment variable typing.
- **Testing**: Jest tests assert sanitization, prompt rewriting, and theme toggling behaviour to avoid regressions.

## Extending securely
- When integrating external AI services, use the proxy worker pattern (`workers/proxy`) to keep secrets server-side.
- Update the CSP if remote asset hosting is required; document the reasoning here and prefer hashed/scriptless approaches.
- Expand the prompt blocklist with normalized lower-case strings, and add regression tests.
- Apply the principle of least privilege for GitHub Actions: grant deploy keys only to the Pages workflow.

If you discover a vulnerability, please open a private security advisory via GitHub rather than filing a public issue.
