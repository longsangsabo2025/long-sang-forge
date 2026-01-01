#!/usr/bin/env tsx
/**
 * 🚀 Set Employee Role Script
 *
 * Usage:
 *   npm run employee:set-role -- email@example.com staff
 *   npm run employee:set-role -- email@example.com staff --features /admin/ideas,/admin/content-queue
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env.local'), override: true });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('   Need: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Role definitions with default permissions
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['*'], // All access
  staff: [
    '/admin/ideas',
    '/admin/content-queue',
    '/admin/seo-center',
    '/admin/courses',
    '/admin/consultations',
  ],
  editor: [
    '/admin/content-queue',
    '/admin/courses',
    '/admin/ideas',
  ],
  marketer: [
    '/admin/seo-center',
    '/admin/content-queue',
    '/admin/social-media',
    '/admin/projects',
  ],
  viewer: ['/admin/analytics'],
};

async function setEmployeeRole(email: string, role: string, customPermissions?: string[]) {
  console.log(`\n🚀 Setting role for: ${email}`);
  console.log(`   Role: ${role}`);

  try {
    // Get user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      process.exit(1);
    }

    const user = users?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      if (users?.users && users.users.length > 0) {
        console.log('\n💡 Available users:');
        users.users.slice(0, 5).forEach((u) => {
          console.log(`   - ${u.email} (${(u.user_metadata?.role as string) || 'no role'})`);
        });
      }
      process.exit(1);
    }

    // Get permissions for role
    let permissions: string[] = [];
    if (customPermissions && customPermissions.length > 0) {
      permissions = customPermissions;
      console.log(`   Custom permissions: ${permissions.join(', ')}`);
    } else if (ROLE_PERMISSIONS[role]) {
      permissions = ROLE_PERMISSIONS[role];
      console.log(`   Default permissions for ${role}: ${permissions.join(', ')}`);
    } else {
      console.warn(`⚠️  Unknown role: ${role}`);
      console.log(`   Available roles: ${Object.keys(ROLE_PERMISSIONS).join(', ')}`);
    }

    // Update user metadata
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          role,
          permissions,
          updated_at: new Date().toISOString(),
        },
      }
    );

    if (updateError) {
      console.error('❌ Error updating user:', updateError.message);
      process.exit(1);
    }

    console.log(`\n✅ Success! Role "${role}" set for ${email}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Permissions: ${permissions.length} features`);

    if (permissions.length > 0 && permissions[0] !== '*') {
      console.log(`\n   Access granted to:`);
      permissions.forEach((perm) => {
        console.log(`   ✅ ${perm}`);
      });
    }

    console.log('\n💡 User needs to logout and login again for changes to take effect.\n');
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
🚀 Set Employee Role - Usage

  npm run employee:set-role -- <email> <role> [--features feature1,feature2]

Examples:
  npm run employee:set-role -- nhanvien@example.com staff
  npm run employee:set-role -- nhanvien@example.com editor
  npm run employee:set-role -- nhanvien@example.com staff --features /admin/ideas,/admin/content-queue

Available roles:
  ${Object.keys(ROLE_PERMISSIONS).join(', ')}

Default permissions per role:
${Object.entries(ROLE_PERMISSIONS)
  .map(([role, perms]) => {
    const permList = perms.length > 3 ? `${perms.slice(0, 3).join(', ')}...` : perms.join(', ');
    return `  ${role.padEnd(10)} → ${permList}`;
  })
  .join('\n')}
`);
  process.exit(0);
}

const email = args[0];
const role = args[1];
const featuresIndex = args.indexOf('--features');
const customPermissions =
  featuresIndex >= 0 && args[featuresIndex + 1]
    ? args[featuresIndex + 1].split(',').map((f) => f.trim())
    : undefined;

setEmployeeRole(email, role, customPermissions).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
