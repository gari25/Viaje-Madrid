// ViajeX Worker: conserva los archivos estáticos y reserva /api para servicios autenticados.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'API aún no habilitada' }), {
        status: 503,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
      });
    }
    return env.ASSETS.fetch(request);
  }
};
