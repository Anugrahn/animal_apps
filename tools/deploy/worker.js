/* In front of the app's files on Cloudflare Workers (wrangler.jsonc).
   It only answers a voice clip asked for in pieces ("Range: bytes=0-1"):
   Safari asks for sound that way and won't play it if the whole file comes
   back instead, and the file host ignores Range. Everything else goes
   straight to the files. */
export default {
  async fetch(request, env) {
    const range = request.headers.get('range');
    const url = new URL(request.url);
    if (!range || !url.pathname.startsWith('/voice/')) return env.ASSETS.fetch(request);
    const whole = await env.ASSETS.fetch(new Request(url, { method: 'GET' }));
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (whole.status !== 200 || !m || (m[1] === '' && m[2] === '')) return whole;
    const buf = await whole.arrayBuffer(), size = buf.byteLength;
    const start = m[1] === '' ? Math.max(0, size - +m[2]) : +m[1];
    const end = m[1] !== '' && m[2] !== '' ? Math.min(+m[2], size - 1) : size - 1;
    if (start >= size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    const headers = new Headers(whole.headers);
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    headers.set('Accept-Ranges', 'bytes');
    return new Response(buf.slice(start, end + 1), { status: 206, headers });
  }
};
