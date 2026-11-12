const express = require('express');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'agenic@2026';
const ADMIN_PATH = process.env.ADMIN_PATH || '/agenic-admin'; // hidden admin URL
const DATA_DIR = path.join(__dirname, 'data');
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const seed = {
  vendors: [{
    id: 'sridhi-ventures',
    name: 'Sridhi Ventures Private Limited',
    established: '2016',
    incorporated: 'April 2024 (ROC Chennai)',
    address: 'No. 48, Meenatchi Nagar, Annai Nagar, Korattur RS, Ambattur, Tiruvallur, Chennai, Tamil Nadu – 600076',
    fssai: '12424999000342',
    phone: '',
    email: '',
    about: 'Fresh idli & dosa batter, dosa mix and idly mix makers — supplying industrial caterers, leading hotel chains, retail stores and supermarkets across Chennai, with home delivery and a dealer & distributor network.'
  }],
  products: [{
    id: 'idly-dosa-batter',
    name: 'Idly & Dosa Batter',
    tagline: 'Fresh stone-ground goodness, ready to pour.',
    category: 'Batters',
    vendorId: 'sridhi-ventures',
    image: '',
    description: 'Freshly prepared idli & dosa batter made from carefully selected rice and urad dal, ground to the perfect consistency for soft, fluffy idlis and crisp golden dosas. No shortcuts — just the traditional taste your family trusts.',
    highlights: ['Freshly made', 'No preservatives*', 'Soft & fluffy idlis', 'Crisp golden dosas', 'Hygienically packed'],
    ingredients: 'Rice, Urad Dal, Fenugreek, Salt, Water',
    storage: 'Store refrigerated at 2–8°C. Consume within the date mentioned on the pack. Do not freeze.',
    howToUse: ['Take out the batter and keep at room temperature for 10 minutes.', 'Stir gently and add a little water if required.', 'Idli: pour into greased moulds and steam for 10–12 minutes.', 'Dosa: spread on a hot tawa, drizzle oil and cook until golden.'],
    shelfLife: '2–3 days refrigerated',
    pack: '500 g · 1 kg · Bulk packs',
    mrp: '',
    batchNote: '',
    fssai: '12424999000342',
    featured: true
  }]
};

// ---------- storage: Upstash/Vercel KV when configured, else local files (/tmp on read-only hosts) ----------
async function kv(cmd) {
  const r = await fetch(KV_URL, { method: 'POST', headers: { Authorization: 'Bearer ' + KV_TOKEN, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
let LOCAL = DATA_DIR;
try { fs.mkdirSync(path.join(DATA_DIR, 'uploads'), { recursive: true }); fs.accessSync(DATA_DIR, fs.constants.W_OK); }
catch { LOCAL = '/tmp/agenic-data'; fs.mkdirSync(path.join(LOCAL, 'uploads'), { recursive: true }); }
const DB_FILE = path.join(LOCAL, 'db.json');
const store = {
  async load() {
    if (KV_URL) { const v = await kv(['GET', 'agenic:db']); if (v) return JSON.parse(v); await kv(['SET', 'agenic:db', JSON.stringify(seed)]); return JSON.parse(JSON.stringify(seed)); }
    if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  },
  async addEnquiry(e) { if (KV_URL) return kv(['LPUSH', 'agenic:enq', JSON.stringify(e)]); const f = path.join(LOCAL, 'enq.json'); const a = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f)) : []; a.unshift(e); fs.writeFileSync(f, JSON.stringify(a)); },
  async listEnquiries() { if (KV_URL) return (await kv(['LRANGE', 'agenic:enq', 0, 199])).map(x => JSON.parse(x)); const f = path.join(LOCAL, 'enq.json'); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f)) : []; },
  async save(d) { if (KV_URL) return kv(['SET', 'agenic:db', JSON.stringify(d)]); fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2)); },
  async putImage(name, buf, mime) {
    if (KV_URL) return kv(['SET', 'agenic:img:' + name, mime + '|' + buf.toString('base64')]);
    fs.writeFileSync(path.join(LOCAL, 'uploads', name), buf);
  },
  async getImage(name) {
    if (KV_URL) { const v = await kv(['GET', 'agenic:img:' + name]); if (!v) return null; const i = v.indexOf('|'); return { mime: v.slice(0, i), buf: Buffer.from(v.slice(i + 1), 'base64') }; }
    const f = path.join(LOCAL, 'uploads', name);
    if (!fs.existsSync(f)) return null;
    return { mime: 'image/' + (name.endsWith('png') ? 'png' : name.endsWith('webp') ? 'webp' : 'jpeg'), buf: fs.readFileSync(f) };
  }
};
const withLogo = v => v ? { ...v, logo: v.logo || (v.id === 'sridhi-ventures' ? '/img/sridhi.png' : '') } : v;
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(e => { console.error(e); res.status(500).json({ error: 'Server error: ' + e.message }); });

