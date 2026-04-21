import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { getBilibiliUid } from "./src/lib/bilibiliConfig";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route: Proxy Bilibili Anime List
  app.get("/api/bilibili/anime", async (req, res) => {
    const vmid = getBilibiliUid(process.env);

    const pn = req.query.pn || "1";
    const ps = req.query.ps || "30";
    
    try {
      const response = await fetch(
        `https://api.bilibili.com/x/space/bangumi/follow/list?type=1&follow_status=0&pn=${pn}&ps=${ps}&vmid=${vmid}`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://space.bilibili.com/"
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Bilibili API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Bilibili anime:", error);
      res.status(500).json({ error: "Failed to fetch Bilibili anime list" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
