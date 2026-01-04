/**
 * Tech Stack Icon Registry
 * Mapping từ tên công nghệ → Iconify icon
 *
 * Browse icons tại: https://icon-sets.iconify.design/
 * Phổ biến: logos, devicon, simple-icons, skill-icons
 */

export interface TechIconEntry {
  icon: string; // Iconify icon name
  color?: string; // Optional brand color
  aliases?: string[]; // Alternative names to match
}

export const TECH_ICON_REGISTRY: Record<string, TechIconEntry> = {
  // ==================== FRONTEND ====================
  // React
  react: { icon: "logos:react", color: "#61DAFB", aliases: ["reactjs", "react.js", "react 18"] },
  "react native": {
    icon: "logos:react",
    color: "#61DAFB",
    aliases: ["react-native", "reactnative"],
  },

  // Vue
  vue: { icon: "logos:vue", color: "#4FC08D", aliases: ["vuejs", "vue.js", "vue 3"] },
  nuxt: { icon: "logos:nuxt-icon", color: "#00DC82", aliases: ["nuxtjs", "nuxt.js"] },

  // Angular
  angular: { icon: "logos:angular-icon", color: "#DD0031", aliases: ["angularjs"] },

  // Next.js
  next: { icon: "logos:nextjs-icon", color: "#000000", aliases: ["nextjs", "next.js"] },

  // TypeScript
  typescript: { icon: "logos:typescript-icon", color: "#3178C6", aliases: ["ts"] },

  // JavaScript
  javascript: { icon: "logos:javascript", color: "#F7DF1E", aliases: ["js", "es6", "ecmascript"] },

  // HTML/CSS
  html: { icon: "logos:html-5", color: "#E34F26", aliases: ["html5"] },
  css: { icon: "logos:css-3", color: "#1572B6", aliases: ["css3"] },

  // Tailwind
  tailwind: {
    icon: "logos:tailwindcss-icon",
    color: "#06B6D4",
    aliases: ["tailwindcss", "tailwind css"],
  },

  // Shadcn/UI
  shadcn: { icon: "simple-icons:shadcnui", color: "#000000", aliases: ["shadcn/ui", "shadcnui"] },

  // Other UI Libraries
  "material ui": { icon: "logos:material-ui", color: "#007FFF", aliases: ["mui", "material-ui"] },
  "chakra ui": { icon: "simple-icons:chakraui", color: "#319795", aliases: ["chakra"] },
  "ant design": { icon: "logos:ant-design", color: "#1890FF", aliases: ["antd"] },

  // Vite
  vite: { icon: "logos:vitejs", color: "#646CFF", aliases: ["vitejs"] },

  // Webpack
  webpack: { icon: "logos:webpack", color: "#8DD6F9", aliases: ["webpackjs"] },

  // ==================== MOBILE ====================
  // Flutter
  flutter: { icon: "logos:flutter", color: "#02569B", aliases: ["flutter sdk"] },

  // Dart
  dart: { icon: "logos:dart", color: "#0175C2", aliases: ["dartlang"] },

  // Swift
  swift: { icon: "logos:swift", color: "#F05138", aliases: ["swiftui"] },

  // Kotlin
  kotlin: { icon: "logos:kotlin-icon", color: "#7F52FF", aliases: ["kotlinlang"] },

  // iOS
  ios: { icon: "logos:apple", color: "#000000", aliases: ["iphone", "apple"] },

  // Android
  android: { icon: "logos:android-icon", color: "#3DDC84", aliases: ["android sdk"] },

  // ==================== BACKEND ====================
  // Node.js
  node: { icon: "logos:nodejs-icon", color: "#339933", aliases: ["nodejs", "node.js"] },

  // Express
  express: { icon: "simple-icons:express", color: "#000000", aliases: ["expressjs", "express.js"] },

  // NestJS
  nestjs: { icon: "logos:nestjs", color: "#E0234E", aliases: ["nest"] },

  // Python
  python: { icon: "logos:python", color: "#3776AB", aliases: ["py", "python3"] },

  // Django
  django: { icon: "logos:django-icon", color: "#092E20", aliases: ["djangoproject"] },

  // FastAPI
  fastapi: { icon: "simple-icons:fastapi", color: "#009688", aliases: ["fast-api"] },

  // Flask
  flask: { icon: "simple-icons:flask", color: "#000000", aliases: ["flaskpy"] },

  // Go
  go: { icon: "logos:go", color: "#00ADD8", aliases: ["golang"] },

  // Rust
  rust: { icon: "logos:rust", color: "#000000", aliases: ["rustlang"] },

  // Java
  java: { icon: "logos:java", color: "#007396", aliases: ["jdk"] },

  // Spring
  spring: { icon: "logos:spring-icon", color: "#6DB33F", aliases: ["spring boot", "springboot"] },

  // .NET
  dotnet: { icon: "logos:dotnet", color: "#512BD4", aliases: [".net", "asp.net", "c#", "csharp"] },

  // PHP
  php: { icon: "logos:php", color: "#777BB4", aliases: ["php8"] },

  // Laravel
  laravel: { icon: "logos:laravel", color: "#FF2D20", aliases: ["laravelphp"] },

  // Ruby
  ruby: { icon: "logos:ruby", color: "#CC342D", aliases: ["rubylang"] },

  // Rails
  rails: { icon: "logos:rails", color: "#CC0000", aliases: ["ruby on rails", "ror"] },

  // GraphQL
  graphql: { icon: "logos:graphql", color: "#E10098", aliases: ["gql"] },

  // REST API
  rest: {
    icon: "mdi:api",
    color: "#00BCD4",
    aliases: ["restful", "rest api", "restful api", "restful apis"],
  },

  // ==================== DATABASE ====================
  // PostgreSQL
  postgresql: { icon: "logos:postgresql", color: "#4169E1", aliases: ["postgres", "psql", "pg"] },

  // MySQL
  mysql: { icon: "logos:mysql-icon", color: "#4479A1", aliases: ["mariadb"] },

  // MongoDB
  mongodb: { icon: "logos:mongodb-icon", color: "#47A248", aliases: ["mongo"] },

  // Redis
  redis: { icon: "logos:redis", color: "#DC382D", aliases: ["redis caching", "redis cache"] },

  // SQLite
  sqlite: { icon: "logos:sqlite", color: "#003B57", aliases: ["sqlite3"] },

  // Supabase
  supabase: { icon: "logos:supabase-icon", color: "#3ECF8E", aliases: ["supabase.io"] },

  // Firebase
  firebase: { icon: "logos:firebase", color: "#FFCA28", aliases: ["firestore"] },

  // Prisma
  prisma: { icon: "simple-icons:prisma", color: "#2D3748", aliases: ["prismaorm"] },

  // Drizzle
  drizzle: { icon: "simple-icons:drizzle", color: "#C5F74F", aliases: ["drizzle orm"] },

  // ==================== DEVOPS & CLOUD ====================
  // Docker
  docker: {
    icon: "logos:docker-icon",
    color: "#2496ED",
    aliases: ["dockerfile", "docker-compose"],
  },

  // Kubernetes
  kubernetes: { icon: "logos:kubernetes", color: "#326CE5", aliases: ["k8s"] },

  // AWS
  aws: { icon: "logos:aws", color: "#FF9900", aliases: ["amazon web services", "amazon"] },

  // Google Cloud
  gcp: {
    icon: "logos:google-cloud",
    color: "#4285F4",
    aliases: ["google cloud", "google cloud services", "google cloud platform"],
  },

  // Azure
  azure: { icon: "logos:microsoft-azure", color: "#0078D4", aliases: ["microsoft azure"] },

  // Vercel
  vercel: { icon: "logos:vercel-icon", color: "#000000", aliases: ["vercel.com", "zeit"] },

  // Netlify
  netlify: { icon: "logos:netlify-icon", color: "#00C7B7", aliases: ["netlify.com"] },

  // Cloudflare
  cloudflare: {
    icon: "logos:cloudflare-icon",
    color: "#F38020",
    aliases: ["cf", "cloudflare workers"],
  },

  // Nginx
  nginx: { icon: "logos:nginx", color: "#009639", aliases: ["nginxconf"] },

  // GitHub Actions
  "github actions": {
    icon: "logos:github-actions",
    color: "#2088FF",
    aliases: ["gh actions", "github-actions"],
  },

  // GitLab CI
  "gitlab ci": { icon: "logos:gitlab", color: "#FC6D26", aliases: ["gitlab-ci", "gitlab"] },

  // Jenkins
  jenkins: { icon: "logos:jenkins", color: "#D24939", aliases: ["jenkinsci"] },

  // Terraform
  terraform: { icon: "logos:terraform-icon", color: "#7B42BC", aliases: ["tf", "hcl"] },

  // ==================== TOOLS & UTILITIES ====================
  // Git
  git: { icon: "logos:git-icon", color: "#F05032", aliases: ["github", "gitlab", "bitbucket"] },

  // VS Code
  vscode: { icon: "logos:visual-studio-code", color: "#007ACC", aliases: ["visual studio code"] },

  // Figma
  figma: { icon: "logos:figma", color: "#F24E1E", aliases: ["figmadesign"] },

  // Postman
  postman: { icon: "logos:postman-icon", color: "#FF6C37", aliases: ["postmanapi"] },

  // Swagger
  swagger: { icon: "logos:swagger", color: "#85EA2D", aliases: ["openapi"] },

  // ESLint
  eslint: { icon: "logos:eslint", color: "#4B32C3", aliases: ["eslintrc"] },

  // Prettier
  prettier: { icon: "logos:prettier", color: "#F7B93E", aliases: ["prettierrc"] },

  // Jest
  jest: { icon: "logos:jest", color: "#C21325", aliases: ["jestjs"] },

  // Vitest
  vitest: { icon: "logos:vitest", color: "#6E9F18", aliases: ["vitestjs"] },

  // Cypress
  cypress: { icon: "logos:cypress-icon", color: "#17202C", aliases: ["cypressio"] },

  // ==================== AI/ML ====================
  // OpenAI
  openai: { icon: "simple-icons:openai", color: "#412991", aliases: ["gpt", "chatgpt", "gpt-4"] },

  // TensorFlow
  tensorflow: { icon: "logos:tensorflow", color: "#FF6F00", aliases: ["tf"] },

  // PyTorch
  pytorch: { icon: "logos:pytorch-icon", color: "#EE4C2C", aliases: ["torch"] },

  // Hugging Face
  huggingface: {
    icon: "simple-icons:huggingface",
    color: "#FFD21E",
    aliases: ["hugging face", "transformers"],
  },

  // ==================== MESSAGING & REALTIME ====================
  // Firebase Cloud Messaging
  fcm: {
    icon: "logos:firebase",
    color: "#FFCA28",
    aliases: ["firebase cloud messaging", "firebase messaging"],
  },

  // WebSocket
  websocket: { icon: "mdi:websocket", color: "#010101", aliases: ["ws", "socket", "realtime"] },

  // Socket.io
  "socket.io": { icon: "simple-icons:socketdotio", color: "#010101", aliases: ["socketio"] },

  // ==================== AUTHENTICATION ====================
  // Auth0
  auth0: { icon: "simple-icons:auth0", color: "#EB5424", aliases: ["auth zero"] },

  // Clerk
  clerk: { icon: "simple-icons:clerk", color: "#6C47FF", aliases: ["clerk.dev"] },

  // OAuth
  oauth: { icon: "mdi:shield-key", color: "#000000", aliases: ["oauth2", "oauth 2.0"] },

  // JWT
  jwt: { icon: "logos:jwt-icon", color: "#000000", aliases: ["json web token"] },
};

