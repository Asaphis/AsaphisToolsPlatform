import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminUser() {
  try {
    // Create user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'asaphis.org@gmail.com',
      password: 'Asaphis9@1',
      email_confirm: true
    });

    if (authError) throw authError;

    // Create user profile with admin privileges
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: authData.user.email,
        is_admin: true,
        display_name: 'Admin User'
      });

    if (profileError) throw profileError;

    console.log('✅ Admin user created successfully');
    console.log('Email:', authData.user.email);
    console.log('ID:', authData.user.id);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    process.exit();
  }
}

createAdminUser();