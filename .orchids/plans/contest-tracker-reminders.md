# Contest Tracker & Participation History

## Overview
A feature to track users' contest participation history and allow them to set reminders for upcoming contests. This provides insights into contest performance trends and helps users never miss important contests.

## Requirements
- Display contest participation history for each platform (Codeforces, CodeChef, LeetCode)
- Allow users to bookmark/save upcoming contests they want to participate in
- Show participation statistics (contests attended, best rank, rating changes)
- Track rating changes per contest with visualizations
- Store saved contests in user's dashboard for easy access
- No AI API required - uses existing platform APIs and local storage/database

## Technical Approach

### Backend Changes

1. **New Model: SavedContest** - Store user's bookmarked contests
2. **New Route: /api/contests/saved** - CRUD for saved contests
3. **New Route: /api/contests/history/:platform/:handle** - Fetch contest history
4. **Enhance existing Contest model** - Add participation tracking

### Frontend Changes

1. **New Component: ContestHistory** - Display past contest performance
2. **Enhance ContestCalendar** - Add bookmark/save functionality
3. **New Component: ContestStats** - Show aggregated contest statistics
4. **Update UserDashboard** - Add saved contests section

## Implementation Phases

### Phase 1: Backend - Saved Contests Model & Routes
Create the database model and API routes for saving/bookmarking contests:

**File: `src/models/SavedContest.ts`**
```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface ISavedContest extends Document {
  userId: mongoose.Types.ObjectId;  // Reference to AuthUser
  contestId: string;                // Original contest ID
  platform: "codeforces" | "codechef" | "leetcode";
  name: string;
  startTime: Date;
  duration: number;
  url: string;
  reminded: boolean;                // Whether reminder was shown
  participated: boolean;            // Did user actually participate
  createdAt: Date;
}

const SavedContestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "AuthUser", required: true },
  contestId: { type: String, required: true },
  platform: { type: String, enum: ["codeforces", "codechef", "leetcode"], required: true },
  name: { type: String, required: true },
  startTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  url: { type: String, required: true },
  reminded: { type: Boolean, default: false },
  participated: { type: Boolean, default: false },
}, { timestamps: true });

SavedContestSchema.index({ userId: 1, contestId: 1 }, { unique: true });

export const SavedContest = mongoose.model<ISavedContest>("SavedContest", SavedContestSchema);
```

**File: `src/routes/savedContests.ts`**
- GET `/api/contests/saved` - Get user's saved contests
- POST `/api/contests/saved` - Save a contest
- DELETE `/api/contests/saved/:id` - Remove saved contest
- PATCH `/api/contests/saved/:id/participated` - Mark as participated

### Phase 2: Backend - Contest History API
Create routes to fetch contest participation history from platform APIs:

**File: `src/routes/contestHistory.ts`**
- GET `/api/contests/history/codeforces/:handle` - Fetch Codeforces rating changes
- GET `/api/contests/history/codechef/:handle` - Fetch CodeChef contest history
- GET `/api/contests/history/leetcode/:handle` - Fetch LeetCode contest history

**Codeforces Implementation:**
```typescript
// Uses existing API: https://codeforces.com/api/user.rating?handle={handle}
// Returns: contestId, contestName, rank, oldRating, newRating, ratingUpdateTimeSeconds
```

**CodeChef Implementation:**
```typescript
// Scrape from profile page or use existing data in User model
// Extract rating history from the history field
```

**LeetCode Implementation:**
```typescript
// Use GraphQL API to fetch contest ranking history
// Query: userContestRankingHistory
```

### Phase 3: Frontend - Contest History Component
Create a component to display contest participation history with charts:

**File: `cpulse-frontend/src/components/ContestHistory.tsx`**

Features:
- Table view of all contests participated
- Rating change chart (line graph)
- Filter by platform
- Sort by date/rating change/rank
- Statistics summary (total contests, best rank, biggest gain/loss)

```tsx
interface ContestHistoryEntry {
  contestId: string;
  contestName: string;
  platform: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  date: string;
}

// Display as:
// - Sortable table with columns: Date, Contest, Rank, Rating Change, New Rating
// - Line chart showing rating progression
// - Stats cards: Total Contests, Best Rank, Avg Rating Change, Current Streak
```

### Phase 4: Frontend - Enhance ContestCalendar with Bookmarking
Add ability to save/bookmark contests from the calendar:

