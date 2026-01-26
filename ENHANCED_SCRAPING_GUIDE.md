# 🚀 Enhanced Web Scraping & Data Collection

## Overview
CPulse-Tracker now includes **enhanced web scraping services** that extract comprehensive detailed data from competitive programming platforms.

---

## 📊 What's New

### 1. **Codeforces Enhanced**
#### New Data Points:
- ✅ **Contest History** - Complete contest participation with ratings, ranks, and changes
- ✅ **Problem Count** - Actual number of unique problems solved
- ✅ **Difficulty Breakdown** - Problems solved by difficulty level (800-2400+)
- ✅ **Submission Analytics** - Total submissions vs accepted submissions
- ✅ **Acceptance Rate** - Percentage of accepted submissions
- ✅ **Friends List** - Number of friends and friend details
- ✅ **Rating Trend** - Overall rating change over time
- ✅ **Last Online Time** - User activity timestamp

#### API Endpoints:
```
GET /api/detailed/codeforces/:handle
```

#### Example Response:
```json
{
  "handle": "tourist",
  "platform": "codeforces",
  "rating": 3850,
  "maxRating": 4029,
  "totalProblems": 2847,
  "totalSubmissions": 5234,
  "acceptedSubmissions": 2847,
  "acceptanceRate": "54.38",
  "difficultyBreakdown": {
    "veryEasy": 450,
    "easy": 680,
    "medium": 1020,
    "hard": 580,
    "veryHard": 117
  },
  "recentContests": [...],
  "contestHistory": [...]
}
```

---

### 2. **CodeChef Enhanced**
#### New Data Points:
- ✅ **Division & Stars** - User rank classification
- ✅ **Country Tracking** - User's country and country rank
- ✅ **Difficulty Breakdown** - Easy/Medium/Hard problem counts
- ✅ **Rating Trend** - Current vs highest rating comparison
- ✅ **Global Ranking** - Position in global leaderboard

#### API Endpoints:
```
GET /api/detailed/codechef/:username
```

#### Example Response:
```json
{
  "handle": "chef_ace",
  "platform": "codechef",
  "rating": 2547,
  "maxRating": 2890,
  "stars": 5,
  "division": "Div 1",
  "globalRank": 152,
  "countryRank": 23,
  "problemsSolved": 487,
  "difficultyBreakdown": {
    "easy": 234,
    "medium": 187,
    "hard": 66
  },
  "country": "India"
}
```

---

### 3. **LeetCode Enhanced**
#### New Data Points:
- ✅ **Acceptance Rates** - By difficulty level (Easy, Medium, Hard)
- ✅ **Contest Rating** - Competitive programming rating
- ✅ **Global Ranking** - Position in LeetCode rankings
- ✅ **Profile Information** - Real name, company, school, skills
- ✅ **Contest History** - Recent contests with ranks and performance
- ✅ **Skill Tags** - User's proficiency areas
- ✅ **Reputation** - Community contributions

#### API Endpoints:
```
GET /api/detailed/leetcode/:username
```

#### Example Response:
```json
{
  "handle": "user123",
  "platform": "leetcode",
  "totalSolved": 847,
  "easySolved": 234,
  "mediumSolved": 456,
  "hardSolved": 157,
  "acceptanceRate": {
    "easy": "92.5",
    "medium": "67.3",
    "hard": "45.2"
  },
  "contestRating": 2156,
  "globalRanking": 4532,
  "profile": {
    "realName": "John Doe",
    "company": "Google",
    "school": "MIT",
    "skillTags": ["Dynamic Programming", "Graphs", "Trees"],
    "countryName": "USA"
  }
}
```

---

## 🔌 API Endpoints

### Universal Endpoint
```
GET /api/detailed/:platform/:username
```

**Platforms:** `codeforces`, `codechef`, `leetcode`

**Example:**
```
GET /api/detailed/codeforces/tourist
GET /api/detailed/codechef/chef_ace
GET /api/detailed/leetcode/user123
```

---

### Comparison Endpoint
```
GET /api/detailed/compare/:platform1/:user1/:platform2/:user2
```

Compare two users from different platforms with automatic calculation of differences.

**Example:**
```
GET /api/detailed/compare/codeforces/tourist/leetcode/user123
```