const slug = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

app.set('trust proxy', true);
app.use(express.json({ limit: '6mb' }));

// ---------- auth (stateless signed token: works on serverless) ----------
const sign = (p) => crypto.createHmac('sha256', ADMIN_PASSWORD + '|agenic').update(p).digest('hex');
const makeToken = () => { const exp = Date.now() + 12 * 3600 * 1000; return exp + '.' + sign(String(exp)); };
const validToken = (t) => { const [exp, sig] = String(t || '').split('.'); if (!exp || !sig || Date.now() > +exp) return false; const a = Buffer.from(sig), b = Buffer.from(sign(exp)); return a.length === b.length && crypto.timingSafeEqual(a, b); };
const auth = (req, res, next) => validToken((req.headers.authorization || '').replace('Bearer ', '')) ? next() : res.status(401).json({ error: 'Unauthorized' });
const fails = {};
app.post('/api/admin/login', (req, res) => {
  const ip = req.ip;
  fails[ip] = fails[ip] || { n: 0, t: Date.now() };
  if (fails[ip].n >= 8 && Date.now() - fails[ip].t < 15 * 60 * 1000) return res.status(429).json({ error: 'Too many attempts. Try later.' });
  const a = Buffer.from(String(req.body.password || '')), b = Buffer.from(ADMIN_PASSWORD);
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) { delete fails[ip]; return res.json({ token: makeToken() }); }
  fails[ip].n++; fails[ip].t = Date.now();
  res.status(401).json({ error: 'Wrong password' });
});

// ---------- uploaded images ----------
app.get('/uploads/:name', wrap(async (req, res) => {
  const img = await store.getImage(req.params.name.replace(/[^a-z0-9.]/gi, ''));
  if (!img) return res.status(404).end();
  res.set('Cache-Control', 'public, max-age=604800').type(img.mime).send(img.buf);
}));

// ---------- public API ----------
app.get('/api/products', wrap(async (req, res) => {
  const d = await store.load();
  res.json(d.products.map(p => ({ ...p, vendor: withLogo(d.vendors.find(v => v.id === p.vendorId)) || null })));
}));
app.get('/api/products/:id', wrap(async (req, res) => {
  const d = await store.load();
  const p = d.products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({ ...p, vendor: withLogo(d.vendors.find(v => v.id === p.vendorId)) || null });
}));

app.get('/api/vendors', wrap(async (req, res) => {
  const d = await store.load();
  res.json(d.vendors.map(withLogo).map(({ id, name, established, incorporated, address, fssai, phone, email, about, logo }) => ({ id, name, established, incorporated, address, fssai, phone, email, about, logo })));
}));
const enqHits = {};
app.post('/api/enquiry', wrap(async (req, res) => {
  const ip = req.ip, now = Date.now();
  enqHits[ip] = (enqHits[ip] || []).filter(t => now - t < 3600e3);
  if (enqHits[ip].length >= 5) return res.status(429).json({ error: 'Too many enquiries. Please try later.' });
  const b = req.body;
  if (!b.name || !b.phone || !b.message) return res.status(400).json({ error: 'Name, phone and message are required' });
  enqHits[ip].push(now);
  await store.addEnquiry({ at: new Date().toISOString(), name: str(b.name, 100), org: str(b.org, 120), phone: str(b.phone, 30), email: str(b.email, 100), type: str(b.type, 60), message: str(b.message, 1500) });
  res.json({ ok: true });
}));
app.get('/api/admin/enquiries', auth, wrap(async (req, res) => res.json(await store.listEnquiries())));

// ---------- admin API ----------
app.get('/api/admin/data', auth, wrap(async (req, res) => res.json(await store.load())));

async function saveImage(dataUrl) {
  const m = /^data:image\/(png|jpe?g|webp);base64,(.+)$/.exec(dataUrl || '');
  if (!m) return null;
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const name = crypto.randomBytes(8).toString('hex') + '.' + ext;
  await store.putImage(name, Buffer.from(m[2], 'base64'), 'image/' + (ext === 'jpg' ? 'jpeg' : ext));
  return '/uploads/' + name;
}
const arr = (v) => Array.isArray(v) ? v.map(String).map(s => s.trim()).filter(Boolean) : String(v || '').split('\n').map(s => s.trim()).filter(Boolean);
const str = (v, n = 2000) => String(v || '').slice(0, n);

