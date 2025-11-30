Deployment checklist for API E-commerce (VPS)

1) Prerequisites on VPS
- Ubuntu 20.04+ (or other Linux). Adjust commands for your distro.
- Node.js 18+ installed (recommended). Check with `node -v`.
- npm installed.
- A process manager: `pm2` (recommended) or systemd service.
- Nginx (recommended) if you want to serve via port 80/443 and reverse-proxy to the app.

2) Secure secrets
- Do NOT commit `.env` or `serviceAccountKey.json` to git.
- Add `.env` and `serviceAccountKey.json` to `.gitignore` (already present).
- On the VPS, create the `.env` file with real values (or set environment variables in the service manager):

Example `.env` (on server):

PORT=3003
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
RESEND_API_KEY=your_real_resend_api_key_here

- Upload `serviceAccountKey.json` only to the VPS (e.g., via `scp`) and keep file permissions restricted (`chmod 600`).

3) Deploy steps (example)
# On VPS
git clone <your-repo.git>
cd repo
npm ci
# create .env from .env.example and fill values
cp .env.example .env
# edit .env and set real values (or set env vars in systemd/pm2)

# start with pm2
npm install -g pm2
pm2 start --name api-ecommerce --interpreter node -- src/app.js
pm2 save

# Optional: configure nginx as reverse proxy with SSL (certbot)

4) Systemd example (alternative to pm2)
Create `/etc/systemd/system/api-ecommerce.service` with:

[Unit]
Description=API E-commerce
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/repo
EnvironmentFile=/path/to/repo/.env
ExecStart=/usr/bin/node src/app.js
Restart=on-failure

[Install]
WantedBy=multi-user.target

Then:
sudo systemctl daemon-reload
sudo systemctl enable api-ecommerce
sudo systemctl start api-ecommerce

5) Firewall / ports
- If using nginx reverse proxy, open 80/443 only and keep app listening on 127.0.0.1:3003 or behind proxy.
- If exposing port 3003 directly, open TCP 3003 in firewall (not recommended for production without TLS).

6) Healthchecks and logs
- Use `pm2 logs api-ecommerce` or `journalctl -u api-ecommerce -f` for logs.
- Create a simple health check that returns 200 at `/` (already present).

7) Rotate secrets
- Rotate `RESEND_API_KEY` if it was committed or leaked.
- Remove any committed `.env` or `serviceAccountKey.json` from git history using BFG or git filter-repo if necessary.

8) Notes about this repo
- `resend` is used via dynamic `import()` to allow compatibility with ESM-only package.
- `ws` is optional; the project supports running without WebSocket if `ws` is not installed.
- Make sure Node >= 18 to ensure `import()` works reliably in CommonJS contexts.

If you want, I can:
- Add a `systemd` unit or `pm2` start script to the repo.
- Create a minimal `nginx` config for reverse proxy + SSL with certbot.
- Remove secrets from git history (I can provide commands and guidance).
