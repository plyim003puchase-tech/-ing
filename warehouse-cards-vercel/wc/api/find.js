const { index } = require('./_drive');

// POST { codes: ["SN-05014", ...] }  ->  { ids: { "SN-05014": "<driveFileId>" } }
module.exports = async function (req, res) {
  try {
    const codes = (req.body && req.body.codes) || [];
    const map = await index();
    const ids = {};
    codes.forEach(function (c) {
      const k = String(c).trim().toUpperCase();
      if (map[k]) ids[k] = map[k];
    });
    res.status(200).json({ ids: ids });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
};
