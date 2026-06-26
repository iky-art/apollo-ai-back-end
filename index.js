// api/index.js — Health check & info endpoint

export default function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({
    status: 'ok',
    name: 'Apollo AI Backend',
    version: '1.0.0',
    endpoints: [
      'POST /api/chat    — Proxy AI chat ke OpenAI/model lain',
      'POST /api/auth    — Login & register via Supabase',
      'GET  /api/users   — Data user (butuh token)',
    ],
    timestamp: new Date().toISOString(),
  });
}
