/**
 * Ad Campaign Generator Component
 * Frontend component for generating ad campaigns
 *
 * Features:
 * - Generate campaign strategy
 * - Generate creative variants
 * - Deploy to multiple platforms
 * - Real-time monitoring
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { CampaignStrategy, CreativeVariant, ProductInfo } from "@/lib/api/advertising-api";
import { advertisingAPI } from "@/lib/api/advertising-api";
import { BarChart3, Image, Loader2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { ImagePreview } from "./ImagePreview";

// Types imported from API client

export function AdCampaignGenerator() {
  const { showToast } = useToast();
  const [productInfo, setProductInfo] = useState<ProductInfo>({
    name: "",
    description: "",
    category: "",
    url: "",
  });

  const [strategy, setStrategy] = useState<CampaignStrategy | null>(null);
  const [creatives, setCreatives] = useState<CreativeVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("product");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["facebook"]);

  const validateProductInfo = (): boolean => {
    if (!productInfo.name.trim()) {
      setError("Product name is required");
      showToast("Product name is required", "error");
      return false;
    }
    if (!productInfo.description.trim()) {
      setError("Product description is required");
      showToast("Product description is required", "error");
      return false;
    }
    if (!productInfo.category.trim()) {
      setError("Product category is required");
      showToast("Product category is required", "error");
      return false;
    }
    if (productInfo.url && !/^https?:\/\/.+/.test(productInfo.url)) {
      setError("Invalid URL format");
      showToast("Invalid URL format. Must start with http:// or https://", "error");
      return false;
    }
    return true;
  };

  const generateStrategy = async () => {
    if (!validateProductInfo()) return;

    setLoading(true);
    setError(null);

    try {
      const strategyData = await advertisingAPI.generateStrategy(productInfo, {
        age: "25-45",
        interests: ["lifestyle", "shopping"],
      });
      setStrategy(strategyData);
      setActiveTab("strategy");
      showToast("Strategy generated successfully!", "success");
    } catch (err: any) {
      setError(err.message);
      showToast(err.message || "Failed to generate strategy", "error");
    } finally {
      setLoading(false);
    }
  };

  const generateCreatives = async (numVariants: number = 3) => {
    if (!validateProductInfo()) return;

    setLoading(true);
    setError(null);

    try {
      const variants = await advertisingAPI.generateCreatives(productInfo, numVariants);
      setCreatives(variants);
      setActiveTab("creatives");
      showToast(`Generated ${variants.length} creative variants!`, "success");
    } catch (err: any) {
      setError(err.message);
      showToast(err.message || "Failed to generate creatives", "error");
    } finally {
      setLoading(false);
    }
  };

  const deployCampaign = async (platforms: string[]) => {
    if (creatives.length === 0) {
      setError("Please generate creatives first");
      showToast("Please generate creatives first", "error");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await advertisingAPI.deployCampaign({
        campaign_name: `Campaign: ${productInfo.name}`,
        product_info: productInfo,
        platforms: platforms,
        budget: 1000,
        creatives: creatives,
      });

      if (result.success) {
        const platformsList = result.deployments.map((d) => d.platform).join(", ");
        showToast(`Campaign deployed successfully to ${platformsList}!`, "success");
        // Reset form
        setProductInfo({ name: "", description: "", category: "", url: "" });
        setStrategy(null);
        setCreatives([]);
        setActiveTab("product");
      } else {
        const errorMsg = result.errors?.map((e) => e.error).join(", ") || "Deployment failed";
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      setError(err.message);
      showToast(err.message || "Failed to deploy campaign", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Ad Campaign Generator</h1>
          <p className="text-muted-foreground mt-2">
            Generate, optimize, and deploy ad campaigns across multiple platforms
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="product">Product Info</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="creatives">Creatives</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
        </TabsList>

        {/* Product Info Tab */}
        <TabsContent value="product">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Enter product details to generate campaign</CardDescription>
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

              <div>
                <label className="text-sm font-medium">Product URL (Optional)</label>
                <Input
                  value={productInfo.url}
                  onChange={(e) => setProductInfo({ ...productInfo, url: e.target.value })}
                  placeholder="https://example.com/product"
                  type="url"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={generateStrategy}
                  disabled={loading || !productInfo.name}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Generate Strategy
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => generateCreatives(3)}
                  disabled={loading || !productInfo.name}
                  variant="outline"
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Image className="mr-2 h-4 w-4" />
                      Generate Creatives
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md">{error}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Strategy</CardTitle>
              <CardDescription>AI-generated campaign recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              {strategy ? (
                <div className="space-y-4">
                  <div>
                    <Badge variant="outline">Source: {strategy.source}</Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Recommended Ad Styles</h3>
                    <div className="flex flex-wrap gap-2">
                      {strategy.recommendations.ad_styles?.map((style, i) => (
                        <Badge key={i} variant="secondary">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Messaging</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {strategy.recommendations.messaging?.map((msg, i) => (
                        <li key={i} className="text-sm">
                          {msg}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Recommended Formats</h3>
                    <div className="flex flex-wrap gap-2">
                      {strategy.recommendations.formats?.map((format, i) => (
                        <Badge key={i}>{format}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Generate strategy from Product Info tab</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Creatives Tab */}
        <TabsContent value="creatives">
          <Card>
            <CardHeader>
              <CardTitle>Creative Variants</CardTitle>
              <CardDescription>AI-generated ad creatives for A/B testing</CardDescription>
            </CardHeader>
            <CardContent>
              {creatives.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {creatives.map((creative) => (
                    <ImagePreview
                      key={creative.variant_id}
                      imageUrl={creative.image_path}
                      imagePath={creative.image_path}
                      adStyle={creative.ad_style}
                      prompt={creative.prompt}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Generate creatives from Product Info tab</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deploy Tab */}
        <TabsContent value="deploy">
          <Card>
            <CardHeader>
              <CardTitle>Deploy Campaign</CardTitle>
              <CardDescription>Deploy to multiple advertising platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {creatives.length === 0 ? (
                <p className="text-muted-foreground">Generate creatives first before deploying</p>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Platforms</label>
                    <Select
                      value={selectedPlatforms.join(",")}
                      onValueChange={(value) => {
                        const platforms = value.includes(",")
                          ? value.split(",").map((p) => p.trim())
                          : [value];
                        setSelectedPlatforms(platforms);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facebook">Facebook Ads</SelectItem>
                        <SelectItem value="google">Google Ads</SelectItem>
                        <SelectItem value="tiktok">TikTok Ads</SelectItem>
                        <SelectItem value="facebook,google">Facebook + Google</SelectItem>
                        <SelectItem value="facebook,google,tiktok">All Platforms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => deployCampaign(selectedPlatforms)}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deploying...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Deploy Campaign
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
