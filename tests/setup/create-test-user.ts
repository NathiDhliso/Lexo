import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const testUserEmail = process.env.TEST_USER_EMAIL || 'nkosinathi.dhliso@gmail.com';
const testUserPassword = process.env.TEST_USER_PASSWORD || 'Latestmano271991!';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUser() {
  console.log('Creating test user...');
  console.log('Email:', testUserEmail);

  const { data, error } = await supabase.auth.signUp({
    email: testUserEmail,
    password: testUserPassword,
    options: {
      data: {
        user_type: 'junior',
        full_name: 'Test User'
      }
    }
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('✓ Test user already exists');
      return;
    }
    console.error('Error creating test user:', error.message);
    throw error;
  }

  console.log('✓ Test user created successfully');
  console.log('User ID:', data.user?.id);
}

createTestUser().catch(console.error);
