// Vercel serverless function — no CORS issues, runs server-side
// GET /api/drive-folder?id=FOLDER_ID
// Returns: [{id, name}] for all image files in the public folder

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing folder id' });

  try {
    // Fetch the Drive folder page server-side (no CORS restriction)
    const folderRes = await fetch(
      `https://drive.google.com/drive/folders/${id}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
        }
      }
    );
    
    if (!folderRes.ok) throw new Error(`Drive returned ${folderRes.status}`);
    const html = await folderRes.text();

    // Extract file entries from the Drive page JSON data
    // Pattern: ["FILE_ID","FILENAME.ext",null,null,["image/jpeg",...
    const results = [];
    const seen = new Set();
    
    // Primary pattern for image files in Drive folder HTML
    const re = /\["([a-zA-Z0-9_-]{25,})","([^"]+\.(?:png|jpg|jpeg|gif|webp))",null,null,\["image\//gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      if (!seen.has(m[1])) {
        seen.add(m[1]);
        results.push({
          id: m[1],
          name: m[2].replace(/\.[^.]+$/, ''),
        });
      }
    }

    // Sort by name
    results.sort((a, b) => a.name.localeCompare(b.name));
    
    res.setHeader('Cache-Control', 's-maxage=300'); // cache 5 min
    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
