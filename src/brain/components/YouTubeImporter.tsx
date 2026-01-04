/**
 * YouTube Knowledge Import Component
 * Cho phép import YouTube video transcripts vào Brain
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Brain, CheckCircle, Loader2, Youtube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const USER_ID = "default-longsang-user";

interface VideoInfo {
  title: string;
  author: string;
  thumbnail: string | null;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function fetchVideoInfo(videoId: string): Promise<VideoInfo> {
  try {
    const response = await fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
    );
    const data = await response.json();

    return {
      title: data.title || `YouTube Video ${videoId}`,
      author: data.author_name || "Unknown",
      thumbnail: data.thumbnail_url,
    };
  } catch {
    return {
      title: `YouTube Video ${videoId}`,
      author: "Unknown",
      thumbnail: null,
    };
  }
}

export function YouTubeImporter() {
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"url" | "transcript" | "done">("url");
  const [tags, setTags] = useState("");

  const handleFetchInfo = async () => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      toast.error("URL YouTube không hợp lệ");
      return;
    }

    setLoading(true);
    try {
      const info = await fetchVideoInfo(videoId);
      setVideoInfo(info);
      setStep("transcript");
      toast.success("Đã lấy thông tin video");
    } catch {
      toast.error("Không thể lấy thông tin video");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!videoInfo || !transcript.trim()) {
      toast.error("Vui lòng nhập transcript");
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) return;

    setLoading(true);
    try {
      // Generate summary using Supabase Edge Function (if available)
      let summary = `Video từ ${videoInfo.author}: ${videoInfo.title}`;

      // Build content
      const fullContent = `# ${videoInfo.title}

**Channel:** ${videoInfo.author}
**Source:** https://youtube.com/watch?v=${videoId}

---

## Transcript

${transcript}`;

      // Generate embedding using Edge Function
      let embedding = null;
      try {
        const { data: embeddingData } = await supabase.functions.invoke("generate-embedding", {
          body: { text: `${videoInfo.title}\n\n${transcript.slice(0, 6000)}` },
        });
        embedding = embeddingData?.embedding;
      } catch (e) {
        console.warn("Embedding generation failed:", e);
      }

      // Insert into knowledge_base
      const tagArray = [
        "youtube",
        videoInfo.author,
        ...tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      ];

      const { data, error } = await (supabase as any)
        .from("knowledge_base")
        .insert({
          user_id: USER_ID,
          category: "youtube",
          title: videoInfo.title,
          content: fullContent,
          summary: summary,
          source: "youtube",
          source_url: `https://youtube.com/watch?v=${videoId}`,
          tags: tagArray,
          importance: 7,
          is_public: false,
          is_active: true,
          embedding: embedding,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Đã import video vào Brain!");
      setStep("done");

      // Reset after 3s
      setTimeout(() => {
        setUrl("");
        setTranscript("");
        setVideoInfo(null);
        setTags("");
        setStep("url");
      }, 3000);
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Không thể import video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-500" />
          Import từ YouTube
        </CardTitle>
        <CardDescription>Thêm kiến thức từ video YouTube vào Brain của bạn</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1: URL Input */}
        <div className="space-y-2">
          <Label htmlFor="youtube-url">YouTube URL</Label>
          <div className="flex gap-2">
            <Input
              id="youtube-url"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={step !== "url"}
            />
            {step === "url" && (
              <Button onClick={handleFetchInfo} disabled={loading || !url}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tiếp tục"}
              </Button>
            )}
          </div>
        </div>

        {/* Video Info Preview */}
        {videoInfo && (
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            {videoInfo.thumbnail && (
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                className="w-32 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h4 className="font-medium line-clamp-2">{videoInfo.title}</h4>
              <p className="text-sm text-muted-foreground">{videoInfo.author}</p>
            </div>
          </div>
        )}

        {/* Step 2: Transcript Input */}
        {step === "transcript" && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="h-4 w-4" />
                Cách lấy transcript
              </h4>
              <ol className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>1. Mở video trên YouTube</li>
                <li>
                  2. Click vào nút <strong>"..."</strong> dưới video
                </li>
                <li>
                  3. Chọn <strong>"Show transcript"</strong>
                </li>
                <li>4. Copy toàn bộ text và paste vào đây</li>
              </ol>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transcript">Transcript</Label>
              <Textarea
                id="transcript"
                placeholder="Paste transcript từ YouTube vào đây..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={10}
              />
              <p className="text-xs text-muted-foreground">
                {transcript.length > 0 ? `${transcript.length} ký tự` : "Chưa có nội dung"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
              <Input
                id="tags"
                placeholder="ai, tutorial, coding..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStep("url");
                  setVideoInfo(null);
                }}
              >
                Quay lại
              </Button>
              <Button
                onClick={handleImport}
                disabled={loading || !transcript.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Đang import...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Import vào Brain
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === "done" && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">Import thành công!</h3>
            <p className="text-muted-foreground">Video đã được thêm vào Brain của bạn</p>
            <div className="flex gap-2 mt-4">
              {["youtube", videoInfo?.author].filter(Boolean).map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
