# AI-Powered Study Plan Generator

## Overview
Create a personalized weekly study plan feature that analyzes a user's competitive programming profile, identifies weak areas, and generates a structured practice roadmap with specific problems, topics, and daily goals.

## Requirements
- Generate personalized 7-day study plans based on user's skill gaps and rating goals
- Analyze user's submission history to identify weak topics (e.g., DP, Graphs, Trees)
- Provide daily tasks with specific problems from Codeforces/LeetCode
- Track progress on study plans with completion status
- Allow users to regenerate or customize their plans
- Support different intensity levels (Light, Moderate, Intensive)

## Current State Analysis

### Existing Features to Leverage
1. **User Profile Data** (`src/models/User.ts`) - Stores rating, totalSolved, history
2. **AI Integration** (`src/routes/ai.ts`) - Gemini API already configured
3. **Problem Recommendations** (`src/routes/recommend.ts`) - Logic for finding suitable problems
4. **Mastery Radar** (`MasteryRadar.tsx`) - Skill distribution analysis for Codeforces
5. **Personal Growth Page** (`PersonalGrowth.tsx`) - Displays user stats

### API Endpoints Available
- `/api/metrics/:platform/:handle` - User stats
- `/api/analysis/:platform/:handle` - AI profile analysis
- `/api/recommend/:handle/:rating` - Problem recommendations
- `/api/radar/:platform/:handle` - Skill radar data

## Technical Design

### New Backend Components

#### 1. Study Plan Model (`src/models/StudyPlan.ts`)
```typescript
interface DailyTask {
  day: number; // 1-7
  topic: string;
  problems: Array<{
    name: string;
    platform: 'codeforces' | 'leetcode' | 'codechef';
    link: string;
    difficulty: string;
    estimatedTime: number; // minutes
    completed: boolean;
  }>;
  theoryTip: string;
  completed: boolean;
}

interface StudyPlan {
  _id: string;
  userId: string;
  handle: string;
  platform: string;
  intensity: 'light' | 'moderate' | 'intensive';
  targetRating: number;
  focusAreas: string[];
  weeklyGoal: string;
  tasks: DailyTask[];
  createdAt: Date;
  expiresAt: Date;
  progress: number; // 0-100
  aiInsights: string;
}
```

#### 2. Study Plan API (`src/routes/studyPlan.ts`)
- `POST /api/study-plan/generate` - Generate new plan
- `GET /api/study-plan/:userId` - Get active plan
- `PATCH /api/study-plan/:planId/task/:day` - Mark task complete
- `DELETE /api/study-plan/:planId` - Delete/reset plan

#### 3. AI Plan Generation Logic
Use Gemini API to:
1. Analyze user's weak areas from radar data
2. Select appropriate topics for the week
3. Curate problems matching skill gaps
4. Generate daily theory tips and motivation

### New Frontend Components

#### 1. StudyPlanPage (`cpulse-frontend/src/components/StudyPlan.tsx`)
- Weekly calendar view
- Daily task cards with problem links
- Progress tracking bar
- Regenerate/customize options
- Intensity selector

#### 2. StudyPlanWidget (for Dashboard)
- Compact view showing today's tasks
- Quick progress indicator
- Link to full study plan

### UI/UX Design
- Glass-morphism card style matching existing UI
- Color-coded difficulty levels (green/amber/red)
- Animated progress bars
- Checklist interaction for completing tasks
- Streak/milestone celebrations

## Implementation Phases

### Phase 1: Backend Foundation
1. Create StudyPlan MongoDB model with schema
2. Build `/api/study-plan/generate` endpoint with Gemini integration
3. Implement problem selection logic combining radar data + recommendations
4. Add authentication middleware for user-specific plans

### Phase 2: Core Frontend Component
1. Create StudyPlan.tsx with weekly calendar layout
2. Build DailyTaskCard component with problem list
3. Implement plan generation form (intensity, target rating)
4. Add progress tracking state management

### Phase 3: Integration & Polish
1. Add StudyPlanWidget to UserDashboard
2. Create route in App.tsx for /study-plan
3. Add navigation link in navbar
4. Implement task completion API calls

### Phase 4: Enhancement
1. Add plan history/archive
2. Implement streak tracking for completed days
3. Add export to calendar (iCal) feature
4. Notification reminders (optional)

## API Contract

### Generate Study Plan
```
POST /api/study-plan/generate
Authorization: Bearer <token>
Body: {
  platform: "codeforces",
  handle: "username",
  intensity: "moderate",
  targetRating: 1600,
  focusAreas: ["dp", "graphs"] // optional
}
Response: {
  success: true,
  plan: StudyPlan
}
```

### Get Active Plan
```
GET /api/study-plan/active
Authorization: Bearer <token>
Response: {
  plan: StudyPlan | null
}
```

### Update Task Progress
```
PATCH /api/study-plan/:planId/task/:day/problem/:index
Authorization: Bearer <token>
Body: { completed: true }
Response: { success: true, progress: 42 }
```

## Gemini Prompt Design

```
You are an expert competitive programming coach creating a personalized 7-day study plan.

User Profile:
- Handle: {handle}
- Current Rating: {rating}
- Target Rating: {targetRating}
- Weak Areas: {weakAreas from radar}
- Intensity: {light/moderate/intensive}

Create a structured weekly plan with:
1. One focus topic per day
2. 2-4 problems per day (matching intensity)
3. Theory tips for each topic
4. Progressive difficulty through the week

Return as JSON:
{
  "weeklyGoal": "Summary of what user will achieve",
  "tasks": [
    {
      "day": 1,
      "topic": "Dynamic Programming - Basics",
      "problems": [...],
      "theoryTip": "Start by identifying overlapping subproblems..."
    }
  ],
  "aiInsights": "Personalized motivation and strategy"
}
```

## File Changes Summary

### New Files
- `src/models/StudyPlan.ts` - MongoDB model
- `src/routes/studyPlan.ts` - API routes
- `cpulse-frontend/src/components/StudyPlan.tsx` - Main page
- `cpulse-frontend/src/components/DailyTaskCard.tsx` - Task component
- `cpulse-frontend/src/components/StudyPlanWidget.tsx` - Dashboard widget

### Modified Files
- `src/index.ts` - Register new routes
- `cpulse-frontend/src/App.tsx` - Add route
- `cpulse-frontend/src/components/UserDashboard.tsx` - Add widget

## Success Metrics
- Users can generate a study plan in < 5 seconds
- Plan completion rate tracking
- Rating improvement correlation (long-term)

## Dependencies
- Existing Gemini API integration
- MongoDB for plan storage
- Authentication system (JWT)

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| Gemini rate limits | Cache generated plans, implement retry logic |
| Problem links becoming stale | Validate links periodically, fallback to search |
| User abandonment | Send reminder notifications, gamify with streaks |
