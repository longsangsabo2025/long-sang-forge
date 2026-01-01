import { AIAssistant } from "@/components/academy/AIAssistant";
import { GamingCourseCard } from "@/components/academy/gaming/GamingCourseCard";
import { GamingHeroSection } from "@/components/academy/gaming/GamingHeroSection";
import { GamingRightSidebar } from "@/components/academy/gaming/GamingRightSidebar";
import { GamingSidebar } from "@/components/academy/gaming/GamingSidebar";
import { GamingStatsCard } from "@/components/academy/gaming/GamingStatsCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourses, useUserEnrollments } from "@/hooks/useAcademy";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Flame,
  GraduationCap,
  Search,
  Target,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AcademyGaming() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedTab, setSelectedTab] = useState("all");

  const {
    data: coursesData,
    isLoading,
    error,
  } = useCourses(
    {
      category: selectedCategory !== "Tất cả" ? selectedCategory : undefined,
      is_free: selectedTab === "free" ? true : undefined,
      search: searchQuery || undefined,
    },
    { page: 1, limit: 12, sort_by: "students", sort_order: "desc" }
  );

  const { data: enrollmentsData } = useUserEnrollments();
  const enrollments = enrollmentsData?.data || [];
  const courses = coursesData?.data || [];

  const categories = [
    "Tất cả",
    "AI & Machine Learning",
    "Web Development",
    "Mobile Development",
    "Data Science",
  ];

  const totalCourses = courses.length;
  const enrolledCourses = enrollments.length;
  const totalStudents = courses.reduce((acc, course) => acc + (course.students_count || 0), 0);
  const avgRating =
    courses.length > 0
      ? (courses.reduce((acc, course) => acc + (course.rating || 0), 0) / courses.length).toFixed(1)
      : "0.0";

  const featuredCourse = courses[0] || {
    title: "Complete AI Agent Development Masterclass",
    description: "Build Production-Ready AI Agents • Real-World Projects • Practical Mentorship",
    thumbnail_url:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    instructor: "Long Sang",
    rating: 4.9,
    reviews_count: 2345,
    students_count: 12500,
    modules_count: 24,
    lessons_count: 156,
    duration_hours: 48,
    price: 99,
  };

  return (
    <div className="min-h-screen bg-background">
      <GamingSidebar />

      {/* Academy Header */}
      <header className="fixed top-0 left-0 xl:left-[280px] right-0 xl:right-[300px] z-40 bg-background/95 backdrop-blur-xl border-b border-border h-16 flex items-center justify-between px-6">
        {/* Left: Back button + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
            aria-label="Quay lại trang trước"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Quay lại</span>
          </button>
          <div className="hidden sm:block h-6 w-px bg-border" />
          <div className="hidden sm:flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Academy</span>
          </div>
        </div>

        {/* Right: Search */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tìm khóa học..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 h-9 bg-muted/50"
            />
          </div>
        </div>
      </header>

      <main className="ml-0 xl:ml-[280px] mr-0 xl:mr-[300px] pt-20 px-6 pb-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
          <GamingStatsCard
            icon={BookOpen}
            title="Total Courses"
            value={totalCourses}
            change="+12 this month"
            trend="up"
          />
          <GamingStatsCard
            icon={Trophy}
            title="Enrolled"
            value={enrolledCourses}
            change="+3 active"
            trend="up"
          />
          <GamingStatsCard
            icon={Target}
            title="Students"
            value={totalStudents.toLocaleString()}
            change="+1.2K this week"
            trend="up"
          />
          <GamingStatsCard
            icon={Flame}
            title="Avg Rating"
            value={avgRating}
            change="Top rated"
            trend="up"
          />
        </div>

        {/* Hero Section */}
        {featuredCourse && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <GamingHeroSection
              image={
                featuredCourse.thumbnail_url ||
                "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80"
              }
              badgeText="🔥 TRENDING THIS WEEK"
              title={featuredCourse.title}
              subtitle={featuredCourse.description || "Build Production-Ready AI Agents"}
              instructor={
                typeof featuredCourse.instructor === "object"
                  ? featuredCourse.instructor?.name
                  : featuredCourse.instructor || "Long Sang"
              }
              rating={featuredCourse.rating || 4.9}
              reviews={featuredCourse.reviews_count || 2345}
              students={`${Math.floor((featuredCourse.students_count || 12500) / 1000)}K`}
              completionRate={89}
              modules={featuredCourse.modules_count || 24}
              lessons={featuredCourse.lessons_count || 156}
              duration={`${featuredCourse.duration_hours || 48} hrs`}
              projects={12}
              price={featuredCourse.price || 99}
            />
          </div>
        )}

        {/* Search & Filter */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Card className="glass-card p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses, instructors, topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 glass-card border-gaming-cyan/30 focus:border-gaming-cyan"
                  />
                </div>
                <TabsList className="grid grid-cols-3 w-full md:w-auto glass-card">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="free">Free</TabsTrigger>
                  <TabsTrigger value="enrolled">Enrolled</TabsTrigger>
                </TabsList>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 mt-4">
                {categories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={
                      selectedCategory === category
                        ? "bg-gaming-purple hover:bg-gaming-purple/80 text-white"
                        : "glass-card hover:border-gaming-cyan"
                    }
                    size="sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Failed to load courses. Please try again later.</AlertDescription>
            </Alert>
          )}

          {/* Courses Grid */}
          <TabsContent value={selectedTab} className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="glass-card">
                    <Skeleton className="aspect-video" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <Card className="glass-card p-12 text-center">
                <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => {
                  const isEnrolled = enrollments.some((e) => e.course_id === course.id);
                  const enrollment = enrollments.find((e) => e.course_id === course.id);
                  const progress = enrollment?.progress || 0;

                  return (
                    <div
                      key={course.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                    >
                      <GamingCourseCard
                        image={
                          course.thumbnail_url ||
                          "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80"
                        }
                        title={course.title}
                        instructor={
                          typeof course.instructor === "object"
                            ? course.instructor?.name
                            : course.instructor || "AINewbieVN"
                        }
                        rating={course.rating || 4.5}
                        reviews={course.reviews_count || 0}
                        students={`${Math.floor((course.students_count || 0) / 1000)}K`}
                        duration={`${course.duration_hours || 0}h`}
                        price={course.price || 99}
                        enrolled={isEnrolled}
                        progress={progress}
                        badge={
                          course.students_count && course.students_count > 10000
                            ? { text: "Bestseller", variant: "bestseller" }
                            : course.is_new
                            ? { text: "New", variant: "new" }
                            : undefined
                        }
                        level={course.level || "Intermediate"}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <GamingRightSidebar />

      {/* AI Assistant - Fixed position chat widget */}
      <AIAssistant lessonId="academy-general" lessonTitle="Academy AI Assistant" />
    </div>
  );
}
