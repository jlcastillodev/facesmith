export interface Env {
  CLOUDFLARE_API_TOKEN?: string;
  REPLICATE_API_TOKEN?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (!env.CLOUDFLARE_API_TOKEN && !env.REPLICATE_API_TOKEN) {
      return new Response(JSON.stringify({ error: 'Missing upstream credentials' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    const body = await request.json<{ prompt: string; category: string }>();
    return new Response(
      JSON.stringify({
        message: 'Proxy stub. Connect your AI provider here.',
        prompt: body.prompt,
        category: body.category,
      }),
      {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
        },
      }
    );
  },
};
