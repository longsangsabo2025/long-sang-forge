/**
 * SHARED CONFIG FOR ALL SCRIPTS
 *
 * Sử dụng: const config = require('./_config.cjs');
 *
 * Đọc từ .env file thay vì hardcode keys
 */

const path = require("path");

// Use dotenv to properly parse .env file
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Export config
module.exports = {
  // Supabase
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || "https://diexsbzqwsbpilsymnfb.supabase.co",
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  // YouTube Transcript API (add to .env if needed)
  TRANSCRIPT_API_KEY: process.env.TRANSCRIPT_API_KEY || "6958f1b42ea386e511cafa73",

  // Default user ID for knowledge base
  DEFAULT_USER_ID: "default-longsang-user",

  // Helper to get Supabase client
  getSupabaseClient: function () {
    const { createClient } = require("@supabase/supabase-js");
    return createClient(this.SUPABASE_URL, this.SUPABASE_SERVICE_KEY);
  },

  // Helper to get OpenAI client
  getOpenAIClient: function () {
    const OpenAI = require("openai");
    return new OpenAI({ apiKey: this.OPENAI_API_KEY });
  },

  // Validate required keys
  validate: function (requiredKeys = ["SUPABASE_SERVICE_KEY"]) {
    const missing = requiredKeys.filter((key) => !this[key]);
    if (missing.length > 0) {
      console.error("❌ Missing required keys:", missing.join(", "));
      console.error("   Please check your .env file");
      process.exit(1);
    }
    return true;
  },
};
