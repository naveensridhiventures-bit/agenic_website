# Agenic Agritech India – QR Product Website
Run:  npm install && ADMIN_PASSWORD="your-strong-password" PUBLIC_URL="https://yourdomain.com" npm start
- Public site: /          - Product page (QR target): /p/<product-id>
- Hidden admin: /agenic-admin (not linked anywhere; change with ADMIN_PATH env)
- Default admin password: agenic@2026  (CHANGE IT via ADMIN_PASSWORD)
Deploy on Render / Railway / any VPS (needs Node 18+ and a persistent disk for /data).
After deploying, open Admin > Products > "QR code" and download the PNG/SVG to print on packs.
