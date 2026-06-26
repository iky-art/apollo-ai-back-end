# Apollo AI — Backend Proxy

Backend serverless untuk Apollo AI. Di-deploy di **Vercel** sebagai serverless functions.  
API Key OpenAI & Supabase Service Role **hanya ada di sini**, tidak pernah ke frontend.

---

## Struktur

```
backend/
├── api/
│   ├── index.js     → Health check & info
│   ├── chat.js      → Proxy chat ke OpenAI (API key aman di server)
│   ├── auth.js      → Login & register via Supabase
│   └── users.js     → Ambil & update profil user
├── package.json
├── vercel.json
├── .gitignore
└── README.md
```

---

## Environment Variables

> ⚠️ **JANGAN commit `.env` ke GitHub!**  
> Pasang langsung di **Vercel Dashboard → Settings → Environment Variables**

| Key | Keterangan |
|-----|-----------|
| `OPENAI_API_KEY` | API key dari platform.openai.com |
| `DEFAULT_MODEL` | Model default, contoh: `gpt-4o-mini` |
| `SUPABASE_URL` | URL project Supabase kamu |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (bukan anon key!) dari Supabase |
| `SUPABASE_ANON_KEY` | Anon/public key Supabase (untuk validasi JWT user) |

---

## Setup Lokal

```bash
# 1. Clone repo
git clone https://github.com/USERNAME/apollo-backend.git
cd apollo-backend

# 2. Install dependencies
npm install

# 3. Buat file .env (JANGAN di-push ke GitHub)
cp .env.example .env
# Edit .env dan isi semua variabel

# 4. Jalankan lokal
npx vercel dev
```

---

## Deploy ke Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy production
vercel --prod
```

Setelah deploy, catat URL Vercel kamu (misal: `https://apollo-backend.vercel.app`).  
Pasang URL itu di `BACKEND_URL` pada file `index.html` frontend.

---

## Endpoint

### `GET /api` — Health Check
```json
{ "status": "ok", "name": "Apollo AI Backend" }
```

### `POST /api/chat` — Chat AI
**Body:**
```json
{
  "messages": [{ "role": "user", "content": "Halo!" }],
  "system": "Kamu adalah Apollo AI, asisten cerdas.",
  "model": "gpt-4o-mini",
  "max_tokens": 1024
}
```
**Response:**
```json
{ "reply": "Halo! Ada yang bisa saya bantu?", "usage": {...} }
```

### `POST /api/auth` — Login / Register
**Login:**
```json
{ "action": "login", "email": "user@contoh.com", "password": "123456" }
```
**Register:**
```json
{ "action": "register", "email": "user@contoh.com", "password": "123456", "name": "Budi" }
```

### `GET /api/users` — Profil User
Header: `Authorization: Bearer <jwt_token>`

### `PATCH /api/users` — Update Profil
Header: `Authorization: Bearer <jwt_token>`  
Body: `{ "name": "Nama Baru" }`

---

## Rate Limit

- `/api/chat`: 30 request per IP per menit
- Reset otomatis setiap cold start (in-memory)
- Untuk production, gunakan Upstash Redis atau KV Vercel

---

*Apollo AI Indonesia — © 2025*
