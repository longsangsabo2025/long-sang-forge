/**
 * A/B Testing Dashboard Component
 * View and analyze A/B test results
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, TrendingUp, TrendingDown, BarChart3, CheckCircle2, XCircle } from 'lucide-react';

interface ABTestResult {
  success: boolean;
  results: Array<{
    metric: string;
    variant_a_value: number;
    variant_b_value: number;
    improvement_percent: number;
    is_significant: boolean;
    winner: string;
  }>;
  summary: {
    total_tests: number;
    significant_tests: number;
    overall_winner: string;
  };
}

export function ABTestingDashboard() {
  const [campaignData, setCampaignData] = useState({
    variant_a_name: 'Variant A',
    variant_b_name: 'Variant B',
    variant_a_impressions: 1000,
    variant_b_impressions: 1000,
    variant_a_conversions: 45,
    variant_b_conversions: 62
  });
  const [testResult, setTestResult] = useState<ABTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:3003';

  const runABTest = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${MCP_SERVER_URL}/mcp/ab-testing/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_data: {
            variant_a_name: campaignData.variant_a_name,
            variant_b_name: campaignData.variant_b_name,
            conversions: {
              variant_a_conversions: campaignData.variant_a_conversions,
              variant_a_impressions: campaignData.variant_a_impressions,
              variant_b_conversions: campaignData.variant_b_conversions,
              variant_b_impressions: campaignData.variant_b_impressions
            },
            metrics: {
              CTR: {
                variant_a: [2.1, 2.3, 2.0, 2.2, 2.4],
                variant_b: [2.5, 2.7, 2.6, 2.8, 2.9]
              }
            }
          },
          confidence_level: 0.95
        })
      });

      if (!response.ok) throw new Error('A/B test failed');

      const data = await response.json();
      setTestResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">A/B Testing Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Analyze campaign performance with statistical significance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Data</CardTitle>
            <CardDescription>Enter variant performance data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Variant A Name</label>
                <Input
                  value={campaignData.variant_a_name}
                  onChange={(e) => setCampaignData({ ...campaignData, variant_a_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Variant B Name</label>
                <Input
                  value={campaignData.variant_b_name}
                  onChange={(e) => setCampaignData({ ...campaignData, variant_b_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Variant A Impressions</label>
                <Input
                  type="number"
                  value={campaignData.variant_a_impressions}
                  onChange={(e) => setCampaignData({ ...campaignData, variant_a_impressions: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Variant B Impressions</label>
                <Input
                  type="number"
                  value={campaignData.variant_b_impressions}
                  onChange={(e) => setCampaignData({ ...campaignData, variant_b_impressions: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Variant A Conversions</label>
                <Input
                  type="number"
                  value={campaignData.variant_a_conversions}
                  onChange={(e) => setCampaignData({ ...campaignData, variant_a_conversions: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Variant B Conversions</label>
                <Input
                  type="number"
                  value={campaignData.variant_b_conversions}
                  onChange={(e) => setCampaignData({ ...campaignData, variant_b_conversions: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <Button onClick={runABTest} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Run A/B Test
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Statistical analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            {testResult ? (
              <div className="space-y-4">
                <div>
                  <Badge variant={testResult.summary.overall_winner ? 'default' : 'secondary'}>
                    Overall Winner: {testResult.summary.overall_winner || 'None'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tests</p>
                    <p className="text-2xl font-bold">{testResult.summary.total_tests}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Significant Tests</p>
                    <p className="text-2xl font-bold">{testResult.summary.significant_tests}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {testResult.results.map((result, i) => (
                    <div key={i} className="p-3 border rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{result.metric}</span>
                        {result.is_significant ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="mt-2 flex justify-between">
                        <span className="text-sm">A: {result.variant_a_value.toFixed(2)}</span>
                        <span className="text-sm">B: {result.variant_b_value.toFixed(2)}</span>
                      </div>
                      {result.improvement_percent !== 0 && (
                        <div className="mt-1 flex items-center gap-1">
                          {result.improvement_percent > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          )}
                          <span className={`text-xs ${result.improvement_percent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {result.improvement_percent > 0 ? '+' : ''}{result.improvement_percent.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Run A/B test to see results
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

