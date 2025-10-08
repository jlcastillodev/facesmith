interface Env {
  AI: any;
  AI_API_TOKEN?: string;
  AI_ACCOUNT_ID?: string;
  AI_PROVIDER?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    
    // Debug endpoint to test AI service directly
    if (url.pathname === '/debug-ai') {
      try {
        console.log('🔧 Debug: Testing AI service directly');
        
        const testResponse = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
          prompt: 'simple test image',
        });
        
        console.log('🔍 Debug: AI Response details:', {
          type: typeof testResponse,
          isArrayBuffer: testResponse instanceof ArrayBuffer,
          isUint8Array: testResponse instanceof Uint8Array,
          length: testResponse?.length || 'unknown',
          constructor: testResponse?.constructor?.name || 'unknown',
          firstBytes: testResponse instanceof Uint8Array ? Array.from(testResponse.slice(0, 20)) : 'N/A'
        });
        
        return new Response(JSON.stringify({
          success: true,
          debug: {
            type: typeof testResponse,
            isArrayBuffer: testResponse instanceof ArrayBuffer,
            isUint8Array: testResponse instanceof Uint8Array,
            length: testResponse?.length || 'unknown',
            constructor: testResponse?.constructor?.name || 'unknown',
            firstBytes: testResponse instanceof Uint8Array ? Array.from(testResponse.slice(0, 20)) : 'N/A',
            hasData: !!testResponse,
            // Show the actual structure if it's an object
            objectKeys: typeof testResponse === 'object' ? Object.keys(testResponse || {}) : 'N/A',
            objectStructure: typeof testResponse === 'object' ? JSON.stringify(testResponse, null, 2).substring(0, 1000) : 'N/A'
          }
        }), {
          status: 200,
          headers: corsHeaders
        });
      } catch (error) {
        console.error('💥 Debug: AI test failed:', error);
        return new Response(JSON.stringify({
          error: 'AI test failed',
          details: error instanceof Error ? error.message : String(error)
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }
    
    // Health check endpoint
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(
        JSON.stringify({ 
          status: 'healthy',
          worker: 'facesmith-proxy',
          hasAI: !!env.AI,
          timestamp: new Date().toISOString()
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    if (url.pathname === '/generate' && request.method === 'POST') {
      try {
        console.log('🚀 Worker: Generate request received');
        
        // Check if AI binding is available
        if (!env.AI) {
          console.error('❌ Worker: AI binding not available');
          return new Response(
            JSON.stringify({ 
              error: 'AI binding not available',
              details: 'Cloudflare AI binding is not configured'
            }), 
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        const body = await request.json();
        const { prompt, n = 1 } = body;
        
        if (!prompt || typeof prompt !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Invalid prompt' }), 
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        console.log('📝 Worker: Generating images for prompt:', prompt);
        console.log('🔢 Worker: Requested count:', n);

        // Try different models based on availability
        const models = [
          '@cf/black-forest-labs/flux-1-schnell',
          '@cf/stabilityai/stable-diffusion-xl-base-1.0',
          '@cf/lykon/dreamshaper-8-lcm'
        ];
        
        let modelToUse = models[0]; // Default to Flux
        console.log('🤖 Worker: Trying model:', modelToUse);

        // Generate images using Cloudflare AI
        const images = [];
        const maxImages = Math.min(n, 20); // Increased limit to 20 images
        
        for (let i = 0; i < maxImages; i++) {
          try {
            console.log(`🎨 Worker: Generating image ${i + 1}/${maxImages}`);
            
            const response = await env.AI.run(modelToUse, {
              prompt: prompt,
            });

            console.log(`🔍 Worker: Response for image ${i + 1}:`, {
              type: typeof response,
              isArrayBuffer: response instanceof ArrayBuffer,
              isUint8Array: response instanceof Uint8Array,
              length: response?.length || 'unknown',
              constructor: response?.constructor?.name || 'unknown',
              // Log first few bytes to understand format
              firstBytes: response instanceof Uint8Array ? Array.from(response.slice(0, 10)) : 'N/A'
            });

            // Handle Cloudflare AI response - it returns an object with base64 image data
            let base64Data = null;
            
            if (response && typeof response === 'object' && response.image) {
              // Cloudflare AI returns { image: "base64-encoded-image-data" }
              console.log(`✅ Worker: Found base64 image in response.image (${response.image.length} chars)`);
              base64Data = response.image;
            } else if (response instanceof Uint8Array) {
              // Direct Uint8Array response (fallback)
              console.log(`🔧 Worker: Processing Uint8Array of length ${response.length}`);
              
              // Check if it looks like a valid image (PNG starts with 0x89, 0x50, 0x4E, 0x47)
              const isPNG = response[0] === 0x89 && response[1] === 0x50 && response[2] === 0x4E && response[3] === 0x47;
              const isJPEG = response[0] === 0xFF && response[1] === 0xD8;
              console.log(`🔍 Worker: Image format check - PNG: ${isPNG}, JPEG: ${isJPEG}`);
              
              base64Data = btoa(String.fromCharCode.apply(null, Array.from(response)));
              console.log(`✅ Worker: Converted Uint8Array to base64 (${base64Data.length} chars)`);
            } else if (response instanceof ArrayBuffer) {
              // Convert ArrayBuffer to base64
              const uint8Array = new Uint8Array(response);
              console.log(`🔧 Worker: Processing ArrayBuffer of length ${response.byteLength}`);
              base64Data = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
              console.log(`✅ Worker: Converted ArrayBuffer to base64 (${base64Data.length} chars)`);
            } else {
              console.error('❌ Worker: Unexpected response type:', typeof response);
              console.log('Raw response keys:', response ? Object.keys(response) : 'null');
            }

            if (base64Data && base64Data.length > 100) {
              // Cloudflare AI returns JPEG images, so use the appropriate MIME type
              const dataUrl = base64Data.startsWith('data:') ? base64Data : `data:image/jpeg;base64,${base64Data}`;
              images.push(dataUrl);
              console.log(`🎉 Worker: Image ${i + 1} successfully created as data URL (${dataUrl.length} chars)`);
            } else {
              console.error(`❌ Worker: No valid image data found for image ${i + 1}`);
              console.error('Response details:', {
                type: typeof response,
                hasData: !!base64Data,
                dataLength: base64Data?.length || 0,
                responseKeys: response ? Object.keys(response) : 'null'
              });
            }
          } catch (imageError) {
            console.error(`💥 Worker: Error generating image ${i + 1}:`, imageError);
          }
        }

        if (images.length === 0) {
          console.error('❌ Worker: No images generated');
          return new Response(
            JSON.stringify({ 
              error: 'No images generated',
              details: 'AI service did not return valid images'
            }), 
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        console.log(`🎉 Worker: Successfully generated ${images.length} images`);
        
        return new Response(
          JSON.stringify({ 
            images,
            count: images.length,
            model: modelToUse,
            success: true
          }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      } catch (error) {
        console.error('💥 Worker: Generation error:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
          }), 
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    return new Response('Not Found', { 
      status: 404, 
      headers: corsHeaders 
    });
  },
};
