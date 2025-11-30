/**
 * Image Preview Component
 * Display generated ad images
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  imageUrl: string;
  imagePath?: string;
  adStyle?: string;
  prompt?: string;
  onDownload?: () => void;
}

export function ImagePreview({
  imageUrl,
  imagePath,
  adStyle,
  prompt,
  onDownload
}: ImagePreviewProps) {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `ad-image-${Date.now()}.jpg`;
      link.click();
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={prompt || 'Ad image'}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to placeholder
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {adStyle && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary">{adStyle}</Badge>
            </div>
          )}

          <div className="absolute top-2 right-2 flex gap-2">
            {imageUrl && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDownload}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(imageUrl, '_blank')}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {prompt && (
          <div className="p-3 border-t">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {prompt}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

