# ✅ END-TO-END TEST CHECKLIST - ADMIN IDEAS & PLANNING

## 🎯 Test Checklist cho Hệ Thống Ideas & Planning

---

## 📋 PRE-TEST SETUP

### 1. Database Migration
- [ ] Run migration: `supabase migration up`
- [ ] Verify tables created:
  - [ ] `admin_ideas`
  - [ ] `admin_planning_items`
  - [ ] `admin_idea_integrations`
- [ ] Check RLS policies enabled
- [ ] Verify indexes created

### 2. Environment Setup
- [ ] Supabase URL configured
- [ ] Supabase keys configured
- [ ] Admin user exists
- [ ] Admin role assigned to user

---

## 🧪 FUNCTIONAL TESTS

### 3. Routing & Navigation
- [ ] Navigate to `/admin/login` - Login page loads
- [ ] Login as admin user
- [ ] Navigate to `/admin` - Dashboard loads
- [ ] Click "💡 Ideas & Planning" in sidebar
- [ ] Navigate to `/admin/ideas` - Ideas page loads
- [ ] Verify menu item highlighted when active

### 4. Ideas Management

#### Create Idea
- [ ] Click "Quick Capture" button
- [ ] Dialog opens
- [ ] Enter title only - Save works
- [ ] Enter title + content - Save works
- [ ] Select category - Saves correctly
- [ ] Select priority - Saves correctly
- [ ] Select status - Saves correctly
- [ ] Click "Capture" - Idea saved
- [ ] Toast notification shows success
- [ ] Idea appears in list

#### View Ideas
- [ ] Ideas list displays
- [ ] Ideas show correct title
- [ ] Ideas show correct category badge
- [ ] Ideas show correct priority indicator
- [ ] Ideas show correct status icon
- [ ] Ideas show creation date

#### Edit Idea
- [ ] Click "Edit" on an idea
- [ ] Dialog opens with pre-filled data
- [ ] Modify title - Saves correctly
- [ ] Modify content - Saves correctly
- [ ] Change category - Saves correctly
- [ ] Change priority - Saves correctly
- [ ] Change status - Saves correctly
- [ ] Click "Update" - Changes saved
- [ ] Updated idea reflects changes

#### Delete Idea
- [ ] Click "Delete" on an idea
- [ ] Confirmation dialog appears
- [ ] Confirm deletion
- [ ] Idea removed from list
- [ ] Toast notification shows success

#### Filter & Search
- [ ] Enter search query - Filters results
- [ ] Select category filter - Filters correctly
- [ ] Select status filter - Filters correctly
- [ ] Select priority filter - Filters correctly
- [ ] Clear search - Shows all ideas
- [ ] Multiple filters work together

### 5. Planning Board

#### View Planning Board
- [ ] Click "Planning Board" tab
- [ ] Kanban board displays
- [ ] 4 columns visible: To Do, In Progress, Done, Cancelled
- [ ] Empty state shows when no items

#### Create Planning Item
- [ ] Click "Quick Add Task"
- [ ] Dialog opens
- [ ] Enter title - Required validation works
- [ ] Enter description - Optional
- [ ] Select due date - Saves correctly
- [ ] Select priority - Saves correctly
- [ ] Select status - Saves correctly
- [ ] Link to idea (optional) - Works
- [ ] Click "Add Task" - Item created
- [ ] Item appears in correct column

#### Manage Planning Items
- [ ] Item shows in correct status column
- [ ] Item shows priority indicator
- [ ] Item shows due date if set
- [ ] Click status change buttons - Status updates
- [ ] Click "Edit" - Opens edit dialog
- [ ] Modify item - Changes saved
- [ ] Click "Delete" - Item removed
- [ ] Item moves between columns correctly

---

## 🔍 UI/UX TESTS

### 6. Visual Design
- [ ] Layout responsive on mobile
- [ ] Layout responsive on tablet
- [ ] Layout responsive on desktop
- [ ] Colors match design system
- [ ] Icons display correctly
- [ ] Badges show correct colors
- [ ] Priority indicators visible
- [ ] Status icons correct

### 7. User Experience
- [ ] Loading states show during fetch
- [ ] Empty states show when no data
- [ ] Error messages display on failure
- [ ] Success toasts appear on actions
- [ ] Dialogs close on cancel
- [ ] Dialogs close on save
- [ ] Keyboard navigation works
- [ ] Focus states visible

---

## 🔒 SECURITY TESTS

### 8. Authentication & Authorization
- [ ] Non-admin users redirected from `/admin/ideas`
- [ ] Unauthenticated users redirected to login
- [ ] Admin users can access all features
- [ ] RLS prevents cross-user data access

### 9. Data Security
- [ ] Users can only see their own ideas
- [ ] Users can only edit their own ideas
- [ ] Users can only delete their own ideas
- [ ] Planning items isolated by user
- [ ] Integrations isolated by user

---

## 🔗 INTEGRATION TESTS

### 10. Export/Import
- [ ] Click "Export" button
- [ ] JSON file downloads
- [ ] File contains all ideas
- [ ] File format correct
- [ ] Import functionality (if implemented)

### 11. External Integrations
- [ ] Notion button visible
- [ ] Google Keep button visible
- [ ] Integration dialog opens
- [ ] API token input works
- [ ] Integration saves to database
- [ ] External link opens correctly

---

## 📊 PERFORMANCE TESTS

### 12. Load Performance
- [ ] Page loads in < 2 seconds
- [ ] Ideas load in < 1 second
- [ ] Planning items load in < 1 second
- [ ] Filter/search responds instantly
- [ ] No lag when switching tabs

### 13. Data Handling
- [ ] Handles 100+ ideas smoothly
- [ ] Handles 50+ planning items smoothly
- [ ] Search works with large datasets
- [ ] Filters work with large datasets

---

## 🐛 ERROR HANDLING

### 14. Error Scenarios
- [ ] Network error - Shows error message
- [ ] Invalid data - Shows validation error
- [ ] Missing required fields - Shows error
- [ ] Database error - Shows error message
- [ ] Unauthorized access - Redirects properly

---

## 📱 CROSS-BROWSER TESTS

### 15. Browser Compatibility
- [ ] Chrome - All features work
- [ ] Firefox - All features work
- [ ] Safari - All features work
- [ ] Edge - All features work

---

## ✅ FINAL VERIFICATION

### 16. Complete User Flow
- [ ] Login as admin
- [ ] Navigate to Ideas page
- [ ] Create 3 ideas with different priorities
- [ ] Create 2 planning items
- [ ] Link planning item to idea
- [ ] Filter ideas by category
- [ ] Search for specific idea
- [ ] Edit an idea
- [ ] Change planning item status
- [ ] Export ideas
- [ ] Delete an idea
- [ ] Logout and verify redirect

---

## 📝 TEST RESULTS

**Date:** _______________
**Tester:** _______________
**Environment:** _______________

**Total Tests:** _______________
**Passed:** _______________
**Failed:** _______________
**Skipped:** _______________

**Notes:**
_________________________________________________
_________________________________________________
_________________________________________________

---

## 🚀 QUICK TEST COMMANDS

```bash
# Run migration
supabase migration up

# Start dev server
npm run dev

# Run test script
npm run test:admin-ideas

# Check linting
npm run lint
```

---

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Failed

