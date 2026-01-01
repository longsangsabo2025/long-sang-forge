import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  twitterCard?: "summary" | "summary_large_image";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

export function SEO({
  title = "SABO Investment Portfolio - AI & Tech Projects",
  description = "Explore cutting-edge AI and technology investment opportunities in Vietnam. From billiards AI to educational platforms, discover innovative projects with high growth potential.",
  keywords = [
    "investment",
    "AI",
    "technology",
    "Vietnam",
    "startup",
    "billiards",
    "education",
    "platform",
  ],
  image = "/og-image.jpg",
  url = "https://longsang.ai",
  type = "website",
  twitterCard = "summary_large_image",
  author = "SABO Investments",
  publishedTime,
  modifiedTime,
}: SEOProps) {
  const fullTitle = title.includes("SABO") ? title : `${title} | SABO Investments`;
  const fullUrl = url.startsWith("http") ? url : `https://longsang.ai${url}`;
  const fullImage = image.startsWith("http") ? image : `https://longsang.ai${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      <meta name="author" content={author} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="SABO Investments" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="vi_VN" />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:creator" content="@saboinvestments" />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Article specific */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && <meta property="article:author" content={author} />}

      {/* Rich Snippets */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": type === "article" ? "Article" : "WebSite",
          url: fullUrl,
          name: fullTitle,
          description: description,
          image: fullImage,
          author: {
            "@type": "Organization",
            name: author,
          },
          ...(type === "website" && {
            potentialAction: {
              "@type": "SearchAction",
              target: `${fullUrl}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
          ...(publishedTime && {
            datePublished: publishedTime,
            dateModified: modifiedTime || publishedTime,
          }),
        })}
      </script>
    </Helmet>
  );
}

// Project-specific SEO - Enhanced with dynamic meta tags
export function ProjectSEO({ project, section = "overview" }: { project: any; section?: string }) {
  const sectionTitles: Record<string, string> = {
    overview: "Project Overview",
    investment: "Investment Opportunity",
    roadmap: "Development Roadmap",
    financials: "Financial Projections",
  };

  // Safely handle tech array - it might be undefined or not an array
  const techKeywords = Array.isArray(project?.tech_stack)
    ? project.tech_stack.map((t: any) => (typeof t === "string" ? t : t.name).toLowerCase())
    : Array.isArray(project?.tech)
    ? project.tech
    : [];

  const categoryKeyword = project?.category ? [project.category.toLowerCase()] : [];

  // Get first screenshot as og:image
  const projectImage = (() => {
    if (project?.logo_url) return project.logo_url;
    if (project?.screenshots?.[0]) {
      const screenshot = project.screenshots[0];
      return typeof screenshot === "string" ? screenshot : screenshot.url;
    }
    return "/og-project-default.jpg";
  })();

  const projectUrl = `/projects/${project?.slug || ""}`;
  const fullTitle = `${project?.name || "Project"} - ${
    sectionTitles[section] || section
  } | Long Sang Portfolio`;
  const description =
    project?.hero_description ||
    project?.shortDescription ||
    project?.description ||
    "Khám phá dự án này";

  return (
    <SEO
      title={fullTitle}
      description={`${description.slice(0, 150)}${description.length > 150 ? "..." : ""}`}
      keywords={[
        project?.name?.toLowerCase() || "project",
        "portfolio",
        "long sang",
        "developer",
        ...techKeywords,
        ...categoryKeyword,
      ]}
      image={projectImage}
      url={projectUrl}
      type="product"
    />
  );
}
