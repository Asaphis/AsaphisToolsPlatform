import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const email = 'asaphis.org@gmail.com';
const password = 'Asaphis0@01';
const display_name = 'Admin User';

async function createAdmin() {
  // Check if user already exists
  const { data: existing, error: findErr } = await supabase.auth.admin.listUsers({ email });
  if (findErr) {
    console.error('Error checking for existing user:', findErr.message);
    process.exit(1);
  }
  if (existing && existing.users && existing.users.length > 0) {
    console.log('Admin user already exists:', email);
    process.exit(0);
  }

  // Create user in Supabase Auth
  const { data: user, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name, is_admin: true }
  });
  if (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
  // Set is_admin flag in users table
  const { error: upsertErr } = await supabase.from('users').upsert({
    id: user.user.id,
    email,
    display_name,
    is_admin: true,
    is_active: true
  });
  if (upsertErr) {
    console.error('Error upserting admin user row:', upsertErr.message);
    process.exit(1);
  }
  console.log('✅ Admin user created:', email);
}

createAdmin();
