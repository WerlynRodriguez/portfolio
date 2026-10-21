import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://werlyn.dev/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://werlyn.dev/" />
    <xhtml:link rel="alternate" hreflang="es" href="https://werlyn.dev/es/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://werlyn.dev/" />
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://werlyn.dev/es/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://werlyn.dev/" />
    <xhtml:link rel="alternate" hreflang="es" href="https://werlyn.dev/es/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://werlyn.dev/" />
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`.trim();

  return new Response(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
