/**
 * Streaming Command Component with Visual Execution Steps
 * Enhanced version that shows execution steps on visual canvas
 */

import { StreamingCommand } from "@/components/agent-center/StreamingCommand";
import { ExecutionEvent } from "@/hooks/useExecutionSteps";

interface StreamingCommandWithVisualProps {
  command: string;
  onComplete?: (result: any) => void;
  onExecutionEvent?: (event: ExecutionEvent) => void;
}

export function StreamingCommandWithVisual({
  command,
  onComplete,
  onExecutionEvent,
}: StreamingCommandWithVisualProps) {
  // This component wraps StreamingCommand and converts events to execution events
  // The actual integration will be in Visual Workspace

  return <StreamingCommand command={command} onComplete={onComplete} />;
}
