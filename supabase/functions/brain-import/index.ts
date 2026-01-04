/**
 * Brain Import - Supabase Edge Function
 * =======================================
 * Import knowledge from YouTube, URL, PDF for user's Second Brain
 *
 * Deploy: npx supabase functions deploy brain-import --no-verify-jwt
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { DOMParser } from "https://esm.sh/linkedom@0.14.26";
import OpenAI from "https://esm.sh/openai@4.104.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

interface ImportRequest {
  userId: string;
  domainId?: string;
  sourceType: "youtube" | "url" | "text";
  sourceUrl?: string;
  content?: string;
  title?: string;
}

interface ChunkResult {
  title: string;
  content: string;
  embedding: number[];
}

// YouTube transcript fetcher (using public API)
async function getYouTubeTranscript(
  videoUrl: string
): Promise<{ title: string; transcript: string }> {
  const videoId = extractYouTubeId(videoUrl);
  if (!videoId) throw new Error("Invalid YouTube URL");

  // Get video info
  const videoInfoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const response = await fetch(videoInfoUrl);
  const html = await response.text();

  // Extract title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(" - YouTube", "").trim() : `Video ${videoId}`;

  // Try to get transcript from timedtext API
  const transcriptMatch = html.match(/"captionTracks":\[([^\]]+)\]/);
  if (!transcriptMatch) {
    throw new Error("No transcript available for this video");
  }

  const captionData = JSON.parse(`[${transcriptMatch[1]}]`);
  const captionUrl = captionData[0]?.baseUrl;
  if (!captionUrl) {
    throw new Error("No caption URL found");
  }

  const transcriptResponse = await fetch(captionUrl);
  const transcriptXml = await transcriptResponse.text();

  // Parse transcript XML
  const texts = transcriptXml.match(/<text[^>]*>([^<]+)<\/text>/g) || [];
  const transcript = texts
    .map((t) => t.replace(/<[^>]+>/g, "").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return { title, transcript };
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// URL content fetcher
async function fetchUrlContent(url: string): Promise<{ title: string; content: string }> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; LongSangBrain/1.0)",
    },
  });
  const html = await response.text();

  // Parse HTML
  const doc = new DOMParser().parseFromString(html, "text/html");

  // Get title
  const title = doc.querySelector("title")?.textContent || new URL(url).hostname;

  // Get main content (remove scripts, styles, nav, etc.)
  const removeSelectors = [
    "script",
    "style",
    "nav",
    "header",
    "footer",
    "aside",
    ".ad",
    "#comments",
  ];
  removeSelectors.forEach((selector) => {
    doc.querySelectorAll(selector).forEach((el: Element) => el.remove());
  });

  // Get text content
  const content =
    doc.querySelector("article")?.textContent ||
    doc.querySelector("main")?.textContent ||
    doc.querySelector("body")?.textContent ||
    "";

  // Clean up whitespace
  const cleanContent = content.replace(/\s+/g, " ").trim();

  return { title, content: cleanContent };
}

// Split content into chunks
function chunkContent(content: string, maxChunkSize: number = 2000): string[] {
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

// Generate embeddings using OpenAI
async function generateEmbeddings(texts: string[], openaiKey: string): Promise<number[][]> {
  const openai = new OpenAI({ apiKey: openaiKey });

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });

  return response.data.map((d) => d.embedding);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const openaiKey = Deno.env.get("OPENAI_API_KEY")!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body: ImportRequest = await req.json();
    const { userId, domainId, sourceType, sourceUrl, content, title } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check quota
    const { data: quotaCheck } = await supabase.rpc("check_brain_quota", {
      p_user_id: userId,
      p_action: "document",
    });

    if (!quotaCheck?.allowed) {
      return new Response(
        JSON.stringify({
          error: "Quota exceeded",
          reason: quotaCheck?.reason,
          limit: quotaCheck?.limit,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create import job
    const { data: importJob, error: jobError } = await supabase
      .from("user_brain_imports")
      .insert({
        user_id: userId,
        domain_id: domainId,
        source_type: sourceType,
        source_url: sourceUrl,
        source_title: title,
        status: "processing",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError) throw jobError;

    let rawContent = "";
    let finalTitle = title || "";

    // Fetch content based on source type
    try {
      if (sourceType === "youtube") {
        if (!sourceUrl) throw new Error("YouTube URL is required");
        const result = await getYouTubeTranscript(sourceUrl);
        rawContent = result.transcript;
        finalTitle = finalTitle || result.title;
      } else if (sourceType === "url") {
        if (!sourceUrl) throw new Error("URL is required");
        const result = await fetchUrlContent(sourceUrl);
        rawContent = result.content;
        finalTitle = finalTitle || result.title;
      } else if (sourceType === "text") {
        if (!content) throw new Error("Content is required");
        rawContent = content;
        finalTitle = finalTitle || "Manual Import";
      }
    } catch (err) {
      // Update job with error
      await supabase
        .from("user_brain_imports")
        .update({
          status: "failed",
          error_message: (err as Error).message,
          completed_at: new Date().toISOString(),
        })
        .eq("id", importJob.id);

      return new Response(
        JSON.stringify({ error: "Failed to fetch content", detail: (err as Error).message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check content length
    if (rawContent.length < 100) {
      await supabase
        .from("user_brain_imports")
        .update({
          status: "failed",
          error_message: "Content too short (minimum 100 characters)",
          completed_at: new Date().toISOString(),
        })
        .eq("id", importJob.id);

      return new Response(JSON.stringify({ error: "Content too short" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Chunk content
    const chunks = chunkContent(rawContent);

    // Update progress
    await supabase
      .from("user_brain_imports")
      .update({ progress: 30, chunks_generated: chunks.length })
      .eq("id", importJob.id);

    // Generate embeddings
    const embeddings = await generateEmbeddings(chunks, openaiKey);

    // Update progress
    await supabase.from("user_brain_imports").update({ progress: 70 }).eq("id", importJob.id);

    // Insert knowledge items
    const knowledgeItems = chunks.map((chunk, i) => ({
      domain_id: domainId,
      user_id: userId,
      title: chunks.length > 1 ? `${finalTitle} (Part ${i + 1})` : finalTitle,
      content: chunk,
      content_type:
        sourceType === "youtube" ? "external" : sourceType === "url" ? "document" : "note",
      source_url: sourceUrl,
      embedding: JSON.stringify(embeddings[i]),
      metadata: {
        import_job_id: importJob.id,
        source_type: sourceType,
        chunk_index: i,
        total_chunks: chunks.length,
      },
    }));

    const { data: insertedKnowledge, error: insertError } = await supabase
      .from("brain_knowledge")
      .insert(knowledgeItems)
      .select("id");

    if (insertError) throw insertError;

    // Update quota
    await supabase.rpc("increment_brain_usage", {
      p_user_id: userId,
      p_action: "document",
      p_amount: insertedKnowledge.length,
    });

    // Complete job
    await supabase
      .from("user_brain_imports")
      .update({
        status: "completed",
        progress: 100,
        documents_created: insertedKnowledge.length,
        source_title: finalTitle,
        completed_at: new Date().toISOString(),
      })
      .eq("id", importJob.id);

    return new Response(
      JSON.stringify({
        success: true,
        importJobId: importJob.id,
        documentsCreated: insertedKnowledge.length,
        chunksGenerated: chunks.length,
        title: finalTitle,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[Brain Import Error]", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
