-- ================================================
-- CREATE TEST ADMIN USER FOR DEVELOPMENT
-- ================================================
-- This migration creates a test admin user for development purposes
-- Email: admin@test.com
-- Password: admin123
-- 
-- ⚠️ WARNING: This should ONLY be used in development environments
-- Remove or disable this in production!
-- ================================================

-- Create a function to create test user if not exists
CREATE OR REPLACE FUNCTION create_test_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'admin@test.com';

  -- Only create if user doesn't exist
  IF test_user_id IS NULL THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@test.com',
      crypt('admin123', gen_salt('bf')), -- Password: admin123
      NOW(),
      NULL,
      '',
      NULL,
      '',
      NULL,
      '',
      '',
      NULL,
      NULL,
      '{"provider":"email","providers":["email"],"role":"admin"}',
      '{"full_name":"Test Admin","role":"admin"}',
      FALSE,
      NOW(),
      NOW(),
      NULL,
      NULL,
      '',
      '',
      NULL,
      '',
      0,
      NULL,
      '',
      NULL,
      FALSE,
      NULL
    )
    RETURNING id INTO test_user_id;

    -- Insert into auth.identities
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      test_user_id,
      jsonb_build_object(
        'sub', test_user_id::text,
        'email', 'admin@test.com'
      ),
      'email',
      NOW(),
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Test admin user created successfully: admin@test.com / admin123';
  ELSE
    RAISE NOTICE 'Test admin user already exists: admin@test.com';
  END IF;
END;
$$;

-- Execute the function to create the test user
SELECT create_test_admin_user();

-- Drop the function after use (optional, keeps things clean)
DROP FUNCTION IF EXISTS create_test_admin_user();

-- Add a comment to document this
COMMENT ON TABLE auth.users IS 'Contains user authentication data. Test user admin@test.com exists for development.';
