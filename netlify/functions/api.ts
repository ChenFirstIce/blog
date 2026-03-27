import express from "express";
import serverless from "serverless-http";

const app = express();

// API Route: Proxy Bilibili Anime List
app.get("/api/bilibili/anime", async (req, res) => {
  const vmid = process.env.BILIBILI_UID;
  
  if (!vmid) {
    return res.status(400).json({ 
      code: -1, 
      message: "BILIBILI_UID environment variable is not set. Please add it in Netlify Environment Variables." 
    });
  }

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

export const handler = serverless(app);
