/**
 * Unit Tests - Services
 * Tests individual service functions
 */

import { describe, it, expect, vi } from 'vitest';
import { logger } from '@/lib/utils/logger';
import { validate, validateOrThrow, EmailSchema, AgentInputSchema } from '@/lib/validation/schemas';
import { debounce, throttle, CacheWithTTL } from '@/lib/utils/performance';

describe('🔧 Logger Service', () => {
  it('should log info messages', () => {
    const spy = vi.spyOn(console, 'info');
    logger.info('Test message', { data: 'test' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should log error messages', () => {
    const spy = vi.spyOn(console, 'error');
    logger.error('Error message', new Error('Test error'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('should clear logs', () => {
    logger.clearLogs();
    const logs = logger.getLogs();
    expect(logs.length).toBe(0);
  });
});

describe('✅ Validation Service', () => {
  describe('Email Validation', () => {
    it('should validate correct email', () => {
      const result = validate(EmailSchema, 'test@example.com');
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = validate(EmailSchema, 'invalid-email');
      expect(result.success).toBe(false);
    });

    it('should throw on invalid email with validateOrThrow', () => {
      expect(() => {
        validateOrThrow(EmailSchema, 'invalid-email');
      }).toThrow();
    });
  });

  describe('Agent Input Validation', () => {
    it('should validate correct agent input', () => {
      const input = {
        agentId: '123e4567-e89b-12d3-a456-426614174000',
        task: 'Test task description'
      };
      
      const result = validate(AgentInputSchema, input);
      expect(result.success).toBe(true);
    });

    it('should reject missing task', () => {
      const input = {
        agentId: '123e4567-e89b-12d3-a456-426614174000'
      };
      
      const result = validate(AgentInputSchema, input);
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID', () => {
      const input = {
        agentId: 'invalid-uuid',
        task: 'Test task'
      };
      
      const result = validate(AgentInputSchema, input);
      expect(result.success).toBe(false);
    });
  });
});

describe('⚡ Performance Utilities', () => {
  describe('Debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0;
      const fn = debounce(() => callCount++, 100);
      
      fn();
      fn();
      fn();
      
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(callCount).toBe(1);
    });
  });

  describe('Throttle', () => {
    it('should throttle function calls', async () => {
      let callCount = 0;
      const fn = throttle(() => callCount++, 100);
      
      fn();
      fn();
      fn();
      
      expect(callCount).toBe(1);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      fn();
      expect(callCount).toBe(2);
    });
  });

  describe('CacheWithTTL', () => {
    it('should cache values', () => {
      const cache = new CacheWithTTL<string>(1000);
      cache.set('key1', 'value1');
      
      expect(cache.get('key1')).toBe('value1');
    });

    it('should expire cached values after TTL', async () => {
      const cache = new CacheWithTTL<string>(100);
      cache.set('key1', 'value1');
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cache.get('key1')).toBeNull();
    });

    it('should clear all cached values', () => {
      const cache = new CacheWithTTL<string>(1000);
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.clear();
      
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });
});
