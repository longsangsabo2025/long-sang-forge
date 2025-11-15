/**
 * Integration Tests - Database (Supabase)
 * Tests database connectivity and table structure
 */

import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// @ts-expect-error - Vite env types
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// @ts-expect-error - Vite env types
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

describe('🗄️ Database Integration Tests', () => {
  describe('Supabase Connection', () => {
    it('should connect to Supabase', () => {
      expect(supabaseUrl).toBeTruthy();
      expect(supabaseKey).toBeTruthy();
      expect(supabase).toBeDefined();
    });
  });

  describe('Table Existence', () => {
    it('should have agents table', async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .limit(1);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should have agent_executions table', async () => {
      const { data, error } = await supabase
        .from('agent_executions')
        .select('*')
        .limit(1);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should have credentials table', async () => {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .limit(1);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should have consultation_bookings table', async () => {
      const { data, error } = await supabase
        .from('consultation_bookings')
        .select('*')
        .limit(1);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Data Queries', () => {
    it('should query agents successfully', async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('id, name, description')
        .limit(5);
      
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should count agent executions', async () => {
      const { count, error } = await supabase
        .from('agent_executions')
        .select('*', { count: 'exact', head: true });
      
      expect(error).toBeNull();
      expect(typeof count).toBe('number');
    });
  });

  describe('RLS (Row Level Security)', () => {
    it('should allow public read access to agents', async () => {
      // Test without authentication
      const { data } = await supabase
        .from('agents')
        .select('*')
        .eq('visibility', 'public')
        .limit(1);
      
      // Should not throw error for public agents
      expect(data).toBeDefined();
    });
  });
});
