/**
 * Video Ad Generator Component
 * Generate video ads for multiple platforms
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Video, Play, Download } from 'lucide-react';

interface VideoConfig {
  product_info: {
    name: string;
    description: string;
    category: string;
    url?: string;
  };
  ad_style: string;
  duration: number;
  aspect_ratio: string;
  num_images: number;
}

export function VideoAdGenerator() {
  const [productInfo, setProductInfo] = useState({
    name: '',
    description: '',
    category: '',
    url: ''
  });
  const [config, setConfig] = useState<VideoConfig>({
    product_info: {
      name: '',
      description: '',
      category: '',
      url: ''
    },
    ad_style: 'product',
    duration: 15,
    aspect_ratio: '9:16',
    num_images: 3
  });
  const [videoResult, setVideoResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const generateVideo = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/video-ads/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_info: productInfo,
          ad_style: config.ad_style,
          duration: config.duration,
          aspect_ratio: config.aspect_ratio,
          num_images: config.num_images
        })
      });

      if (!response.ok) throw new Error('Video generation failed');

      const data = await response.json();
      setVideoResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Video Ad Generator</h1>
        <p className="text-muted-foreground mt-2">
          Generate video ads for TikTok, Reels, and Shorts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Enter product details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                placeholder="Describe your product..."
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <Input
                value={productInfo.category}
                onChange={(e) => setProductInfo({ ...productInfo, category: e.target.value })}
                placeholder="e.g., Food & Beverage"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Video Configuration</CardTitle>
            <CardDescription>Configure video settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Ad Style</label>
              <Select
                value={config.ad_style}
                onValueChange={(value) => setConfig({ ...config, ad_style: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="testimonial">Testimonial</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Aspect Ratio</label>
              <Select
                value={config.aspect_ratio}
                onValueChange={(value) => setConfig({ ...config, aspect_ratio: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9:16">9:16 (TikTok/Reels)</SelectItem>
                  <SelectItem value="16:9">16:9 (YouTube)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="4:5">4:5 (Facebook)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Duration (seconds)</label>
              <Input
                type="number"
                value={config.duration}
                onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                min={5}
                max={60}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Number of Images</label>
              <Input
                type="number"
                value={config.num_images}
                onChange={(e) => setConfig({ ...config, num_images: parseInt(e.target.value) })}
                min={2}
                max={10}
              />
            </div>

            <Button
              onClick={generateVideo}
              disabled={loading || !productInfo.name}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Generate Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {videoResult && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Video</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <Video className="h-16 w-16 text-muted-foreground" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Play className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Video path: {videoResult.video_path}
              </p>
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

