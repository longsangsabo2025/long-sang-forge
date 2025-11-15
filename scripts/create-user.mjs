#!/usr/bin/env node

/**
 * 🔐 CREATE USER ACCOUNT
 * Register new user in Supabase Auth
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://diexsbzqwsbpilsymnfb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZXhzYnpxd3NicGlsc3ltbmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTIxOTEsImV4cCI6MjA3NTk2ODE5MX0.Nf1wHe7EDONS25Yv987KqhgyvZu07COnu6qgC0qCy2I';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createUser() {
  console.log('\n🔐 Creating user account...\n');
  
  const email = 'longsangsabo@gmail.com';
  const password = '123456';
  
  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: 'Long Sang SABO',
        role: 'user',
      },
      emailRedirectTo: undefined, // Skip email confirmation in dev
    }
  });
  
  if (error) {
    if (error.message.includes('already registered')) {
      console.log('ℹ️  User already exists. Trying to sign in...\n');
      
      // Try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (signInError) {
        console.error('❌ Sign in failed:', signInError.message);
        console.log('\n💡 User exists but password might be different.');
        console.log('   You can reset password in Supabase Dashboard:\n');
        console.log('   https://supabase.com/dashboard/project/diexsbzqwsbpilsymnfb/auth/users\n');
        return;
      }
      
      console.log('✅ Sign in successful!');
      console.log('📧 Email:', signInData.user.email);
      console.log('🆔 User ID:', signInData.user.id);
      console.log('📅 Created:', new Date(signInData.user.created_at).toLocaleString());
      console.log('\n🎉 You can now login with these credentials!\n');
      return;
    }
    
    console.error('❌ Error creating user:', error.message);
    return;
  }
  
  console.log('✅ User created successfully!');
  console.log('📧 Email:', data.user?.email);
  console.log('🆔 User ID:', data.user?.id);
  console.log('📅 Created:', new Date(data.user?.created_at || Date.now()).toLocaleString());
  
  console.log('\n🎉 Account ready to use!');
  console.log('\n📝 Login credentials:');
  console.log('   Email:', email);
  console.log('   Password:', password);
  console.log('\n💡 You can now login at: http://localhost:8080/marketplace\n');
}

await createUser();
