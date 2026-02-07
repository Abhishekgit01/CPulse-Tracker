# College-Course Hierarchy System

## Requirements

Transform the existing class system into a hierarchical structure:
- **College** → **Courses** (two-level hierarchy)
- Only admins can create colleges
- Admins can assign "College Managers" who can create courses within their college
- Users request to join colleges/courses, which must be approved
- Users can join only ONE course within a college at a time

## Current State Analysis

### Existing Models
- `AuthUser` model has a simple `classId: string` field
- `User` model (CP profiles) also has `classId: string`
- No College/Course models exist yet

### Existing Routes
- `/auth/join-class` and `/auth/leave-class` - simple string-based class joining
- `/api/class/list`, `/api/class/:classId/stats`, `/api/class/:classId/ai-insights`
- Frontend `CollegeDashboard.tsx` shows class-based leaderboards

### Key Files to Modify
- Backend: `src/models/AuthUser.ts`, `src/routes/auth.ts`, `src/routes/class.ts`, `src/index.ts`
- Frontend: `cpulse-frontend/src/components/UserDashboard.tsx`, `cpulse-frontend/src/components/CollegeDashboard.tsx`
- New files needed: `src/models/College.ts`, `src/models/Course.ts`, `src/models/JoinRequest.ts`

---

## Implementation Phases

### Phase 1: Create Database Models

**1.1 Create College Model (`src/models/College.ts`)**
```typescript
// Fields:
// - name: string (unique, required)
// - code: string (unique, e.g., "MIT", "IITD")
// - description: string
// - createdBy: ObjectId (ref: AuthUser, admin who created)
// - managers: ObjectId[] (ref: AuthUser, users who can manage courses)
// - createdAt, updatedAt: timestamps
```

**1.2 Create Course Model (`src/models/Course.ts`)**
```typescript
// Fields:
// - name: string (e.g., "Computer Science 2024")
// - code: string (e.g., "CS-2024-A")
// - collegeId: ObjectId (ref: College, required)
// - description: string
// - createdBy: ObjectId (ref: AuthUser)
// - members: ObjectId[] (ref: AuthUser, approved members)
// - createdAt, updatedAt: timestamps
// Compound index: { collegeId: 1, code: 1 } unique
```

**1.3 Create JoinRequest Model (`src/models/JoinRequest.ts`)**
```typescript
// Fields:
// - userId: ObjectId (ref: AuthUser, required)
// - collegeId: ObjectId (ref: College, required)
// - courseId: ObjectId (ref: Course, optional - null = college-only request)
// - status: enum ['pending', 'approved', 'rejected']
// - requestedAt: Date
// - processedAt: Date
// - processedBy: ObjectId (ref: AuthUser)
// - message: string (optional request message)
```

**1.4 Update AuthUser Model (`src/models/AuthUser.ts`)**
```typescript
// Add fields:
// - role: enum ['user', 'manager', 'admin'] default 'user'
// - collegeId: ObjectId (ref: College, nullable)
// - courseId: ObjectId (ref: Course, nullable)
// Remove: classId (deprecated)
```

---

### Phase 2: Create Admin Account & Middleware

**2.1 Create Admin Middleware (`src/middleware/admin.ts`)**
- `requireAdmin` - checks if user has role 'admin'
- `requireManager` - checks if user has role 'manager' or 'admin'
- `requireCollegeManager(collegeId)` - checks if user can manage specific college

**2.2 Add Admin Seeder Script**
- Create initial admin account:
  - Email: `admin@cpulse.com`
  - Password: `CPulse@Admin2024` (hashed)
  - Role: `admin`

**2.3 Admin Routes (`src/routes/admin.ts`)**
- `POST /admin/users/:userId/role` - Set user role (admin only)
- `GET /admin/users` - List all users with roles

---

### Phase 3: College Management Routes

