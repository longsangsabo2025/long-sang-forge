/**
 * Google Analytics Data API v4 Integration
 * Browser-safe version - All Google API operations must be called through API server
 */

// Remove Node.js imports - browser-safe version
// import { BetaAnalyticsDataClient } from '@google-analytics/data';

export interface AnalyticsMetrics {
  sessions: number;
  users: number;
  pageViews: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  date: string;
}

export interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  users: number;
  conversionRate: number;
}

export interface TopPage {
  pagePath: string;
  pageTitle: string;
  pageViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

/**
 * Lấy metrics tổng quan theo khoảng thời gian
 * Browser stub - Call through API server endpoint: POST /api/google/analytics/overview
 */
export async function getAnalyticsOverview(
  _propertyId: string,
  _startDate: string = '7daysAgo',
  _endDate: string = 'today'
): Promise<AnalyticsMetrics[]> {
  throw new Error('getAnalyticsOverview must be called through API server endpoint: POST /api/google/analytics/overview');
}

/**
 * Lấy traffic sources (Organic, Paid, Social, etc.)
 * Browser stub - Call through API server endpoint: POST /api/google/analytics/traffic-sources
 */
export async function getTrafficSources(
  _propertyId: string,
  _startDate: string = '30daysAgo',
  _endDate: string = 'today'
): Promise<TrafficSource[]> {
  throw new Error('getTrafficSources must be called through API server endpoint: POST /api/google/analytics/traffic-sources');
}

/**
 * Lấy top pages theo pageviews
 * Browser stub - Call through API server endpoint: POST /api/google/analytics/top-pages
 */
export async function getTopPages(
  _propertyId: string,
  _startDate: string = '30daysAgo',
  _endDate: string = 'today',
  _limit: number = 20
): Promise<TopPage[]> {
  throw new Error('getTopPages must be called through API server endpoint: POST /api/google/analytics/top-pages');
}

/**
 * Lấy real-time active users
 * Browser stub - Call through API server endpoint: POST /api/google/analytics/realtime-users
 */
export async function getRealtimeUsers(_propertyId: string): Promise<number> {
  throw new Error('getRealtimeUsers must be called through API server endpoint: POST /api/google/analytics/realtime-users');
}

/**
 * So sánh performance giữa 2 khoảng thời gian
 * Browser stub - Call through API server endpoint: POST /api/google/analytics/compare-performance
 */
export async function comparePerformance(
  _propertyId: string,
  _currentStart: string = '7daysAgo',
  _currentEnd: string = 'today',
  _previousStart: string = '14daysAgo',
  _previousEnd: string = '8daysAgo'
) {
  throw new Error('comparePerformance must be called through API server endpoint: POST /api/google/analytics/compare-performance');
}

/**
 * Lấy conversion paths (user journey)
 * Browser stub - Call through API server endpoint: POST /api/google/analytics/conversion-paths
 */
export async function getConversionPaths(
  _propertyId: string,
  _startDate: string = '30daysAgo',
  _endDate: string = 'today'
) {
  throw new Error('getConversionPaths must be called through API server endpoint: POST /api/google/analytics/conversion-paths');
}

/**
 * Lấy device breakdown (Mobile, Desktop, Tablet)
 * Browser stub - Call through API server endpoint: POST /api/google/analytics/device-breakdown
 */
export async function getDeviceBreakdown(
  _propertyId: string,
  _startDate: string = '30daysAgo',
  _endDate: string = 'today'
) {
  throw new Error('getDeviceBreakdown must be called through API server endpoint: POST /api/google/analytics/device-breakdown');
}
