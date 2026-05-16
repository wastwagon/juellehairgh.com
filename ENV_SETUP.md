# Environment Variables Setup (Production / Coolify)

Copy these variables into your platform (Coolify, Docker secrets). Do **not** commit real keys.

## Backend (NestJS)
- `DATABASE_URL` — e.g. `postgresql://user:password@host:5432/juellehair?schema=public`
- `JWT_SECRET` — generate with `openssl rand -base64 32` (required)
- `PAYSTACK_SECRET_KEY` — your Paystack secret (required)
- `FRONTEND_URL` — e.g. `https://your-frontend-domain.com`
- `CURRENCY_API_KEY` — optional
- `NODE_ENV` — `production`
- `PORT` — `3001`
- Email (required for order emails): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`, `EMAIL_FROM_NAME`, `ADMIN_EMAIL`
  - Example (Namecheap): host `mail.juellehairgh.com`, port `587`, user `admin@juellehairgh.com`, password = mailbox password
  - Alternatively configure in Admin → Settings → Email (no restart needed after deploy)

## Frontend (Next.js)
- `NEXT_PUBLIC_API_BASE_URL` — e.g. `https://your-backend-domain.com/api` (must include `/api`)
- `INTERNAL_API_BASE_URL` — optional; server-side URL from frontend container to backend (e.g. `http://backend:3001/api` on Coolify if services share a network)
- `NEXTAUTH_URL` — e.g. `https://your-frontend-domain.com`
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32` (required)
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — your Paystack public key (required)
- `NEXT_PUBLIC_APP_NAME` — e.g. `Juelle Hair Ghana`
- `NEXT_PUBLIC_BASE_CURRENCY` — e.g. `GHS`

## Notes for Coolify
- Backend listens on `3001`, frontend on `3000`.
- Set secrets in the platform; never use defaults like `your-secret-key`.
- Ensure CORS allowlist matches your frontend domain(s).

