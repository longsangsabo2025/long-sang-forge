# Execution Steps Visualization

## Tổng Quan

Hệ thống Execution Steps Visualization được thiết kế để hiển thị các bước thực tế mà AI đang thực hiện, tương tự như Lovable AI và VSCode Copilot. Khi user gửi command, hệ thống sẽ:

1. Tạo execution plan với các steps
2. Hiển thị các steps trên visual canvas
3. Update status real-time khi từng step chạy
4. Show progress và duration cho mỗi step

## Architecture

### Components

1. **ExecutionStepNodes.tsx**
   - Custom React Flow node cho execution steps
   - Hỗ trợ 4 trạng thái: pending, running, completed, failed
   - Hiển thị progress bar, duration, error messages

2. **useExecutionSteps Hook**
   - Quản lý state của execution steps
   - Convert execution events → visual nodes
   - Track progress và duration

3. **Visual Workspace Integration**
   - Tích hợp vào Visual Workspace page
   - Auto-show execution steps khi detect execution command
   - Merge execution nodes với regular nodes

### Execution Flow

```
User Command
  ↓
Detect Execution Command (keywords: "tạo", "generate", "build", etc.)
  ↓
Create Execution Plan
  ↓
Show Steps on Canvas
  ↓
Execute Steps Sequentially
  ↓
Update Status Real-time
  ↓
Complete & Show Results
```

## Usage

### Basic Usage

Khi user gửi command trong Visual Workspace:

```typescript
// Command với keywords sẽ trigger execution steps
"Tạo một login form"
"Generate a blog post component"
"Build a data dashboard"
```

### Manual Execution Steps

```typescript
import { useExecutionSteps } from '@/hooks/useExecutionSteps';

const { processEvent, nodes, edges } = useExecutionSteps();

// Create plan
processEvent({
  type: 'plan',
  plan: {
    steps: [
      { id: 'step-1', name: 'Planning', type: 'planning' },
      { id: 'step-2', name: 'Generation', type: 'generation' },
    ],
  },
});

// Start step
processEvent({ type: 'step_start', stepId: 'step-1' });

// Update progress
processEvent({ type: 'step_progress', stepId: 'step-1', progress: 50 });

// Complete step
processEvent({ type: 'step_complete', stepId: 'step-1' });
```

## Step Types

- **planning**: Lập kế hoạch
- **generation**: Tạo nội dung/components
- **review**: Kiểm tra và review
- **execution**: Thực thi
- **completed**: Hoàn thành

## Status States

- **pending**: Chưa bắt đầu (màu xám)
- **running**: Đang chạy (màu xanh, có progress bar)
- **completed**: Hoàn thành (màu xanh lá)
- **failed**: Lỗi (màu đỏ)

## Integration với Existing Systems

### StreamingCommand Integration

Tích hợp với `StreamingCommand` để show execution steps từ streaming events:

```typescript
// Listen to streaming events
streamingEvents.forEach(event => {
  if (event.type === 'action') {
    processEvent({
      type: 'step_start',
      stepId: event.stepId,
      stepName: event.action,
    });
  }
});
```

### AgentExecutor Integration

Tích hợp với `AgentExecutor` để show agent execution steps:

```typescript
// When agent starts
processEvent({
  type: 'plan',
  plan: {
    steps: agentPlan.steps.map(step => ({
      id: step.id,
      name: step.name,
      type: 'execution',
    })),
  },
});
```

## Visual Features

1. **Progress Bars**: Show progress % khi step đang chạy
2. **Duration Tracking**: Hiển thị thời gian thực thi
3. **Error Display**: Hiển thị error messages khi step fail
4. **Animated Edges**: Edges animate khi step running
5. **Color Coding**: Màu sắc khác nhau cho mỗi status

## Next Steps

1. ✅ Basic execution steps visualization
2. ✅ Integration với Visual Workspace
3. ✅ Integration với StreamingCommand
4. ✅ Integration với AgentExecutor
5. ✅ Support parallel execution steps
6. ✅ Save/load execution history
7. ✅ Export execution reports

## Files Created

- `src/components/visual-workspace/ExecutionStepNodes.tsx`
- `src/hooks/useExecutionSteps.ts`
- Updated: `src/pages/VisualWorkspace.tsx`
- Updated: `src/components/visual-workspace/ComponentNodes.tsx`
- Updated: `src/components/visual-workspace/VisualCanvas.tsx`