**Response:**
```json
{
  "user1": { ...codeforces data... },
  "user2": { ...leetcode data... },
  "comparison": {
    "ratingDifference": 156,
    "globalRankingDifference": 1234,
    "problemsSolvedDifference": 89
  }
}
```

---

## 🛠️ Using Enhanced Data in Frontend

### Example: Display Difficulty Breakdown
```tsx
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis } from "recharts";

export function UserStats({ username }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/detailed/codeforces/${username}`)
      .then((res) => setData(res.data));
  }, [username]);

  if (!data) return <div>Loading...</div>;

  const chartData = [
    { difficulty: "Very Easy", count: data.difficultyBreakdown.veryEasy },
    { difficulty: "Easy", count: data.difficultyBreakdown.easy },
    { difficulty: "Medium", count: data.difficultyBreakdown.medium },
    { difficulty: "Hard", count: data.difficultyBreakdown.hard },
    { difficulty: "Very Hard", count: data.difficultyBreakdown.veryHard },
  ];

  return (
    <BarChart data={chartData}>
      <XAxis dataKey="difficulty" />
      <YAxis />
      <Bar dataKey="count" fill="#8884d8" />
    </BarChart>
  );
}
```

---

## 📈 Data Quality Improvements

### Better Parsing
- **Regex Patterns** - Multiple fallback patterns for each data point
- **HTML Selectors** - CSS selectors with fallbacks for structure changes
- **Error Handling** - Graceful degradation if data not found

### More Detailed Metrics
- **Contest History** - Track performance across multiple contests
- **Problem Breakdown** - Categorized by difficulty and type
- **Activity Tracking** - Last online, submission patterns
- **Social Stats** - Friends, followers, contributions

### Performance Optimizations
- **Caching** - Consider caching frequently accessed profiles
- **Parallel Requests** - Fetch multiple data points simultaneously
- **Timeout Handling** - 10-15 second timeouts prevent hanging

---

## 🚨 Error Handling

All endpoints return structured error responses:

```json
{
  "error": "User not found"
}
```

**Common Errors:**
- `"User not found"` - Username doesn't exist on platform
- `"Failed to fetch data"` - Network/timeout issue
- `"Invalid platform"` - Platform not supported

---

## 🔄 Integrating with Existing Code

The enhanced services complement existing functionality:

**Before (Basic):**
```typescript
const user = await getCodeChefUser("username");
// Returns: { handle, rating, stars, problems }
```

**After (Enhanced):**
```typescript
const user = await getCodeChefEnhanced("username");
// Returns: { ...basic + difficultyBreakdown, country, division, trends }
```

---

## 📋 Migration Guide

To use enhanced data in your components:

### Step 1: Import Enhanced Service
```typescript
import { getDetailedProfile } from "../services/enhancedScraping";
```

### Step 2: Fetch Enhanced Data
```typescript
const profile = await getDetailedProfile(username, "codeforces");
```

### Step 3: Display Rich Data
```tsx
<div>
  <p>Rating: {profile.rating}</p>
  <p>Problems Solved: {profile.totalProblems}</p>
  <p>Acceptance Rate: {profile.acceptanceRate}%</p>
  <DifficultyChart data={profile.difficultyBreakdown} />
</div>
```

---

## 🎯 Use Cases

### 1. **Advanced User Profile**
Display comprehensive profile with all difficulty breakdowns and activity history

### 2. **Smart Recommendations**
Recommend problems based on user's weak areas using difficulty breakdown

### 3. **Detailed Comparisons**
Compare users across multiple metrics for leaderboards and competitions

### 4. **Analytics Dashboard**
Create detailed charts showing user performance trends over time

### 5. **Growth Tracking**
Monitor contest participation history and rating trends

---

## 🔐 Rate Limiting

To avoid being blocked by platforms:
- Implement request throttling
- Cache results for 1-2 hours
- Add random delays between requests
- Rotate User-Agent headers

---

## 📚 Summary

The enhanced web scraping system provides:
- ✅ **More detailed data** from all three platforms
- ✅ **Better error handling** with graceful degradation
- ✅ **Rich analytics** for user performance tracking
- ✅ **Easy integration** with existing components
- ✅ **Flexible API** for various use cases

Happy coding! 🚀
