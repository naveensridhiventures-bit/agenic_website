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
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOADS = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOADS, { recursive: true });

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
    emoji: '🥞',
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
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
const load = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const save = (d) => fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2));
const slug = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

app.use(express.json({ limit: '8mb' }));
app.use('/uploads', express.static(UPLOADS, { maxAge: '7d' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- auth ----------
const sessions = new Set();
const auth = (req, res, next) => {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  if (sessions.has(t)) return next();
  res.status(401).json({ error: 'Unauthorized' });
};
let fails = {};
app.post('/api/admin/login', (req, res) => {
  const ip = req.ip;
  fails[ip] = fails[ip] || { n: 0, t: Date.now() };
  if (fails[ip].n >= 8 && Date.now() - fails[ip].t < 15 * 60 * 1000) return res.status(429).json({ error: 'Too many attempts. Try later.' });
  const a = Buffer.from(String(req.body.password || ''));
  const b = Buffer.from(ADMIN_PASSWORD);
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
    delete fails[ip];
    const t = crypto.randomBytes(24).toString('hex');
    sessions.add(t);
    return res.json({ token: t });
  }
  fails[ip].n++; fails[ip].t = Date.now();
  res.status(401).json({ error: 'Wrong password' });
});

// ---------- public API ----------
app.get('/api/products', (req, res) => {
  const d = load();
  res.json(d.products.map(p => ({ ...p, vendor: d.vendors.find(v => v.id === p.vendorId) || null })));
});
app.get('/api/products/:id', (req, res) => {
  const d = load();
  const p = d.products.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json({ ...p, vendor: d.vendors.find(v => v.id === p.vendorId) || null });
});

// ---------- admin API ----------
app.get('/api/admin/data', auth, (req, res) => res.json(load()));

function saveImage(dataUrl) {
  const m = /^data:image\/(png|jpe?g|webp);base64,(.+)$/.exec(dataUrl || '');
  if (!m) return null;
  const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
  const name = crypto.randomBytes(8).toString('hex') + '.' + ext;
  fs.writeFileSync(path.join(UPLOADS, name), Buffer.from(m[2], 'base64'));
  return '/uploads/' + name;
}
const arr = (v) => Array.isArray(v) ? v.map(String).map(s => s.trim()).filter(Boolean) : String(v || '').split('\n').map(s => s.trim()).filter(Boolean);
const str = (v, n = 2000) => String(v || '').slice(0, n);

app.post('/api/admin/products', auth, (req, res) => {
  const d = load(); const b = req.body;
  if (!b.name) return res.status(400).json({ error: 'Name required' });
  const existing = b.id && d.products.find(p => p.id === b.id);
  const id = existing ? existing.id : (slug(b.name) + (d.products.some(p => p.id === slug(b.name)) ? '-' + Date.now().toString(36) : ''));
  let image = existing ? existing.image : '';
  if (b.imageData) image = saveImage(b.imageData) || image;
  if (b.removeImage) image = '';
  const p = {
    id, name: str(b.name, 120), tagline: str(b.tagline, 200), category: str(b.category, 60) || 'General',
    vendorId: str(b.vendorId, 80), emoji: str(b.emoji, 8) || '🛒', image,
    description: str(b.description), highlights: arr(b.highlights), ingredients: str(b.ingredients),
    storage: str(b.storage), howToUse: arr(b.howToUse), shelfLife: str(b.shelfLife, 100), pack: str(b.pack, 150),
    mrp: str(b.mrp, 40), batchNote: str(b.batchNote, 200), fssai: str(b.fssai, 30), featured: !!b.featured
  };
  if (existing) d.products[d.products.indexOf(existing)] = p; else d.products.push(p);
  save(d); res.json(p);
});
app.delete('/api/admin/products/:id', auth, (req, res) => {
  const d = load(); d.products = d.products.filter(p => p.id !== req.params.id); save(d); res.json({ ok: true });
});
app.post('/api/admin/vendors', auth, (req, res) => {
  const d = load(); const b = req.body;
  if (!b.name) return res.status(400).json({ error: 'Name required' });
  const existing = b.id && d.vendors.find(v => v.id === b.id);
  const id = existing ? existing.id : (slug(b.name) + (d.vendors.some(v => v.id === slug(b.name)) ? '-' + Date.now().toString(36) : ''));
  const v = { id, name: str(b.name, 150), established: str(b.established, 20), incorporated: str(b.incorporated, 100), address: str(b.address, 400), fssai: str(b.fssai, 30), phone: str(b.phone, 30), email: str(b.email, 100), about: str(b.about) };
  if (existing) d.vendors[d.vendors.indexOf(existing)] = v; else d.vendors.push(v);
  save(d); res.json(v);
});
app.delete('/api/admin/vendors/:id', auth, (req, res) => {
  const d = load();
  if (d.products.some(p => p.vendorId === req.params.id)) return res.status(400).json({ error: 'Vendor has products. Reassign or delete them first.' });
  d.vendors = d.vendors.filter(v => v.id !== req.params.id); save(d); res.json({ ok: true });
});

// ---------- QR ----------
const baseUrl = (req) => (process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
app.get('/api/qr/:id.:fmt', async (req, res) => {
  const d = load();
  if (!d.products.some(p => p.id === req.params.id)) return res.status(404).end();
  const url = `${baseUrl(req)}/p/${req.params.id}`;
  const opts = { errorCorrectionLevel: 'H', margin: 2, color: { dark: '#0b4f1a', light: '#ffffff' }, width: 1024 };
  try {
    if (req.params.fmt === 'svg') { res.type('svg').send(await QRCode.toString(url, { ...opts, type: 'svg' })); }
    else {
      const buf = await QRCode.toBuffer(url, opts);
      if (req.query.download) res.set('Content-Disposition', `attachment; filename="agenic-${req.params.id}-qr.png"`);
      res.type('png').send(buf);
    }
  } catch (e) { res.status(500).end(); }
});
app.get('/api/qr-url/:id', (req, res) => res.json({ url: `${baseUrl(req)}/p/${req.params.id}` }));

// ---------- pages ----------
app.get('/p/:id', (req, res) => res.sendFile(path.join(__dirname, 'public/product.html')));
app.get(ADMIN_PATH, (req, res) => { res.set('X-Robots-Tag', 'noindex'); res.sendFile(path.join(__dirname, 'public/admin.html')); });

app.listen(PORT, () => console.log(`Agenic site running on http://localhost:${PORT}  (admin: ${ADMIN_PATH})`));
