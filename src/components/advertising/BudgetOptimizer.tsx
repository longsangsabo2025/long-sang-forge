/**
 * Budget Optimizer Component
 * Automated budget reallocation interface
 *
 * Features:
 * - Budget optimization analysis
 * - Performance forecasting
 * - Auto-apply recommendations
 * - History tracking
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { advertisingAPI, type BudgetOptimizationResult } from "@/lib/api/advertising-api";
import { AlertCircle, Loader2, TrendingUp } from "lucide-react";
import { useState } from "react";

// Types imported from API client
type OptimizationResult = BudgetOptimizationResult;

interface BudgetAllocation {
  variant: string;
  allocated_budget: number;
  proportion: number;
  confidence?: number;
}

interface ForecastResult {
  success: boolean;
  forecast_days: number;
  forecast: Array<{
    date: string;
    conversions: number;
    spend: number;
    cpa: number;
  }>;
  summary: {
    total_forecasted_conversions: number;
    total_forecasted_spend: number;
    average_cpa: number;
  };
}

export function BudgetOptimizer() {
  const [campaignData, setCampaignData] = useState({
    variants: [
      { variant_id: "A", conversions: 45, impressions: 1000, current_budget: 500 },
      { variant_id: "B", conversions: 62, impressions: 1000, current_budget: 500 },
    ],
  });
  const [totalBudget, setTotalBudget] = useState(1000);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoApply, setAutoApply] = useState(false);

  const optimizeBudget = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await advertisingAPI.optimizeBudget({
        campaign_data: campaignData,
        total_budget: totalBudget,
        method: "thompson_sampling",
        auto_apply: autoApply,
      });
      setOptimizationResult(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const forecastPerformance = async () => {
    setLoading(true);
    setError(null);

    const historicalData = [
      { date: "2025-01-01", conversions: 45, impressions: 1000, spend: 500 },
      { date: "2025-01-02", conversions: 48, impressions: 1100, spend: 550 },
      { date: "2025-01-03", conversions: 52, impressions: 1200, spend: 600 },
      { date: "2025-01-05", conversions: 50, impressions: 1150, spend: 575 },
      { date: "2025-01-05", conversions: 55, impressions: 1300, spend: 650 },
    ];

    try {
      const result = await advertisingAPI.forecastPerformance(historicalData, 7);
      setForecastResult(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Budget Optimizer</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered budget allocation and optimization
          </p>
        </div>
      </div>

      <Tabs defaultValue="optimize" className="space-y-4">
        <TabsList>
          <TabsTrigger value="optimize">Optimize Budget</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        {/* Optimize Tab */}
        <TabsContent value="optimize">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Data</CardTitle>
                <CardDescription>Enter variant performance data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Total Budget</Label>
                  <Input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Number(e.target.value))}
                  />
                </div>

                {campaignData.variants.map((variant, index) => (
                  <div key={variant.variant_id} className="space-y-2 p-4 border rounded">
                    <Label>Variant {variant.variant_id}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Conversions</Label>
                        <Input
                          type="number"
                          value={variant.conversions}
                          onChange={(e) => {
                            const newVariants = [...campaignData.variants];
                            newVariants[index].conversions = Number(e.target.value);
                            setCampaignData({ ...campaignData, variants: newVariants });
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Impressions</Label>
                        <Input
                          type="number"
                          value={variant.impressions}
                          onChange={(e) => {
                            const newVariants = [...campaignData.variants];
                            newVariants[index].impressions = Number(e.target.value);
                            setCampaignData({ ...campaignData, variants: newVariants });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoApply"
                    checked={autoApply}
                    onChange={(e) => setAutoApply(e.target.checked)}
                  />
                  <Label htmlFor="autoApply">Auto-apply recommendations</Label>
                </div>

                <Button onClick={optimizeBudget} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Optimize Budget
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Results</CardTitle>
                <CardDescription>AI-recommended budget allocation</CardDescription>
              </CardHeader>
              <CardContent>
                {optimizationResult ? (
                  <div className="space-y-4">
                    <div>
                      <Badge variant="outline">Algorithm: {optimizationResult.algorithm}</Badge>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Budget Allocations</h3>
                      <div className="space-y-2">
                        {optimizationResult.allocations.map((alloc, i) => (
                          <div key={i} className="p-3 border rounded">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Variant {alloc.variant}</span>
                              <span className="text-lg font-bold">
                                ${alloc.allocated_budget.toFixed(2)}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {(alloc.proportion * 100).toFixed(1)}% of total budget
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {optimizationResult.actions && optimizationResult.actions.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Recommended Actions</h3>
                        <div className="space-y-2">
                          {optimizationResult.actions.map((action, i) => (
                            <div key={i} className="p-3 border rounded">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge
                                    variant={
                                      action.type === "increase_budget" ? "default" : "secondary"
                                    }
                                  >
                                    {action.type.replace("_", " ")}
                                  </Badge>
                                  <p className="text-sm mt-1">{action.reason}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm">
                                    ${action.current_budget} → ${action.new_budget}
                                  </p>
                                  <p
                                    className={`text-xs ${
                                      action.change_percent > 0 ? "text-green-600" : "text-red-600"
                                    }`}
                                  >
                                    {action.change_percent > 0 ? "+" : ""}
                                    {action.change_percent.toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Run optimization to see results
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle>Performance Forecast</CardTitle>
              <CardDescription>7-day performance prediction</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={forecastPerformance} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Forecasting...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Generate Forecast
                  </>
                )}
              </Button>

              {forecastResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total Conversions</p>
                        <p className="text-2xl font-bold">
                          {forecastResult.summary.total_forecasted_conversions.toFixed(0)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total Spend</p>
                        <p className="text-2xl font-bold">
                          ${forecastResult.summary.total_forecasted_spend.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Average CPA</p>
                        <p className="text-2xl font-bold">
                          ${forecastResult.summary.average_cpa.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Daily Forecast</h3>
                    <div className="space-y-2">
                      {forecastResult.forecast.map((day, i) => (
                        <div key={i} className="p-3 border rounded flex justify-between">
                          <div>
                            <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">
                              {day.conversions.toFixed(0)} conversions
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${day.spend.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">
                              CPA: ${day.cpa.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
