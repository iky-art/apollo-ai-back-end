// api/auth.js — Auth proxy via Supabase (login & register)
// Supabase Service Role Key HANYA di sini, tidak di frontend!

import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role, bukan anon!
  if (!url || !key) throw new Error('Supabase env tidak lengkap.');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Gunakan POST.' });
  }

  const { action, email, password, name } = req.body || {};

  if (!action || !email || !password) {
    return res.status(400).json({ error: 'Field action, email, password wajib diisi.' });
  }

  try {
    const supabase = getSupabase();

    // ===== LOGIN =====
    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return res.status(401).json({ error: error.message });

      return res.status(200).json({
        token: data.session.access_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || email.split('@')[0],
        },
      });
    }

    // ===== REGISTER =====
    if (action === 'register') {
      if (!name) return res.status(400).json({ error: 'Field name wajib untuk register.' });
      if (password.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter.' });

      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { name },
        email_confirm: false, // set true jika pakai email verification
      });

      if (error) return res.status(400).json({ error: error.message });

      // Insert ke tabel users publik
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        name,
        plan: 'free',
        created_at: new Date().toISOString(),
      });

      return res.status(201).json({
        message: 'Akun berhasil dibuat!',
        user: { id: data.user.id, email, name },
      });
    }

    return res.status(400).json({ error: `Action tidak dikenal: ${action}` });

  } catch (err) {
    console.error('[auth] Error:', err);
    return res.status(500).json({ error: err.message || 'Server error.' });
  }
}
