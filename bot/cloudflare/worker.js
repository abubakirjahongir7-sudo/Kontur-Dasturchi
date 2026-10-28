// Bepul Cloudflare Worker: Rossiya serveridan Gemini, Claude va Notion API'lariga so'rovlarni uzatadi.
// O'rnatish: bot/README.md → «Bepul yo'l: Cloudflare Worker».
// Worker sozlamalarida PROXY_SECRET (Secret) qo'shing — usiz Worker hech kimga xizmat qilmaydi,
// shunda begonalar uni o'z so'rovlari uchun ishlata olmaydi.

const ROUTES = {
  "/gemini/": "https://generativelanguage.googleapis.com/",
  "/anthropic/": "https://api.anthropic.com/",
  "/notion/": "https://api.notion.com/",
};

export default {
  async fetch(request, env) {
    if (!env.PROXY_SECRET || request.headers.get("x-proxy-secret") !== env.PROXY_SECRET) {
      return new Response("Forbidden", { status: 403 });
    }
    const url = new URL(request.url);
    for (const [prefix, target] of Object.entries(ROUTES)) {
      if (url.pathname.startsWith(prefix)) {
        const headers = new Headers(request.headers);
        headers.delete("x-proxy-secret");
        headers.delete("host");
        try {
          return await fetch(target + url.pathname.slice(prefix.length) + url.search, {
            method: request.method,
            headers,
            body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(),
          });
        } catch (err) {
          return Response.json({ error: { code: 502, message: String(err) } }, { status: 502 });
        }
      }
    }
    return new Response("Not found", { status: 404 });
  },
};
