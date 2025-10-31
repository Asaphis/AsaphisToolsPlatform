import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminUser() {
  try {
    // Get user by email
    const { data: authData, error: authError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'asaphis.org@gmail.com')
      .single();

    if (authError) throw authError;

    console.log('User data:', authData);
    
    if (!authData) {
      console.log('❌ User not found in users table');
    } else if (!authData.is_admin) {
      // Update user to be admin
      const { error: updateError } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('email', 'asaphis.org@gmail.com');
      
      if (updateError) throw updateError;
      console.log('✅ User updated to admin successfully');
    } else {
      console.log('✅ User is already an admin');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

checkAdminUser();