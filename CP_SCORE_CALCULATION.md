# 🎯 CP Score Calculation Guide

## How CP Score Works

CPulse calculates a **unified competitive programming score (CP Score)** by aggregating ratings from multiple platforms with weighted formulas.

### Formula Breakdown

#### 1. **Codeforces Score** (0-1200 points)
```
Rating Range: 0-3000+
Conversion: ((rating - 800) / 2700) × 1200 max
```
- Maps Codeforces rating to a 0-1200 point scale
- Minimum of 800 rating needed for positive points

#### 2. **CodeChef Score** (0-1200 points)
```
Rating Score: ((rating - 800) / 2700) × 1200
Stars Bonus: stars × 14 (up to 98 points for 7★)
Problems Score: (problemsSolved / 500) × 600
Total = Rating + Stars + Problems (capped at 1200)
```

#### 3. **LeetCode Score** (0-600 points)
```
Point Calculation:
- Easy: 1 point each
- Medium: 3 points each
- Hard: 7 points each

Conversion: (total_points / 3000) × 600 max
```

#### 4. **Activity Multiplier**
Based on last update time:
```
- 0-7 days: 1.05× (active bonus!)
- 8-30 days: 1.00× (normal)
- 31-90 days: 0.95× (slight penalty)
- 90+ days: 0.85× (significant penalty)
```

### Final CP Score
```
CP Score = (Skill Score + Consistency Score) × Activity Multiplier
```

---

## 📊 Recalculate CP Scores

If old accounts don't have CP scores calculated, run this endpoint:

### Step 1: Start Backend
```bash
cd /path/to/CPulse-Tracker
npm run dev
```

### Step 2: Recalculate All CP Scores
```bash
# Using cURL
curl -X POST http://localhost:5000/admin/recalculate-cp-scores

# Using fetch in browser console
fetch('http://localhost:5000/admin/recalculate-cp-scores', {
  method: 'POST'
}).then(r => r.json()).then(console.log)
```

### Response
```json
{
  "message": "Recalculated CP scores for 45 users",
  "totalUsers": 50,
  "updatedUsers": 45
}
```

---

## ⚡ How to Improve Your CP Score

### For **Codeforces** Users:
- Increase your Codeforces rating
- Each 50 rating points ≈ 9 CP points

### For **CodeChef** Users:
- Increase your CodeChef rating (main factor)
- Earn stars (7★ gives you 98 bonus points!)
- Solve more problems (each 500 = 600 CP points)

### For **LeetCode** Users:
- Solve hard problems (7 points each)
- Medium problems (3 points each)
- Easy problems (1 point each)
- Target: 500+ problems = 600 CP points

### For Everyone:
- **Stay active!** (5% bonus for activity within 7 days)
- Avoid inactive periods (reduces score by 15% after 90 days)

---

## 🔍 Example Calculations

### Example 1: CodeChef User
```
Handle: priya_sharma
Platform: CodeChef
Rating: 1200
Stars: 5 (🌟🌟🌟🌟🌟)
Problems Solved: 300
Last Updated: 5 days ago

Calculation:
- Rating Score: ((1200 - 800) / 2700) × 1200 = 178 points
- Stars Bonus: 5 × 14 = 70 points
- Problems Score: (300 / 500) × 600 = 360 points
- Subtotal: 178 + 70 + 360 = 608 points
- Activity Multiplier: 1.05 (last updated 5 days ago)
- Final CP Score: 608 × 1.05 = 638
```

### Example 2: Codeforces User  
```
Handle: tourist
Platform: Codeforces
Rating: 2450
Last Updated: 2 days ago

Calculation:
- Rating Score: ((2450 - 800) / 2700) × 1200 = 733 points
- Activity Multiplier: 1.05 (last updated 2 days ago)
- Final CP Score: 733 × 1.05 = 770
```

### Example 3: LeetCode User
```
Handle: john_smith
Platform: LeetCode
Easy Solved: 100
Medium Solved: 80
Hard Solved: 50
Last Updated: 10 days ago

Calculation:
- Point Calculation: (100×1) + (80×3) + (50×7) = 630 points
- Score: (630 / 3000) × 600 = 126 points
- Activity Multiplier: 1.00 (last updated 10 days ago)
- Final CP Score: 126 × 1.00 = 126
```

---

## 🐛 Troubleshooting

### "No users showing on leaderboard"
→ Run `/admin/recalculate-cp-scores` endpoint

### "Old accounts have 0 CP score"
→ Add them with `/user/search/{platform}/{username}` and CP score will auto-calculate

### "CP score seems too low"
→ Check when you last updated your profile
→ Inactive accounts lose points (up to 15%)
→ Update your profile on the original platform to refresh data

---

## 📈 CP Score Ranges

| Score | Level | Status |
|-------|-------|--------|
| 0 | New | Account just added |
| 1-100 | Beginner | Starting competitive programming |
| 101-300 | Intermediate | Solving problems regularly |
| 301-600 | Advanced | Strong across platforms |
| 600+ | Expert | Top-tier competitive programmer |
| 1000+ | Master | Legendary status 🏆 |

---

## 🔧 Manual CP Score Calculation

Want to calculate your CP score manually?

**Backend calculation function:**
```typescript
export function calculateCPulseRating(user: {
  rating?: number;              // Platform rating
  maxRating?: number;            // Max rating reached
  easySolved?: number;           // LeetCode easy
  mediumSolved?: number;         // LeetCode medium
  hardSolved?: number;           // LeetCode hard
  stars?: number;                // CodeChef stars
  problemsSolved?: number;       // CodeChef problems
  updatedAt?: Date;              // Last update time
}) {
  // Calculates CP score using weighted formula
  // See src/services/cpulseRating.ts
}
```

---

## Questions?

If CP scores aren't calculating correctly:
1. Run `/admin/recalculate-cp-scores` endpoint
2. Search your profile again to refresh data
3. Check `cpulseRating` field in database
4. View backend logs for calculation details

Good luck climbing the leaderboard! 🚀
