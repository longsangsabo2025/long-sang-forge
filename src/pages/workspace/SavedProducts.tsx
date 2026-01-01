import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { projectsData } from "@/data/projects-data";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, BookOpen, ExternalLink, Search, ShoppingBag, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SavedProduct {
  id: string;
  product_slug: string;
  product_type: string;
  notes: string | null;
  tags: string[];
  created_at: string;
}

export default function SavedProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch saved products
  const { data: savedProducts = [], isLoading } = useQuery({
    queryKey: ["saved-products", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("saved_products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SavedProduct[];
    },
    enabled: !!user?.id,
  });

  // Remove saved product
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_products").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-products"] });
      toast.success("Đã xóa khỏi danh sách yêu thích");
    },
  });

  // Get product details from slug
  const getProductDetails = (slug: string, type: string) => {
    if (type === "showcase") {
      const project = projectsData.find((p) => p.slug === slug);
      return project
        ? {
            name: project.name,
            description: project.description,
            image: project.images?.hero || project.image,
            category: project.category,
            link: `/project-showcase/${slug}`,
          }
        : null;
    }
    // Add more types (course, agent) as needed
    return null;
  };

  // Filter products
  const filteredProducts = savedProducts.filter((item) => {
    const details = getProductDetails(item.product_slug, item.product_type);
    const matchesSearch =
      details?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product_slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeTab === "all" || item.product_type === activeTab;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: savedProducts.length,
    showcase: savedProducts.filter((p) => p.product_type === "showcase").length,
    course: savedProducts.filter((p) => p.product_type === "course").length,
    agent: savedProducts.filter((p) => p.product_type === "agent").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bookmark className="h-8 w-8 text-purple-500" />
          Saved Products
        </h1>
        <p className="text-muted-foreground mt-1">Các sản phẩm và dự án bạn đã lưu để xem sau</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-500">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Tổng đã lưu</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-cyan-500">{stats.showcase}</div>
            <div className="text-sm text-muted-foreground">Showcase</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-indigo-500">{stats.course}</div>
            <div className="text-sm text-muted-foreground">Khóa học</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-pink-500">{stats.agent}</div>
            <div className="text-sm text-muted-foreground">AI Agents</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sản phẩm đã lưu..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tất cả ({stats.total})</TabsTrigger>
          <TabsTrigger value="showcase">
            <Star className="h-4 w-4 mr-1" />
            Showcase ({stats.showcase})
          </TabsTrigger>
          <TabsTrigger value="course">
            <BookOpen className="h-4 w-4 mr-1" />
            Khóa học ({stats.course})
          </TabsTrigger>
          <TabsTrigger value="agent">
            <ShoppingBag className="h-4 w-4 mr-1" />
            AI Agents ({stats.agent})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-40 bg-muted" />
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="p-12 text-center">
              <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có sản phẩm nào được lưu</h3>
              <p className="text-muted-foreground mb-4">
                Khám phá các sản phẩm và nhấn nút "Lưu" để thêm vào đây
              </p>
              <Button onClick={() => navigate("/projects")}>
                <Star className="h-4 w-4 mr-2" />
                Khám phá Showcase
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredProducts.map((item) => {
                  const details = getProductDetails(item.product_slug, item.product_type);
                  if (!details) return null;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="group overflow-hidden hover:shadow-lg transition-all">
                        {/* Image */}
                        <div className="relative h-40 overflow-hidden bg-muted">
                          {details.image ? (
                            <img
                              src={details.image}
                              alt={details.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Star className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm">
                            {item.product_type === "showcase"
                              ? "Showcase"
                              : item.product_type === "course"
                              ? "Khóa học"
                              : "AI Agent"}
                          </Badge>
                        </div>

                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg line-clamp-1">{details.name}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {details.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Lưu {new Date(item.created_at).toLocaleDateString("vi-VN")}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => removeMutation.mutate(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(details.link)}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Xem
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
