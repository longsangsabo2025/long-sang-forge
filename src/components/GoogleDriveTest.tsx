import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";
import React from "react";

const GoogleDriveTest: React.FC = () => {
  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          Google Drive Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Google Drive integration is available for premium users.
        </p>
      </CardContent>
    </Card>
  );
};

export default GoogleDriveTest;
