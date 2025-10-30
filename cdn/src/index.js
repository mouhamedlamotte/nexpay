/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Fichiers disponibles
    const files = {
      '/install.sh': 'https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/install.sh',
      '/docker-compose.yml': 'https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/docker-compose.yml',
      '/.env.example': 'https://raw.githubusercontent.com/mouhamedlamotte/nexpay/main/.env.example'
    };
    
    const githubUrl = files[url.pathname];
    if (!githubUrl) {
      return new Response('File not found', { status: 404 });
    }
    
    // Proxy vers GitHub
    const response = await fetch(githubUrl);
    
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }
};