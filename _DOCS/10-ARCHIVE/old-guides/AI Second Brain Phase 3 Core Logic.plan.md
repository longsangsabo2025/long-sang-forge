# AI Second Brain - Phase 3: Core Logic Distillation

## Mục tiêu
Implement Core Logic Distillation System - tự động distill knowledge từ raw knowledge thành first principles, mental models, decision rules, và anti-patterns để tạo ra "Core Logic" cho mỗi domain.

## Database Enhancements

### 1. Core Logic Processing Queue
**File:** `supabase/migrations/brain/006_core_logic_queue.sql`
- `brain_core_logic_queue` table để track distillation jobs
- Status tracking (pending, processing, completed, failed)
- Priority và scheduling
- Retry logic

### 2. Core Logic Versioning
**File:** `supabase/migrations/brain/007_core_logic_versioning.sql`
- Enhance `brain_core_logic` table với versioning
- Add comparison functions
- Add rollback capabilities
- Track changes between versions

## Backend Services

### 3. Core Logic Distillation Service
**File:** `api/brain/services/core-logic-service.js`
- `distillCoreLogic(domainId)` - Main distillation function
- Extract first principles từ knowledge
- Identify mental models
- Generate decision rules
- Detect anti-patterns
- Cross-domain linking

### 4. Knowledge Analysis Service
**File:** `api/brain/services/knowledge-analysis-service.js`
- Analyze knowledge patterns
- Extract key concepts
- Identify relationships
- Generate summaries
- Topic modeling

### 5. Core Logic Query Service
**File:** `api/brain/services/core-logic-query-service.js`
- Query core logic by domain
- Search across core logic
- Compare versions
- Get insights from core logic

## Backend Routes

### 6. Core Logic Routes
**File:** `api/brain/routes/core-logic.js`
- `POST /api/brain/domains/:id/core-logic/distill` - Trigger distillation
- `GET /api/brain/domains/:id/core-logic` - Get core logic
- `GET /api/brain/domains/:id/core-logic/versions` - Get versions
- `POST /api/brain/domains/:id/core-logic/compare` - Compare versions
- `POST /api/brain/domains/:id/core-logic/rollback` - Rollback version

### 7. Knowledge Analysis Routes
**File:** `api/brain/routes/knowledge-analysis.js`
- `POST /api/brain/domains/:id/analyze` - Analyze domain knowledge
- `GET /api/brain/domains/:id/patterns` - Get knowledge patterns
- `GET /api/brain/domains/:id/concepts` - Get key concepts

## Frontend Types

### 8. Core Logic Types
**File:** `src/brain/types/core-logic.types.ts`
- `CoreLogic` - Core logic structure
- `FirstPrinciple` - First principle type
- `MentalModel` - Mental model type
- `DecisionRule` - Decision rule type
- `AntiPattern` - Anti-pattern type
- `CoreLogicVersion` - Version type
- `DistillationJob` - Job type

## Frontend Hooks

### 9. Core Logic Hooks
**File:** `src/brain/hooks/useCoreLogic.ts`
- `useCoreLogic(domainId)` - Get core logic
- `useDistillCoreLogic()` - Trigger distillation
- `useCoreLogicVersions(domainId)` - Get versions
- `useCompareVersions()` - Compare versions

### 10. Knowledge Analysis Hooks
**File:** `src/brain/hooks/useKnowledgeAnalysis.ts`
- `useAnalyzeDomain(domainId)` - Analyze domain
- `useKnowledgePatterns(domainId)` - Get patterns
- `useKeyConcepts(domainId)` - Get concepts

## Frontend Components

### 11. Core Logic Viewer Component
**File:** `src/brain/components/CoreLogicViewer.tsx`
- Display core logic structure
- Show first principles
- Show mental models
- Show decision rules
- Show anti-patterns
- Show cross-domain links

### 12. Core Logic Distillation Component
**File:** `src/brain/components/CoreLogicDistillation.tsx`
- Trigger distillation
- Show progress
- Show results
- Manage versions

### 13. Core Logic Comparison Component
**File:** `src/brain/components/CoreLogicComparison.tsx`
- Compare versions side-by-side
- Highlight changes
- Show diff
- Rollback interface

### 14. Knowledge Analysis Component
**File:** `src/brain/components/KnowledgeAnalysis.tsx`
- Show knowledge patterns
- Display key concepts
- Show relationships
- Visualize topics

### 15. Enhanced Domain View
**File:** `src/pages/DomainView.tsx` (Update)
- Add Core Logic tab
- Integrate distillation UI
- Show analysis results

## Integration

### 16. Update API Client
**File:** `src/brain/lib/services/brain-api.ts` (Update)
- Add core logic methods
- Add analysis methods
- Add versioning methods

### 17. Update Brain Dashboard
**File:** `src/pages/BrainDashboard.tsx` (Update)
- Add Core Logic overview
- Quick distillation trigger

## Background Processing

### 18. Distillation Worker
**File:** `api/brain/workers/distillation-worker.js`
- Background job processor
- Queue management
- Retry logic
- Error handling

### 19. Scheduled Distillation
**File:** `api/brain/jobs/scheduled-distillation.js`
- Cron job for auto-distillation
- Configurable schedule
- Domain selection logic

## Testing

### 20. Test Core Logic Distillation
- Test distillation process
- Test versioning
- Test comparison
- Test rollback

### 21. Test Knowledge Analysis
- Test pattern extraction
- Test concept identification
- Test relationship mapping

## Documentation

### 22. Update README
**File:** `src/brain/README.md` (Update)
- Add Phase 3 features
- Add core logic usage
- Add analysis documentation

## Implementation Order

1. **Database** (Steps 1-2)
   - Create queue table
   - Enhance versioning

2. **Backend Services** (Steps 3-5)
   - Distillation service
   - Analysis service
   - Query service

3. **Backend Routes** (Steps 6-7)
   - Core logic routes
   - Analysis routes

4. **Frontend Types & Hooks** (Steps 8-10)
   - Types
   - Hooks

5. **Frontend Components** (Steps 11-15)
   - Viewer
   - Distillation
   - Comparison
   - Analysis
   - Enhanced domain view

6. **Integration** (Steps 16-17)
   - Update API client
   - Update dashboard

7. **Background Processing** (Steps 18-19)
   - Worker
   - Scheduled jobs

8. **Testing** (Steps 20-21)
   - Test all features

9. **Documentation** (Step 22)
   - Update docs

## Success Criteria

- [ ] Core logic can be distilled from knowledge
- [ ] First principles are extracted accurately
- [ ] Mental models are identified
- [ ] Decision rules are generated
- [ ] Anti-patterns are detected
- [ ] Versioning works correctly
- [ ] Comparison shows meaningful diffs
- [ ] Rollback functions properly
- [ ] Analysis provides insights
- [ ] Background processing works reliably

## Estimated Time

- Database setup: 3-4 hours
- Backend services: 10-12 hours
- Backend routes: 4-5 hours
- Frontend types & hooks: 3-4 hours
- Frontend components: 12-15 hours
- Integration: 3-4 hours
- Background processing: 4-6 hours
- Testing: 4-6 hours
- Documentation: 2-3 hours
- **Total: 45-59 hours** (6-8 days)

