const { gget, client } = require('./_drive');

// GET /api/photo?id=<driveFileId>  ->  the photo as a medium-size JPEG/PNG
module.exports = async function (req, res) {
  try {
    const id = String(req.query.id || '');
    if (!/^[\w-]+$/.test(id)) { res.status(400).send('bad id'); return; }

    let buf = null, type = 'image/jpeg';
    const meta = await gget('https://www.googleapis.com/drive/v3/files/' + id +
      '?fields=thumbnailLink,mimeType&supportsAllDrives=true');
    const link = meta.data.thumbnailLink;
    if (link) {
      const url = link.replace(/=s\d+$/, '=w800');
      try {
        const r = await gget(url, { responseType: 'arraybuffer' });
        buf = Buffer.from(r.data);
        type = (r.headers && r.headers['content-type']) || type;
      } catch (e) { buf = null; }
    }
    if (!buf) { // fallback: the original file (must be under about 4 MB)
      const r = await gget('https://www.googleapis.com/drive/v3/files/' + id +
        '?alt=media&supportsAllDrives=true', { responseType: 'arraybuffer' });
      buf = Buffer.from(r.data);
      type = meta.data.mimeType || type;
    }
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.status(200).send(buf);
  } catch (e) {
    res.status(500).send(String(e && e.message ? e.message : e));
  }
};
