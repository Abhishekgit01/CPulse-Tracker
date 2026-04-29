# CPulse Tracker

CPulse Tracker is a full-stack competitive programming dashboard. It pulls profile and contest data from platforms like Codeforces, CodeChef, and LeetCode, stores normalized user data in MongoDB, and presents it through a React frontend with leaderboards, profile comparison, practice tracking, community posts, and AI-assisted analysis.

This repository contains both the backend API and the frontend app.

## What the project does

- Search users by competitive programming handle and save normalized profile data
- Show a unified leaderboard using the app's own CPulse rating
- Compare users across platforms
- Track contests, saved contests, and practice progress
- Provide college and course level dashboards
- Support community posts and public profiles
- Generate AI-assisted analysis and recommendations using Gemini

## Tech stack

- Frontend: React, TypeScript, React Router, Tailwind CSS, Recharts
- Backend: Node.js, Express, TypeScript
- Database: MongoDB with Mongoose
- AI: Google Gemini API
- Deployment: Vercel-ready config for both backend and frontend

## Repo structure

```text
.
├── api/                  # Vercel serverless entrypoint
├── src/                  # Express API, models, services, routes
├── cpulse-frontend/      # React frontend
├── vercel.json           # Root Vercel routing for backend
└── cpulse-frontend/vercel.json
```

## Main features in the current app

- Unified profile lookup for Codeforces, CodeChef, and LeetCode
- CPulse leaderboard
- College dashboard and manager/admin flows
- Public user profiles with rewards and customization
- Contest calendar and saved contests
- DSA practice and company problem pages
- Community feed and post details
- AI coach, radar, and performance analysis routes

## Local setup

### Prerequisites

- Node.js 18+
- MongoDB connection string
- Gemini API key

### 1. Clone and install

```bash
git clone https://github.com/Abhishekgit01/CPulse-Tracker.git
cd CPulse-Tracker
npm install
```

`npm install` at the repo root also installs frontend dependencies because of the root `postinstall` script.

### 2. Configure backend environment

Create a root `.env` file from `.env.example`.

```bash
cp .env.example .env
```

Set these values:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_here
MONGO_URI=your_mongodb_connection_string_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Configure frontend environment

Create `cpulse-frontend/.env` from `cpulse-frontend/.env.example`.

```bash
cp cpulse-frontend/.env.example cpulse-frontend/.env
```

For local development:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Run the backend

From the repo root:

```bash
npm run dev
```

The API starts on `http://localhost:5000`.

Helpful quick check:

```bash
curl http://localhost:5000/api/health
```

### 5. Run the frontend

In a second terminal:

```bash
cd cpulse-frontend
npm start
```

The frontend runs on `http://localhost:3000`.

## Available scripts

From the repo root:

```bash
npm run dev        # start backend with nodemon
npm run start      # start backend with ts-node
npm run compile    # TypeScript compile check for backend
npm run build      # frontend production build
```

From `cpulse-frontend/`:

```bash
npm start          # React dev server
npm run build      # production build
```

## Important project notes

- The backend connects to MongoDB lazily and reuses the connection.
- On a fresh database connection, seed logic runs from `src/services/seeder.ts`.
- The frontend uses `REACT_APP_API_URL` for all API requests.
- Vercel deployment support is already wired through `api/index.ts`, root `vercel.json`, and `cpulse-frontend/vercel.json`.

## Where to look in the code

- Backend entrypoint: `src/index.ts`
- Mongo connection: `src/db/mongo.ts`
- Scrapers and platform services: `src/services/`
- API routes: `src/routes/`
- Mongoose models: `src/models/`
- Frontend routing: `cpulse-frontend/src/App.tsx`
- Frontend API client: `cpulse-frontend/src/api/axios.ts`

## Current validation

The current codebase passes:

```bash
npm run compile
cd cpulse-frontend && npm run build
```

Both completed successfully.
