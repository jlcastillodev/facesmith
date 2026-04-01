# FaceSmith Setup Guide

This guide will help you set up FaceSmith to work with real AI image generation.

## Prerequisites

- Cloudflare account with access to Workers AI
- Node.js >= 18.17.0
- pnpm >= 8

## Step 1: Get Cloudflare Credentials

1. **Get your Cloudflare Account ID:**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Copy your Account ID from the right sidebar

2. **Create an AI API Token:**
   - Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Click "Create Token"
   - Use "Custom token" template
   - Set permissions: `Zone:Zone:Read`, `Account:Cloudflare Workers:Edit`
   - Include: `All accounts`

## Step 2: Configure Environment Variables

Update `/apps/site/.env.local`:

```bash
# Facesmith Configuration
PUBLIC_FACESMITH_API_URL="https://facesmith-proxy.joseluisdev34.workers.dev"

# Cloudflare Worker Configuration
CLOUDFLARE_ACCOUNT_ID="your-actual-account-id-here"
CLOUDFLARE_AI_API_TOKEN="your-actual-api-token-here"

# Optional: AI Model Configuration
CLOUDFLARE_AI_MODEL="@cf/black-forest-labs/flux-1-schnell"

# Development settings
NODE_ENV="development"
```

## Step 3: Configure the Cloudflare Worker

1. **Update worker configuration:**
   Edit `/workers/proxy/wrangler.toml`:
   ```toml
   [vars]
   AI_ACCOUNT_ID = "your-actual-account-id-here"
   ORIGIN_ALLOW = "http://localhost:4321,https://yourdomain.com"
   ```

2. **Set the API token as a secret:**
   ```bash
   cd workers/proxy
   wrangler secret put AI_API_TOKEN
   # Enter your Cloudflare AI API token when prompted
   ```

3. **Deploy the worker:**
   ```bash
   cd workers/proxy
   wrangler deploy
   ```

## Step 4: Test the Setup

1. **Test the worker directly:**
   ```bash
   curl -X POST "https://facesmith-proxy.joseluisdev34.workers.dev/generate" \
     -H "Content-Type: application/json" \
     -H "Origin: http://localhost:4321" \
     -d '{"prompt": "cyberpunk avatar", "n": 1}'
   ```

2. **Start the development server:**
   ```bash
   pnpm dev
   ```

3. **Test in the browser:**
   - Go to http://localhost:4321
   - Enter a prompt and click "Generate"
   - You should see real AI-generated images

## Step 5: Troubleshooting

### Common Issues:

1. **503 Error "Proxy not configured":**
   - Check that AI_ACCOUNT_ID and AI_API_TOKEN are set correctly
   - Ensure the account ID is not the placeholder value

2. **403 Error "Origin not allowed":**
   - Add your domain to ORIGIN_ALLOW in wrangler.toml
   - Redeploy the worker

3. **502 Error "Upstream generation failed":**
   - Check your Cloudflare AI API token permissions
   - Verify you have access to Workers AI

4. **Text response instead of images:**
   - Ensure you're using an image generation model like `@cf/black-forest-labs/flux-1-schnell`
   - Check the model name in wrangler.toml

### Debug Mode:

Enable debug logging by opening browser console and checking for:
- 🚀 Generation starting
- 📡 Making API request  
- 📥 API response
- ✅ API response payload

## Alternative Setup (Without Cloudflare)

If you prefer to use a different AI service, you can:

1. **Use OpenAI DALL-E:**
   ```bash
   # Set in .env.local
   PUBLIC_FACESMITH_API_URL="your-custom-api-endpoint"
   OPENAI_API_KEY="your-openai-key"
   ```

2. **Use any other image generation API:**
   - Create a custom proxy server
   - Ensure it accepts POST requests with `{prompt: string, n: number}`
   - Return `{images: string[]}` where images are base64 data URLs

## Demo Mode

If you don't want to set up real AI generation, the app works perfectly in demo mode:
- Beautiful SVG avatars generated client-side
- Full download functionality (individual + ZIP)
- Complete UX flow demonstration

Just leave `PUBLIC_FACESMITH_API_URL` empty or remove it from `.env.local`.