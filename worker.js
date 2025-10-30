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