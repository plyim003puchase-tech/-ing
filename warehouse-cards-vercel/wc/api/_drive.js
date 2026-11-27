const { GoogleAuth } = require('google-auth-library');

// Your two main Drive folders (subfolders are searched automatically).
// You can override them in Vercel with an environment variable FOLDER_IDS
// (comma separated).
const DEFAULT_FOLDERS = ['1yT_gv5joZaRIDy2STxTKWvYKBT3ZW4FY', '1A3MCC31UVnOnOjvPbtOfaC5rVWc3OQ5t'];
const FOLDERS = (process.env.FOLDER_IDS ? process.env.FOLDER_IDS.split(',') : DEFAULT_FOLDERS)
  .map(function (s) { return s.trim(); }).filter(Boolean);

let auth = null;
function client() {
  if (!auth) {
    auth = new GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });
  }
  return auth.getClient();
}
async function gget(url, opts) {
  const c = await client();
  return c.request(Object.assign({ url: url }, opts || {}));
}

async function listFolder(id) {
  let files = [], token = '';
  do {
    const q = encodeURIComponent("'" + id + "' in parents and trashed=false");
    const url = 'https://www.googleapis.com/drive/v3/files?q=' + q +
      '&pageSize=1000&fields=nextPageToken,files(id,name,mimeType)' +
      '&supportsAllDrives=true&includeItemsFromAllDrives=true' +
      (token ? '&pageToken=' + encodeURIComponent(token) : '');
    const r = await gget(url);
    files = files.concat(r.data.files || []);
    token = r.data.nextPageToken || '';
  } while (token);
  return files;
}

// Walks all folders and subfolders. Result is remembered for 10 minutes.
let cache = { t: 0, map: null };
async function index() {
  if (cache.map && Date.now() - cache.t < 600000) return cache.map;
  const map = {};
  let level = FOLDERS.slice();
  while (level.length) {
    const next = [];
    for (let i = 0; i < level.length; i += 8) {
      const res = await Promise.all(level.slice(i, i + 8).map(listFolder));
      res.forEach(function (files) {
        files.forEach(function (f) {
          if (f.mimeType === 'application/vnd.google-apps.folder') next.push(f.id);
          else if (/\.(jpe?g|png)$/i.test(f.name)) {
            const k = f.name.replace(/\.(jpe?g|png)$/i, '').trim().toUpperCase();
            if (!map[k]) map[k] = f.id;
          }
        });
      });
    }
    level = next;
  }
  cache = { t: Date.now(), map: map };
  return map;
}

module.exports = { index, gget, client };
