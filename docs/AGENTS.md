# FaceSmith Automation Guide

Welcome to the FaceSmith monorepo. Please follow these conventions whenever you automate work, write prompts, or generate patches within this documentation tree and its descendants.

## Workflow expectations
- Use **pnpm** for dependency management. Run commands from the repo root unless a package-specific command is required (then `cd` into that package first).
- Always run `pnpm test` within `apps/site` after modifying TypeScript, React, or safety libraries.
- Linting is handled by TypeScript and Jest in this starter; prefer type-safe changes over stylistic mass edits.
- Keep commits small, descriptive, and security-focused. Do not commit secrets, API tokens, or environment-specific artefacts.

## Code style
- Favor functional, pure utilities in `src/lib` and re-export them through `packages/core` for reuse.
- Prefer TypeScript types over `any`. Use `unknown` when input sanitization is needed.
- React components should remain framework-agnostic islands: avoid Astro-specific APIs inside `.tsx` files.
- Keep Tailwind classes semantic and co-locate component-specific styles using utility classes instead of custom CSS when possible.

## Testing guidance
- Use Testing Library for interactive components. Assert on user-visible text or ARIA roles rather than implementation details.
- Safety utilities require deterministic tests that cover both compliant and blocked prompts.

## Security posture
- Maintain the Content Security Policy defined in `astro.config.mjs`.
- Preserve the IP-safety guardrails: never remove blocklist checks or sanitization without providing stronger alternatives.
- When integrating external AI services, route secrets through environment variables and never hard-code them in source.

## Documentation
- Update `docs/SECURITY.md` if you change threat modeling, CSP directives, or safety logic.
- Keep README quick-start steps accurate for new contributors.
