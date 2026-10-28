// Bepul Cloudflare Worker: Rossiya serveridan Telegram, Gemini, Claude va Notion API'lariga so'rovlarni uzatadi.
// O'rnatish: bot/README.md → «Bepul yo'l: Cloudflare Worker».
// Worker sozlamalarida PROXY_SECRET (Secret) qo'shing — usiz Worker hech kimga xizmat qilmaydi,
// shunda begonalar uni o'z so'rovlari uchun ishlata olmaydi.

const ROUTES = {
  "/gemini/": "https://generativelanguage.googleapis.com/",
  "/anthropic/": "https://api.anthropic.com/",
  "/notion/": "https://api.notion.com/",
};
// Telegram kutubxonasi (aiogram) qo'shimcha sarlavha yubora olmaydi, shuning uchun parol manzilda bo'ladi:
// /telegram/<PROXY_SECRET>/bot<token>/<method>
const TELEGRAM = "https://api.telegram.org/";

// AI uzoq o'ylaganda jim turgan ulanish yo'lda uzilib qolishi mumkin. «x-keepalive: 1» so'rovlarida javobni
// kutish paytida har 5 soniyada probel yuboramiz, oxirida esa {"status": ..., "body": "..."} ni qaytaramiz.
const KEEPALIVE_MS = 5000;

export default {
  async fetch(request, env, ctx) {
    const secret = env.PROXY_SECRET;
    if (!secret) {
      return new Response("Forbidden", { status: 403 });
    }
    const url = new URL(request.url);

    const tgPrefix = `/telegram/${secret}/`;
    if (url.pathname.startsWith(tgPrefix)) {
      return proxy(TELEGRAM + url.pathname.slice(tgPrefix.length) + url.search, request, false, ctx);
    }

    if (request.headers.get("x-proxy-secret") !== secret) {
      return new Response("Forbidden", { status: 403 });
    }
    for (const [prefix, target] of Object.entries(ROUTES)) {
      if (url.pathname.startsWith(prefix)) {
        const upstream = target + url.pathname.slice(prefix.length) + url.search;
        return proxy(upstream, request, request.headers.get("x-keepalive") === "1", ctx);
      }
    }
    return new Response("Not found", { status: 404 });
  },
};

async function proxy(upstream, request, keepalive, ctx) {
  const headers = new Headers(request.headers);
  headers.delete("x-proxy-secret");
  headers.delete("x-keepalive");
  headers.delete("host");
  const init = {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(),
  };

  if (!keepalive) {
    try {
      return await fetch(upstream, init);
    } catch (err) {
      return Response.json({ error: { code: 502, message: String(err) } }, { status: 502 });
    }
  }

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const enc = new TextEncoder();
  const timer = setInterval(() => writer.write(enc.encode(" ")).catch(() => {}), KEEPALIVE_MS);
  ctx.waitUntil((async () => {
    let status = 502;
    let body;
    try {
      const r = await fetch(upstream, init);
      status = r.status;
      body = await r.text();
    } catch (err) {
      body = JSON.stringify({ error: { code: 502, message: String(err) } });
    }
    clearInterval(timer);
    await writer.write(enc.encode(JSON.stringify({ status, body })));
    await writer.close();
  })());
  return new Response(readable, {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store, no-transform",
      "x-keepalive": "1",
    },
  });
}
