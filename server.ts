import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  let surahList: any[] = [];
  try {
    const res = await fetch("https://api.alquran.cloud/v1/surah");
    const data = await res.json();
    surahList = data.data;
  } catch (err) {
    console.error("Failed to fetch surah list for SEO:", err);
  }

  let vite: any;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // Use custom to handle HTML ourselves
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist"), { index: false }));
  }

  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *\nAllow: /\n\nSitemap: ${req.protocol}://${req.get("host")}/sitemap.xml`);
  });

  app.get("/sitemap.xml", (req, res) => {
    const host = `${req.protocol}://${req.get("host")}`;
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>${host}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
    
    for (const surah of surahList) {
      xml += `  <url><loc>${host}/${surah.number}</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>\n`;
    }
    
    xml += `</urlset>`;
    res.type("application/xml");
    res.send(xml);
  });

  app.get("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip for non-HTML requests
    if (url.includes(".") && !url.endsWith(".html")) {
      return next();
    }

    try {
      const surahIdMatch = url.match(/^\/(\d+)$/);
      const surahId = surahIdMatch ? parseInt(surahIdMatch[1], 10) : null;

      let title = "Al Quran - Read, Study, and Learn The Noble Quran";
      let description = "Read, study, and learn The Noble Quran with translations, AI Tafsir, and literal word-for-word translation.";

      if (surahId && surahList.length > 0) {
        const surah = surahList.find((s) => s.number === surahId);
        if (surah) {
          title = `Surah ${surah.englishName} (${surah.name}) - Al Quran`;
          description = `Read Surah ${surah.englishName} (${surah.englishNameTranslation}) with ${surah.numberOfAyahs} ayahs. Includes translations, AI Tafsir, and literal word-for-word translation.`;
        }
      }

      let initialData: any = {};
      
      if (surahId) {
        try {
          // Fetch the surah details for SSR
          // We fetch all languages by default for SSR to ensure content is available
          const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-uthmani,en.sahih,pt.elhayek,bn.bengali,ar.alafasy`);
          const data = await res.json();
          initialData.surahDetail = data.data;
        } catch (err) {
          console.error(`Failed to fetch surah ${surahId} for SSR:`, err);
        }
      } else {
        initialData.surahs = surahList;
      }

      let templatePath = process.env.NODE_ENV === "production" 
        ? path.join(__dirname, "dist", "index.html")
        : path.join(__dirname, "index.html");
      
      let template = fs.readFileSync(templatePath, "utf-8");

      let render: any;
      if (process.env.NODE_ENV !== "production") {
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
      } else {
        // In production, we need to load the built server entry
        // We'll need to make sure build script builds it
        const serverEntryPath = path.join(__dirname, "dist", "server", "entry-server.js");
        if (fs.existsSync(serverEntryPath)) {
          render = (await import(serverEntryPath)).render;
        }
      }

      const host = `${req.protocol}://${req.get("host")}`;
      const canonical = `${host}${url === "/" ? "" : url}`;

      const seoTags = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
`;

      // Replace the existing title tag and inject other meta tags
      template = template.replace(/<title>.*?<\/title>/, seoTags);

      let appHtml = "";
      if (render) {
        try {
          appHtml = render(url, initialData);
        } catch (e) {
          console.error("SSR render error:", e);
        }
      }

      // Inject the rendered HTML and initial data
      const scriptTag = `<script>window.__INITIAL_DATA__ = ${JSON.stringify(initialData).replace(/</g, '\\u003c')}</script>`;
      template = template.replace(`<!--ssr-outlet-->`, appHtml);
      template = template.replace(`</body>`, `${scriptTag}\n  </body>`);
      // Also replace <div id="root"></div> if ssr-outlet is not present
      if (!template.includes('<!--ssr-outlet-->')) {
        template = template.replace(`<div id="root"></div>`, `<div id="root">${appHtml}</div>`);
      }

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      if (process.env.NODE_ENV !== "production") {
        vite.ssrFixStacktrace(e as Error);
      }
      next(e);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