**3.1 Create College Routes (`src/routes/college.ts`)**

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/colleges` | Public | List all colleges |
| GET | `/api/colleges/:id` | Public | Get college details |
| POST | `/api/colleges` | Admin | Create new college |
| PUT | `/api/colleges/:id` | Admin | Update college |
| DELETE | `/api/colleges/:id` | Admin | Delete college |
| POST | `/api/colleges/:id/managers` | Admin | Add manager to college |
| DELETE | `/api/colleges/:id/managers/:userId` | Admin | Remove manager |

---

### Phase 4: Course Management Routes

**4.1 Create Course Routes (`src/routes/course.ts`)**

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/colleges/:collegeId/courses` | Public | List courses in college |
| GET | `/api/courses/:id` | Public | Get course details with members |
| POST | `/api/colleges/:collegeId/courses` | Manager/Admin | Create course |
| PUT | `/api/courses/:id` | Manager/Admin | Update course |
| DELETE | `/api/courses/:id` | Manager/Admin | Delete course |
| GET | `/api/courses/:id/leaderboard` | Member | Get course leaderboard |
| GET | `/api/courses/:id/stats` | Member | Get course statistics |

---

### Phase 5: Join Request System

**5.1 Create Join Request Routes (`src/routes/joinRequest.ts`)**

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/join-requests` | Auth | Create join request (college + course) |
| GET | `/api/join-requests/my` | Auth | Get user's pending requests |
| GET | `/api/join-requests/college/:collegeId` | Manager | List pending requests for college |
| POST | `/api/join-requests/:id/approve` | Manager | Approve request |
| POST | `/api/join-requests/:id/reject` | Manager | Reject request |
| DELETE | `/api/join-requests/:id` | Auth | Cancel own pending request |

**5.2 Join Request Flow**
1. User browses colleges → selects college → sees courses
2. User clicks "Request to Join" on a course
3. Creates JoinRequest with `collegeId` + `courseId`
4. College manager sees pending requests
5. Manager approves/rejects
6. On approval: User's `collegeId` and `courseId` are set

---

### Phase 6: Update Auth Routes

**6.1 Modify `/auth/me` response**
- Include populated college and course info
- Include role information

**6.2 Add Leave College/Course Routes**
- `POST /auth/leave-course` - Leave current course (stays in college)
- `POST /auth/leave-college` - Leave college entirely

**6.3 Update sanitizeUser function**
- Return `college`, `course`, `role` instead of `classId`

---

### Phase 7: Frontend - Types & Context

**7.1 Update Types (`cpulse-frontend/src/types.ts`)**
```typescript
interface College {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

interface Course {
  _id: string;
  name: string;
  code: string;
  collegeId: string;
  description?: string;
  memberCount?: number;
}

interface JoinRequest {
  _id: string;
  collegeId: string;
  courseId?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}
```

**7.2 Update AuthContext (`cpulse-frontend/src/context/AuthContext.tsx`)**
- Update `AuthUser` interface with `college`, `course`, `role`
- Remove `classId`

---

### Phase 8: Frontend - User Dashboard

**8.1 Update UserDashboard College Section**
Replace current class join/leave UI with:

1. **Not in College State:**
   - "Browse Colleges" button
   - Shows college browser modal/page

2. **In College, No Course State:**
   - Shows current college info
   - "Browse Courses" in this college
   - "Leave College" button

3. **In College + Course State:**
   - Shows college + course info
   - "View Course Leaderboard" link
   - "Leave Course" / "Leave College" buttons

4. **Pending Request State:**
   - Shows pending request status
   - "Cancel Request" button

---

### Phase 9: Frontend - College Browser

**9.1 Create CollegeBrowser Component**
- List all colleges with search
- Click college → show courses in that college
- Click course → "Request to Join" button
- Shows current request status if pending

**9.2 Update CollegeDashboard**
- Rename to show hierarchy: College → Course
- If user has course: show course leaderboard
- If manager: show management panel

---

### Phase 10: Frontend - Manager Panel

**10.1 Create ManagerPanel Component**
- Only visible to managers/admins
- Tabs: "Courses" | "Pending Requests" | "Members"
- **Courses Tab:** Create/edit/delete courses
- **Requests Tab:** Approve/reject join requests
- **Members Tab:** View/remove course members

---

### Phase 11: Admin Panel

**11.1 Create AdminPanel Component (Route: /admin)**
- Only accessible by admins
- **Colleges:** Create/edit/delete colleges
- **Managers:** Assign managers to colleges
- **Users:** View all users, change roles

---

### Phase 12: Migration & Cleanup

**12.1 Create Migration Script**
- Migrate existing `classId` data to new structure
- Create default college "General" for orphaned users
- Run as one-time admin script

**12.2 Remove Deprecated Code**
- Remove old `/auth/join-class`, `/auth/leave-class` routes
- Remove old `/api/class/*` routes (or redirect)
- Update User model to remove classId

---

## Database Schema Summary

```
AuthUser
├── email, password, displayName
├── role: 'user' | 'manager' | 'admin'
├── collegeId: ObjectId → College
└── courseId: ObjectId → Course

College
├── name, code, description
├── createdBy: ObjectId → AuthUser
└── managers: ObjectId[] → AuthUser[]

Course
├── name, code, description
├── collegeId: ObjectId → College
├── createdBy: ObjectId → AuthUser
└── members: ObjectId[] → AuthUser[]

JoinRequest
├── userId: ObjectId → AuthUser
├── collegeId: ObjectId → College
├── courseId: ObjectId → Course
├── status: 'pending' | 'approved' | 'rejected'
└── processedBy: ObjectId → AuthUser
```

---

## Admin Account Details

After implementation, the admin account will be:
- **Email:** `admin@cpulse.com`
- **Password:** `CPulse@Admin2024`
- **Role:** `admin`

(This will be created via a seeder script in Phase 2)

---

## API Summary

### Public Endpoints
- `GET /api/colleges` - List colleges
- `GET /api/colleges/:id` - College details
- `GET /api/colleges/:collegeId/courses` - List courses

### Authenticated Endpoints
- `POST /api/join-requests` - Request to join
- `GET /api/join-requests/my` - My requests
- `POST /auth/leave-course` - Leave course
- `POST /auth/leave-college` - Leave college

### Manager Endpoints
- `POST /api/colleges/:collegeId/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `GET /api/join-requests/college/:collegeId` - Pending requests
- `POST /api/join-requests/:id/approve` - Approve
- `POST /api/join-requests/:id/reject` - Reject

### Admin Endpoints
- `POST /api/colleges` - Create college
- `PUT /api/colleges/:id` - Update college
- `DELETE /api/colleges/:id` - Delete college
- `POST /api/colleges/:id/managers` - Add manager
- `POST /admin/users/:userId/role` - Set user role

---

## Estimated Effort

| Phase | Description | Est. Time |
|-------|-------------|-----------|
| 1 | Database Models | 30 min |
| 2 | Admin Account & Middleware | 20 min |
| 3 | College Routes | 30 min |
| 4 | Course Routes | 30 min |
| 5 | Join Request System | 45 min |
| 6 | Update Auth Routes | 20 min |
| 7 | Frontend Types & Context | 15 min |
| 8 | User Dashboard Update | 45 min |
| 9 | College Browser | 45 min |
| 10 | Manager Panel | 45 min |
| 11 | Admin Panel | 45 min |
| 12 | Migration & Cleanup | 30 min |

**Total Estimated:** ~6-7 hours

---

## Testing Checklist

- [ ] Admin can create colleges
- [ ] Admin can assign managers to colleges
- [ ] Managers can create courses in their college
- [ ] Users can browse colleges and courses
- [ ] Users can request to join a course
- [ ] Managers can approve/reject requests
- [ ] Approved users appear in course
- [ ] Users can leave course/college
- [ ] Users can only be in ONE course per college
- [ ] Course leaderboard shows members
- [ ] College dashboard shows all courses
