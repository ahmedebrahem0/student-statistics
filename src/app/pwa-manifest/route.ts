import type { MetadataRoute } from 'next';

// Only internal pages are allowed as the installed app's start page.
const ALLOWED_START = /^\/(?:student(?:\/\d+)?|teachers\/\d+)?$/;

export function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get('start') ?? '/';
  const start = ALLOWED_START.test(requested) ? requested : '/';

  const manifest: MetadataRoute.Manifest = {
    id: start,
    name: 'Big Education',
    short_name: 'Big Education',
    description: 'متابعة تطور الأداء الدراسي والدرجات عبر السنوات — BIG EDUCATION',
    lang: 'ar',
    dir: 'rtl',
    start_url: start,
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#032629',
    theme_color: '#032629',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
