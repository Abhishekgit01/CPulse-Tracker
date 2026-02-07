# Enhance User Search Information Display

## Requirements
Update the search feature to display more comprehensive user information when searching for someone's account. The backend already provides extensive data that's not being fully utilized in the frontend. We need to extract more info and update the display to show richer profile details.

## Current State Analysis

### Backend Data Available (Services)

**Codeforces (`src/services/codeforces.ts`)** provides:
- Basic: `handle`, `rating`, `maxRating`, `rank`, `maxRank`
- Rich: `avatar`, `title`, `contribution`, `friendOfCount`, `organization`, `city`, `country`
- Activity: `lastOnlineTimeSeconds`, `registrationTimeSeconds`
- Enhanced: `totalSolved`, `contestsAttended`, `languages[]`, `recentSubmissions[]`

**LeetCode (`src/services/leetcode.ts`)** provides:
- Basic: `handle`, `totalSolved`, `easySolved`, `mediumSolved`, `hardSolved`
- Contest: `contestRating`, `globalRanking`, `topPercentage`, `contestsAttended`
- Rich: `avatar`, `reputation`, `streak`, `totalActiveDays`, `badges[]`
- Activity: `languages[]`, `topTags[]`, `recentSubmissions[]`, `skillTags[]`, `aboutMe`

**CodeChef (`src/services/codechef.ts`)** provides:
- Basic: `handle`, `rating`, `maxRating`, `stars`, `problemsSolved`
- Ranking: `globalRank`, `countryRank`
- Rich: `avatar`, `division`, `title`, `country`

**Enhanced Scraping (`src/services/enhancedScraping.ts`)** provides even MORE:
- Codeforces: `difficultyBreakdown`, `verdictBreakdown`, `languageBreakdown`, `tagBreakdown`, `acceptanceRate`, `averageSolvedDifficulty`, `lastAcceptedTime`, `contestHistory[]`
- LeetCode: `realName`, `company`, `school`, `acceptanceRate`, `activityStreak`, `recentAccepted[]`
- CodeChef: `difficultyBreakdown`, `institution`, `about`, `badges[]`

### Current Frontend Display (PersonalGrowth.tsx)

The `PersonalGrowth` component currently fetches from `/api/metrics/:platform/:username` which returns LIMITED data:
```javascript
{
  platform, handle, rating, maxRating, rank, maxRank,
  totalSolved, cpulseRating, history
}
```

The `UserStats` interface in PersonalGrowth.tsx supports more fields but they're NOT being populated by the metrics endpoint.

## Problem Identified

1. **Backend metrics endpoint** (`src/index.ts` lines 57-127) only returns minimal fields
2. **PersonalGrowth.tsx** has the UI components for rich data but receives limited data
3. **Enhanced scraping service** exists but isn't being used in the search flow
4. **UserSearch.tsx** just redirects - no preview/modal of user info

## Implementation Plan

### Phase 1: Expand Backend Metrics Endpoint
**File: `src/index.ts`**

Update the `/api/metrics/:platform/:username` endpoint to return comprehensive data:

1. For cached users (from DB), return all available fields from the User model
2. For fresh fetches, include the rich fields from service responses
3. Add new fields to the response object:
   - Codeforces: `avatar`, `title`, `contribution`, `friendOfCount`, `organization`, `country`, `totalSolved`, `contestsAttended`, `languages`, `recentSubmissions`
   - LeetCode: `avatar`, `contestRating`, `globalRanking`, `topPercentage`, `reputation`, `streak`, `totalActiveDays`, `badges`, `languages`, `topTags`, `recentSubmissions`
   - CodeChef: `avatar`, `division`, `country`, `title`

### Phase 2: Update User Model (Optional Enhancement)
**File: `src/models/User.ts`**

Add new fields to store enhanced data:
- `contestsAttended?: number`
- `streak?: number`
- `totalActiveDays?: number`
- `badges?: { name: string; icon?: string }[]`
- `languages?: { name: string; problemsSolved: number }[]`
- `topTags?: { tag: string; count: number }[]`
- `recentSubmissions?: { title: string; status: string; language: string; timestamp: string }[]`
- `registrationTimeSeconds?: number`
- `city?: string`

### Phase 3: Expand Frontend UserStats Interface
**File: `cpulse-frontend/src/components/PersonalGrowth.tsx`**

Update the `UserStats` interface to include:
```typescript
interface UserStats {
  // Existing fields...
  
  // New Enhanced Fields
  contestsAttended?: number;
  streak?: number;
  totalActiveDays?: number;
  badges?: { name: string; icon?: string }[];
  languages?: { name: string; problemsSolved: number }[];
  topTags?: { tag: string; count: number }[];
  recentSubmissions?: { title: string; status: string; language: string; timestamp: string; tags?: string[]; rating?: number }[];
  registrationTimeSeconds?: number;
  city?: string;
}
```

### Phase 4: Add New UI Sections to PersonalGrowth
**File: `cpulse-frontend/src/components/PersonalGrowth.tsx`**

Add new display sections:

1. **Language Statistics Section**
   - Bar chart or progress bars showing languages used
   - Number of problems solved per language

2. **Recent Activity Section**
   - List of recent submissions with status badges
   - Problem names, tags, and ratings

3. **Top Tags/Topics Section**
   - Visual representation of most solved topic areas
   - Helpful for understanding strengths

4. **Streak & Activity Section** (LeetCode specific)
   - Current streak display
   - Total active days
   - Badges earned

5. **Contest History Summary** (Codeforces)
   - Contests attended count
   - Average performance indicator

### Phase 5: Enhance CodeChef Stats Page
**File: `cpulse-frontend/src/components/EnhancedCodeChefStats.tsx`**

Update to use the enhanced scraping endpoint (`/api/detailed/codechef/:username`) instead of basic endpoint:
- Add difficulty breakdown display
- Show institution if available
- Display badges

### Phase 6: Optional - Add Search Preview Modal
**File: `cpulse-frontend/src/components/UserSearch.tsx`**

Consider adding a quick preview modal that shows basic stats before navigating:
- Fetch data on search
- Show mini-profile preview
- "View Full Profile" button to navigate

## File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/index.ts` | Modify | Expand metrics endpoint response |
| `src/models/User.ts` | Modify | Add new optional fields to schema |
| `cpulse-frontend/src/components/PersonalGrowth.tsx` | Modify | Add UserStats fields, new UI sections |
| `cpulse-frontend/src/components/EnhancedCodeChefStats.tsx` | Modify | Use enhanced endpoint, show more data |

## Implementation Order

1. **Backend First**: Update `src/index.ts` metrics endpoint (enables frontend changes)
2. **Model Schema**: Update `src/models/User.ts` to persist new fields
3. **Frontend Interface**: Update `PersonalGrowth.tsx` interface
4. **UI Components**: Add new display sections in `PersonalGrowth.tsx`
5. **CodeChef Page**: Update `EnhancedCodeChefStats.tsx`

## Testing Checklist

- [ ] Codeforces search returns all new fields
- [ ] LeetCode search returns all new fields  
- [ ] CodeChef search returns all new fields
- [ ] Languages section displays correctly
- [ ] Recent submissions section displays correctly
- [ ] Top tags section displays correctly (LeetCode)
- [ ] Streak displays correctly (LeetCode)
- [ ] Contest count displays correctly (Codeforces)
- [ ] Existing functionality unchanged
- [ ] Loading states work properly
- [ ] Error handling for missing data fields
