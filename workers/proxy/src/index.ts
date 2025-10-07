interface Env {
  AI_PROVIDER?: string;
  AI_ACCOUNT_ID?: string;
  AI_API_TOKEN?: string;
  AI_MODEL?: string;
  ORIGIN_ALLOW?: string;
}

type GenerateRequest = {
  prompt?: unknown;
  n?: unknown;
};

type CloudflareResult = {
  result?: {
    images?: unknown;
    output?: {
      images?: unknown;
    };
    data?: unknown;
  };
  images?: unknown;
  data?: unknown;
};

const DEFAULT_IMAGE_MIME = 'image/png';
const DEFAULT_IMAGE_COUNT = 6;
const MAX_IMAGE_COUNT = 8;
const MAX_BODY_SIZE = 1024; // 1 KB
const DEFAULT_MODEL = '@cf/black-forest-labs/flux-1-schnell';

const toArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  return [];
};

const normaliseOrigins = (origins: string | undefined): string[] =>
  origins
    ? origins
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    : [];

const pickAllowedOrigin = (request: Request, env: Env): string | null => {
  const requestOrigin = request.headers.get('Origin');
  if (!requestOrigin) {
    return null;
  }

  const allowedOrigins = new Set<string>(normaliseOrigins(env.ORIGIN_ALLOW));

  return allowedOrigins.has(requestOrigin) ? requestOrigin : null;
};

const buildSecurityHeaders = (origin: string | null): HeadersInit => {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(),microphone=(),geolocation=()',
    'cache-control': 'no-store',
    'access-control-allow-methods': 'POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    Vary: 'Origin',
  };

  if (origin) {
    headers['access-control-allow-origin'] = origin;
  }

  return headers;
};

const buildErrorResponse = (status: number, message: string, origin: string | null): Response =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: buildSecurityHeaders(origin),
  });

const ensureEnv = (
  env: Env,
): env is Env & { AI_ACCOUNT_ID: string; AI_API_TOKEN: string } =>
  Boolean(
    env &&
      env.AI_ACCOUNT_ID &&
      env.AI_API_TOKEN &&
      (!env.AI_PROVIDER || env.AI_PROVIDER.toLowerCase() === 'cloudflare'),
  );

const sanitiseCount = (value: unknown): number => {
  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numeric)) {
    return DEFAULT_IMAGE_COUNT;
  }

  const clamped = Math.floor(numeric);
  if (clamped <= 0) {
    return DEFAULT_IMAGE_COUNT;
  }

  if (clamped > MAX_IMAGE_COUNT) {
    return MAX_IMAGE_COUNT;
  }

  return clamped;
};

const toDataUrl = (value: string): string => {
  if (value.startsWith('data:')) {
    return value;
  }

  return `data:${DEFAULT_IMAGE_MIME};base64,${value}`;
};

const extractImages = (payload: CloudflareResult): string[] => {
  const potentialSources = [
    ...toArray(payload?.result?.images),
    ...toArray(payload?.result?.output?.images),
    ...toArray(payload?.result?.data),
    ...toArray(payload?.images),
    ...toArray(payload?.data),
  ];

  return potentialSources
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean)
    .map((entry) => toDataUrl(entry.replace(/^data:[^,]+,/, '')));
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = pickAllowedOrigin(request, env);
    const hasOriginHeader = Boolean(request.headers.get('Origin'));
    if (hasOriginHeader && origin === null) {
      return buildErrorResponse(403, 'Origin not allowed', null);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: buildSecurityHeaders(origin),
      });
    }

    if (request.method !== 'POST') {
      return buildErrorResponse(405, 'Method not allowed', origin);
    }

    if (!ensureEnv(env)) {
      return buildErrorResponse(503, 'Proxy not configured', origin);
    }

    const contentLength = request.headers.get('content-length');
    if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
      return buildErrorResponse(413, 'Request body too large', origin);
    }

    let bodyText = '';
    try {
      bodyText = await request.text();
    } catch (error) {
      return buildErrorResponse(400, 'Invalid request body', origin);
    }

    if (bodyText.length > MAX_BODY_SIZE) {
      return buildErrorResponse(413, 'Request body too large', origin);
    }

    let body: GenerateRequest;
    try {
      body = JSON.parse(bodyText) as GenerateRequest;
    } catch (error) {
      return buildErrorResponse(400, 'Invalid JSON body', origin);
    }

    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt) {
      return buildErrorResponse(400, 'Prompt is required', origin);
    }

    const n = sanitiseCount(body.n);

    try {
      const upstreamResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(env.AI_ACCOUNT_ID)}/ai/run/${encodeURIComponent(
          env.AI_MODEL || DEFAULT_MODEL,
        )}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.AI_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, num_images: n }),
        },
      );

      if (!upstreamResponse.ok) {
        return buildErrorResponse(502, 'Upstream generation failed', origin);
      }

      const result = (await upstreamResponse.json()) as CloudflareResult;
      const images = extractImages(result);

      if (!images.length) {
        return buildErrorResponse(502, 'Upstream returned no images', origin);
      }

      return new Response(JSON.stringify({ images }), {
        status: 200,
        headers: buildSecurityHeaders(origin),
      });
    } catch (error) {
      return buildErrorResponse(502, 'Generation request failed', origin);
    }
  },
};
