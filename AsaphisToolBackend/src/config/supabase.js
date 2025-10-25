import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Check if Supabase is configured
const hasSupabaseConfig = 
  process.env.SUPABASE_URL && 
  process.env.SUPABASE_URL !== 'your_supabase_project_url' &&
  process.env.SUPABASE_ANON_KEY && 
  process.env.SUPABASE_ANON_KEY !== 'your_supabase_anon_key';

let supabase = null;
let supabaseAdmin = null;

if (hasSupabaseConfig) {
  // Create Supabase client with anon key (for general operations)
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: false
      }
    }
  );

  // Create Supabase admin client (for admin operations bypassing RLS)
  supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  console.log('✅ Supabase configured and connected');
} else {
  console.log('⚠️  Supabase not configured - database features will be disabled');
  console.log('   File processing (like background removal) will still work!');
}

export { supabase, supabaseAdmin };
export default supabase;
