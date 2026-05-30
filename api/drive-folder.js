// Vercel serverless function — lists image files in a public Google Drive folder
// GET /api/drive-folder?id=FOLDER_ID

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing folder id' });

  try {
    const folderRes = await fetch(
      `https://drive.google.com/drive/folders/${id}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      }
    );

    if (!folderRes.ok) {
      return res.status(502).json({ error: `Drive returned ${folderRes.status}` });
    }

    const html = await folderRes.text();

    const results = [];
    const seen = new Set();

    // Pattern 1: standard Drive folder data embedding
    // Looks for: ["ID","filename.ext",null,null,["image/...
    const re1 = /\["([a-zA-Z0-9_-]{25,})","([^"]+\.(?:png|jpg|jpeg|gif|webp|PNG|JPG|JPEG|GIF|WEBP))"(?:,null){2,},\["image\//gi;
    let m;
    while ((m = re1.exec(html)) !== null) {
      if (!seen.has(m[1])) {
        seen.add(m[1]);
        results.push({ id: m[1], name: m[2].replace(/\.[^.]+$/, '') });
      }
    }

    // Pattern 2: alternate format without mime type nearby
    if (results.length === 0) {
      // Look for file IDs paired with image filenames anywhere in the HTML
      const re2 = /"([a-zA-Z0-9_-]{25,})"[^}]{1,200}"([^"]+\.(?:png|jpg|jpeg|gif|webp))"/gi;
      while ((m = re2.exec(html)) !== null) {
        if (!seen.has(m[1])) {
          seen.add(m[1]);
          results.push({ id: m[1], name: m[2].replace(/\.[^.]+$/, '') });
        }
        if (results.length > 100) break;
      }
    }

    // Pattern 3: new Drive UI - data-id attributes or JSON chunks
    if (results.length === 0) {
      const re3 = /data-id="([a-zA-Z0-9_-]{25,})"/g;
      const nameRe = /title="([^"]+\.(?:png|jpg|jpeg|gif|webp))"/gi;
      const ids = [...html.matchAll(re3)].map(x => x[1]);
      const names = [...html.matchAll(nameRe)].map(x => x[1]);
      for (let i = 0; i < Math.min(ids.length, names.length); i++) {
        if (!seen.has(ids[i])) {
          seen.add(ids[i]);
          results.push({ id: ids[i], name: names[i].replace(/\.[^.]+$/, '') });
        }
      }
    }

    results.sort((a, b) => a.name.localeCompare(b.name));

    // Debug: include html snippet if empty
    if (results.length === 0) {
      const snippet = html.substring(0, 500);
      return res.status(200).json({ debug: snippet, results: [] });
    }

    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json(results);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