**Modifications to `ContestCalendar.tsx`:**
- Add bookmark icon to each ContestCard
- Show "Saved" badge on bookmarked contests
- Add "My Contests" filter to show only saved contests
- Toast notification when contest is saved/removed

**Modifications to `ContestCard.tsx`:**
```tsx
// Add props:
interface ContestCardProps {
  contest: Contest;
  isSaved?: boolean;
  onSave?: (contest: Contest) => void;
  onRemove?: (contestId: string) => void;
}

// Add bookmark button with filled/outline state
```

### Phase 5: Frontend - Contest Stats Dashboard Widget
Add contest statistics to the UserDashboard:

**New section in `UserDashboard.tsx`:**
- Upcoming saved contests (next 3)
- Recent contest performance summary
- Quick stats: contests this month, rating trend
- Link to full Contest History page

### Phase 6: Frontend - New Route & Navigation
Add the Contest History page to the app:

**Modifications to `App.tsx`:**
```tsx
// Add new route:
<Route path="/contest-history" element={<ContestHistory />} />
<Route path="/contest-history/:platform/:handle" element={<ContestHistory />} />
```

**Modifications to navigation:**
- Add "History" sub-link under Contests or in user dropdown
- Add quick access from PersonalGrowth profile page

## Data Flow

```
User clicks "Save Contest" on ContestCard
    ↓
POST /api/contests/saved (with auth token)
    ↓
SavedContest created in MongoDB
    ↓
UserDashboard fetches saved contests
    ↓
Shows in "My Upcoming Contests" widget

User visits Contest History page
    ↓
GET /api/contests/history/:platform/:handle
    ↓
Backend fetches from platform API (Codeforces/CodeChef/LeetCode)
    ↓
Returns formatted contest history
    ↓
Frontend displays in table + chart
```

## UI/UX Design

### ContestCard Enhancement
```
┌─────────────────────────────────────────┐
│  [Platform Badge]              [★ Save] │
│  Contest Name                           │
│  ────────────────────────────────────── │
│  📅 Feb 15, 2026 • 8:00 PM             │
│  ⏱️ 2 hours                             │
│  ────────────────────────────────────── │
│  [Register →]                           │
└─────────────────────────────────────────┘
```

### Contest History Table
```
┌──────────┬────────────────────┬──────┬────────┬─────────┐
│ Date     │ Contest            │ Rank │ Change │ Rating  │
├──────────┼────────────────────┼──────┼────────┼─────────┤
│ Feb 10   │ CF Round #920      │ 1234 │ +45    │ 1567    │
│ Feb 3    │ CF Round #919      │ 2341 │ -23    │ 1522    │
│ Jan 27   │ Educational #161   │ 891  │ +67    │ 1545    │
└──────────┴────────────────────┴──────┴────────┴─────────┘
```

### Stats Cards
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ 47          │ │ #234        │ │ +127        │ │ 5           │
│ Contests    │ │ Best Rank   │ │ Best Gain   │ │ Streak      │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

## Files to Create/Modify

### New Files
1. `src/models/SavedContest.ts` - MongoDB model
2. `src/routes/savedContests.ts` - CRUD routes for saved contests
3. `src/routes/contestHistory.ts` - Platform contest history routes
4. `cpulse-frontend/src/components/ContestHistory.tsx` - History page

### Modified Files
1. `src/index.ts` - Register new routes
2. `cpulse-frontend/src/components/ContestCard.tsx` - Add bookmark button
3. `cpulse-frontend/src/components/ContestCalendar.tsx` - Add save functionality
4. `cpulse-frontend/src/components/UserDashboard.tsx` - Add contests widget
5. `cpulse-frontend/src/App.tsx` - Add new route

## Dependencies
- No new npm packages required
- Uses existing: recharts, lucide-react, axios
- Uses existing authentication middleware

## Estimated Effort
- Phase 1: 1 hour (Backend model + routes)
- Phase 2: 1.5 hours (Contest history API)
- Phase 3: 2 hours (Contest History component)
- Phase 4: 1 hour (ContestCard/Calendar enhancements)
- Phase 5: 1 hour (Dashboard widget)
- Phase 6: 0.5 hours (Routing + navigation)

**Total: ~7 hours**

## Future Enhancements (Out of Scope)
- Browser push notifications for reminders
- Email notifications before contests
- Calendar export (iCal/Google Calendar)
- Contest difficulty prediction based on past performance