/**
 * Tìm icon cho một tech name
 * Hỗ trợ tìm kiếm fuzzy và aliases
 */
export function findTechIcon(techName: string): TechIconEntry | null {
  if (!techName) return null;

  const normalizedName = techName.toLowerCase().trim();

  // 1. Exact match
  if (TECH_ICON_REGISTRY[normalizedName]) {
    return TECH_ICON_REGISTRY[normalizedName];
  }

  // 2. Check aliases
  for (const [key, entry] of Object.entries(TECH_ICON_REGISTRY)) {
    if (entry.aliases?.some((alias) => alias.toLowerCase() === normalizedName)) {
      return entry;
    }
  }

  // 3. Partial match (contains)
  for (const [key, entry] of Object.entries(TECH_ICON_REGISTRY)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return entry;
    }
    // Check aliases for partial match
    if (
      entry.aliases?.some(
        (alias) =>
          normalizedName.includes(alias.toLowerCase()) ||
          alias.toLowerCase().includes(normalizedName)
      )
    ) {
      return entry;
    }
  }

  return null;
}

/**
 * Lấy icon name, fallback về default nếu không tìm thấy
 */
export function getTechIconName(techName: string, fallback = "mdi:code-tags"): string {
  const entry = findTechIcon(techName);
  return entry?.icon || fallback;
}

/**
 * Lấy brand color của tech
 */
export function getTechColor(techName: string, fallback = "#06b6d4"): string {
  const entry = findTechIcon(techName);
  return entry?.color || fallback;
}

// Category icons for grouping
export const CATEGORY_ICONS: Record<string, string> = {
  Frontend: "mdi:monitor-cellphone",
  Backend: "mdi:server",
  Database: "mdi:database",
  DevOps: "mdi:cloud-outline",
  Mobile: "mdi:cellphone",
  "AI/ML": "mdi:robot",
  Tools: "mdi:wrench",
  Other: "mdi:apps",
};
