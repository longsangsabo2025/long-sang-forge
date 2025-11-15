/**
 * Google Maps API & My Business Integration - Browser Safe Version
 * All Node.js-only operations must be called via API endpoints
 */

import { supabase } from '@/integrations/supabase/client';

export interface BusinessLocation {
  name: string;
  address: string;
  phone: string;
  website?: string;
  categories: string[];
  description?: string;
  hours?: {
    [day: string]: { open: string; close: string };
  };
}

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  placeId: string;
}

// ============================================================
// STUB FUNCTIONS - Call via API endpoints
// ============================================================

/**
 * Geocode address to coordinates
 * Note: Must be called via API endpoint
 */
export async function geocodeAddress(_address: string): Promise<GeocodingResult> {
  throw new Error('geocodeAddress must be called through API server endpoint: POST /api/google/maps/geocode');
}

/**
 * Create business location
 * Note: Must be called via API endpoint
 */
export async function createBusinessLocation(_userEmail: string, _location: BusinessLocation) {
  throw new Error('createBusinessLocation must be called through API server endpoint: POST /api/google/maps/create-location');
}

/**
 * Update business location
 * Note: Must be called via API endpoint
 */
export async function updateBusinessLocation(_userEmail: string, _locationId: string, _updates: Partial<BusinessLocation>) {
  throw new Error('updateBusinessLocation must be called through API server endpoint: PUT /api/google/maps/update-location');
}

/**
 * Optimize location for SEO
 * Note: Must be called via API endpoint
 */
export async function optimizeLocationForSEO(_userEmail: string, _locationId: string) {
  throw new Error('optimizeLocationForSEO must be called through API server endpoint: POST /api/google/maps/optimize-seo');
}

/**
 * Auto-sync consultation locations
 * Note: Must be called via API endpoint
 */
export async function autoSyncConsultationLocations(_userEmail: string) {
  throw new Error('autoSyncConsultationLocations must be called through API server endpoint: POST /api/google/maps/sync-locations');
}

/**
 * Calculate distance between two locations
 * Note: Must be called via API endpoint
 */
export async function calculateDistance(_origin: string, _destination: string) {
  throw new Error('calculateDistance must be called through API server endpoint: POST /api/google/maps/calculate-distance');
}

/**
 * Get directions
 * Note: Must be called via API endpoint
 */
export async function getDirections(_origin: string, _destination: string) {
  throw new Error('getDirections must be called through API server endpoint: POST /api/google/maps/get-directions');
}

/**
 * Search nearby places
 * Note: Must be called via API endpoint
 */
export async function searchNearbyPlaces(_location: string, _type: string, _radius: number) {
  throw new Error('searchNearbyPlaces must be called through API server endpoint: POST /api/google/maps/search-nearby');
}

/**
 * Get location stats from database
 * This function can run in browser as it only queries Supabase
 */
export async function getLocationStats() {
  const { data: locations, error } = await supabase
    .from('business_locations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    total: locations?.length || 0,
    verified: locations?.filter(l => l.verified).length || 0,
    needsUpdate: locations?.filter(l => !l.verified).length || 0,
    locations: locations || [],
  };
}

/**
 * Get location by ID from database
 * This function can run in browser as it only queries Supabase
 */
export async function getLocation(locationId: string) {
  const { data, error } = await supabase
    .from('business_locations')
    .select('*')
    .eq('id', locationId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * List all locations from database
 * This function can run in browser as it only queries Supabase
 */
export async function listLocations() {
  const { data, error } = await supabase
    .from('business_locations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
