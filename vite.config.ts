import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Disable PWA in development to avoid caching issues
    mode !== "development" && VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'SABO ARENA - AI Automation Platform',
        short_name: 'SABO ARENA',
        description: 'Vietnam\'s leading gaming platform with AI automation',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: "globalThis",
    'process.env': {}
  },
  optimizeDeps: {
    exclude: [
      'googleapis', 
      'google-auth-library',
      '@google-analytics/data',
      'google-spreadsheet',
      'gaxios',
      'gcp-metadata'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      external: [
        'googleapis', 
        'google-auth-library',
        '@google-analytics/data',
        'google-spreadsheet'
      ],
      output: {
        manualChunks: {
          // Vendor libraries
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-slot'],
          'vendor-animation': ['framer-motion'],
          'vendor-charts': ['lucide-react', 'recharts'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers'],
          
          // Feature-based chunks
          'admin-pages': [
            './src/pages/AdminDashboard',
            './src/pages/AdminSettings', 
            './src/pages/AdminAnalytics',
            './src/pages/AdminUsers',
            './src/pages/AdminCourses'
          ],
          'showcase-pages': [
            './src/pages/ProjectShowcase',
            './src/pages/EnhancedProjectShowcase',
            './src/pages/AppShowcaseDetail'
          ],
          'investment-pages': [
            './src/pages/InvestmentPortalLayout',
            './src/pages/InvestmentOverview',
            './src/pages/InvestmentRoadmap',
            './src/pages/InvestmentFinancials'
          ],
          'agent-pages': [
            './src/pages/AgentCenter',
            './src/pages/AgentDetail',
            './src/pages/AgentDashboard'
          ]
        }
      }
    }
  }
}));
