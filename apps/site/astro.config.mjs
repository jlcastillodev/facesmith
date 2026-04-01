import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === 'true' && repository.length > 0;
const githubPagesBase = isGitHubPagesBuild ? `/${repository}/` : '/';
const githubPagesSite = process.env.GITHUB_PAGES === 'true'
  ? `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io`
  : undefined;

const cspDirectives = {
  'default-src': ["'self'"],
  'img-src': ["'self'", 'data:'],
  'style-src': ["'self'", "'unsafe-inline'"],
  'script-src': ["'self'"],
  'connect-src': ["'self'"],
  'font-src': ["'self'"],
};

const securityHeaders = {
  'Content-Security-Policy': Object.entries(cspDirectives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; '),
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'accelerometer=(), ambient-light-sensor=(), autoplay=(), camera=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), usb=()'
};

export default defineConfig({
  output: 'static',
  base: githubPagesBase,
  site: githubPagesSite,
  integrations: [react(), tailwind({ config: { applyBaseStyles: false } })],
  security: {
    checkOrigin: true,
    securityHeaders,
  },
  vite: {
    build: {
      target: 'esnext',
    },
    optimizeDeps: {
      include: ['file-saver', 'jszip'],
      force: true
    },
    ssr: {
      noExternal: ['file-saver']
    },
    define: {
      global: 'globalThis',
    }
  },
});
