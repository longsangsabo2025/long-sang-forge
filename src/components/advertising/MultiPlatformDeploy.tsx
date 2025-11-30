/**
 * Multi-Platform Deployment Component
 * Deploy campaigns to multiple platforms
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Rocket, CheckCircle2, XCircle } from 'lucide-react';

export function MultiPlatformDeploy() {
  const [campaignName, setCampaignName] = useState('');
  const [productInfo, setProductInfo] = useState({
    name: '',
    description: '',
    category: '',
    url: ''
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook']);
  const [budget, setBudget] = useState(1000);
  const [deploymentResult, setDeploymentResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const platforms = [
    { id: 'facebook', name: 'Facebook Ads', sdk: 'Official SDK' },
    { id: 'google', name: 'Google Ads', sdk: 'Official SDK' },
    { id: 'tiktok', name: 'TikTok Ads', sdk: 'Community API' }
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const deployCampaign = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/multi-platform/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_name: campaignName,
          product_info: productInfo,
          platforms: selectedPlatforms,
          budget: budget,
          creatives: []
        })
      });

      if (!response.ok) throw new Error('Deployment failed');

      const data = await response.json();
      setDeploymentResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Multi-Platform Deployment</h1>
        <p className="text-muted-foreground mt-2">
          Deploy campaigns to Facebook, Google Ads, and TikTok simultaneously
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Configuration</CardTitle>
            <CardDescription>Configure your campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Campaign Name</label>
              <Input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Summer Sale 2025"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Product Name</label>
              <Input
                value={productInfo.name}
                onChange={(e) => setProductInfo({ ...productInfo, name: e.target.value })}
                placeholder="e.g., Premium Coffee Beans"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={productInfo.description}
                onChange={(e) => setProductInfo({ ...productInfo, description: e.target.value })}
                placeholder="Product description..."
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Budget ($)</label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value))}
                min={0}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Platforms</CardTitle>
            <CardDescription>Choose platforms to deploy to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-muted"
                onClick={() => togglePlatform(platform.id)}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.id)}
                    onChange={() => togglePlatform(platform.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <div>
                    <p className="font-medium">{platform.name}</p>
                    <p className="text-sm text-muted-foreground">{platform.sdk}</p>
                  </div>
                </div>
                {selectedPlatforms.includes(platform.id) && (
                  <Badge variant="default">Selected</Badge>
                )}
              </div>
            ))}

            <Button
              onClick={deployCampaign}
              disabled={loading || !campaignName || selectedPlatforms.length === 0}
              className="w-full mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Deploy to {selectedPlatforms.length} Platform(s)
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {deploymentResult && (
        <Card>
          <CardHeader>
            <CardTitle>Deployment Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deploymentResult.deployments?.map((deployment: any, i: number) => (
                <div key={i} className="p-4 border rounded">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {deployment.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium capitalize">{deployment.platform}</span>
                    </div>
                    <Badge variant={deployment.success ? 'default' : 'destructive'}>
                      {deployment.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  {deployment.campaign_id && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Campaign ID: {deployment.campaign_id}
                    </p>
                  )}
                </div>
              ))}

              {deploymentResult.errors && deploymentResult.errors.length > 0 && (
                <div className="p-4 border border-destructive rounded">
                  <p className="font-medium text-destructive mb-2">Errors:</p>
                  {deploymentResult.errors.map((err: any, i: number) => (
                    <p key={i} className="text-sm text-destructive">
                      {err.platform}: {err.error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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

