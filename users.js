// api/users.js — Ambil & update data user (butuh JWT token)

import { createClient } from '@supabase/supabase-js';

function getSupabase(userToken) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error('Supabase env tidak lengkap.');
  // Pakai token user untuk RLS (Row Level Security)
  return createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${userToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Ambil token dari header Authorization
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return res.status(401).json({ error: 'Token tidak ada. Login dulu.' });
  }

  try {
    const supabase = getSupabase(token);

    // Verifikasi token → dapat user_id
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: 'Token tidak valid atau sudah expired.' });
    }

    // ===== GET profil user =====
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, plan, created_at, chat_count')
        .eq('id', user.id)
        .single();

      if (error) return res.status(404).json({ error: 'User tidak ditemukan.' });
      return res.status(200).json({ user: data });
    }

    // ===== PATCH update profil =====
    if (req.method === 'PATCH') {
      const { name, plan } = req.body || {};
      const updates = {};
      if (name) updates.name = name;
      if (plan) updates.plan = plan; // validasi plan di sisi bisnis

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ user: data });
    }

    return res.status(405).json({ error: 'Method tidak didukung.' });

  } catch (err) {
    console.error('[users] Error:', err);
    return res.status(500).json({ error: err.message || 'Server error.' });
  }
}