app.post('/api/admin/products', auth, wrap(async (req, res) => {
  const d = await store.load(); const b = req.body;
  if (!b.name) return res.status(400).json({ error: 'Name required' });
  const existing = b.id && d.products.find(p => p.id === b.id);
  const id = existing ? existing.id : (slug(b.name) + (d.products.some(p => p.id === slug(b.name)) ? '-' + Date.now().toString(36) : ''));
  let image = existing ? existing.image : '';
  if (b.imageData) image = (await saveImage(b.imageData)) || image;
  if (b.removeImage) image = '';
  const p = {
    id, name: str(b.name, 120), tagline: str(b.tagline, 200), category: str(b.category, 60) || 'General',
    vendorId: str(b.vendorId, 80), image,
    description: str(b.description), highlights: arr(b.highlights), ingredients: str(b.ingredients),
    storage: str(b.storage), howToUse: arr(b.howToUse), shelfLife: str(b.shelfLife, 100), pack: str(b.pack, 150),
    mrp: str(b.mrp, 40), batchNote: str(b.batchNote, 200), fssai: str(b.fssai, 30), featured: !!b.featured
  };
  if (existing) d.products[d.products.indexOf(existing)] = p; else d.products.push(p);
  await store.save(d); res.json(p);
}));
app.delete('/api/admin/products/:id', auth, wrap(async (req, res) => {
  const d = await store.load(); d.products = d.products.filter(p => p.id !== req.params.id); await store.save(d); res.json({ ok: true });
}));
app.post('/api/admin/vendors', auth, wrap(async (req, res) => {
  const d = await store.load(); const b = req.body;
  if (!b.name) return res.status(400).json({ error: 'Name required' });
  const existing = b.id && d.vendors.find(v => v.id === b.id);
  const id = existing ? existing.id : (slug(b.name) + (d.vendors.some(v => v.id === slug(b.name)) ? '-' + Date.now().toString(36) : ''));
  let logo = existing ? (existing.logo || '') : '';
  if (b.imageData) logo = (await saveImage(b.imageData)) || logo;
  if (b.removeImage) logo = '';
  const v = { id, logo, name: str(b.name, 150), established: str(b.established, 20), incorporated: str(b.incorporated, 100), address: str(b.address, 400), fssai: str(b.fssai, 30), phone: str(b.phone, 30), email: str(b.email, 100), about: str(b.about) };
  if (existing) d.vendors[d.vendors.indexOf(existing)] = v; else d.vendors.push(v);
  await store.save(d); res.json(v);
}));
app.delete('/api/admin/vendors/:id', auth, wrap(async (req, res) => {
  const d = await store.load();
  if (d.products.some(p => p.vendorId === req.params.id)) return res.status(400).json({ error: 'Vendor has products. Reassign or delete them first.' });
  d.vendors = d.vendors.filter(v => v.id !== req.params.id); await store.save(d); res.json({ ok: true });
}));

// ---------- QR ----------
const baseUrl = (req) => (process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
app.get('/api/qr/:id.:fmt', wrap(async (req, res) => {
  const d = await store.load();
  if (!d.products.some(p => p.id === req.params.id)) return res.status(404).end();
  const url = `${baseUrl(req)}/p/${req.params.id}`;
  const opts = { errorCorrectionLevel: 'H', margin: 2, color: { dark: '#0b4f1a', light: '#ffffff' }, width: 1024 };
  if (req.params.fmt === 'svg') return res.type('svg').send(await QRCode.toString(url, { ...opts, type: 'svg' }));
  const buf = await QRCode.toBuffer(url, opts);
  if (req.query.download) res.set('Content-Disposition', `attachment; filename="agenic-${req.params.id}-qr.png"`);
  res.type('png').send(buf);
}));
app.get('/api/qr-site.:fmt', wrap(async (req, res) => {
  const url = baseUrl(req) + '/';
  const opts = { errorCorrectionLevel: 'H', margin: 2, color: { dark: '#0a4a18', light: '#ffffff' }, width: 1024 };
  if (req.params.fmt === 'svg') return res.type('svg').send(await QRCode.toString(url, { ...opts, type: 'svg' }));
  const buf = await QRCode.toBuffer(url, opts);
  if (req.query.download) res.set('Content-Disposition', 'attachment; filename="agenic-website-qr.png"');
  res.type('png').send(buf);
}));
app.get('/api/qr-site-url', (req, res) => res.json({ url: baseUrl(req) + '/' }));
app.get('/api/qr-url/:id', (req, res) => res.json({ url: `${baseUrl(req)}/p/${req.params.id}` }));

// ---------- pages (local run; on Vercel these are handled by rewrites in vercel.json) ----------
app.use(express.static(path.join(__dirname, 'public')));
app.get('/p/:id', (req, res) => res.sendFile(path.join(__dirname, 'public/product.html')));
app.get(ADMIN_PATH, (req, res) => { res.set('X-Robots-Tag', 'noindex'); res.sendFile(path.join(__dirname, 'public/admin.html')); });

module.exports = app;
if (require.main === module) app.listen(PORT, () => console.log(`Agenic site running on http://localhost:${PORT}  (admin: ${ADMIN_PATH})`));
