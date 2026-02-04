# Vercel Deployment Guide

I have configured your project code to be compatible with Vercel. Since Vercel requires you to connect your GitHub account, you will need to perform the final deployment steps on their website.

## Prerequisites
1. **Push to GitHub**: Ensure all your latest changes (including the configuration files I just added) are pushed to your GitHub repository.

---

## Part 1: Deploying the Backend
Deploy the backend first so you can get the API URL needed for the frontend.

1. **Log in to Vercel** and click **"Add New..."** -> **"Project"**.
2. Import your `CPulse-Tracker` repository.
3. **Configure Project**:
   - **Project Name**: e.g., `cpulse-backend`
   - **Root Directory**: Leave as `./` (Root).
   - **Framework Preset**: Vercel should detect `Other` or `Node.js`. If prompted, `Other` is fine since we added `vercel.json`.
4. **Environment Variables**:
   Copy these from your local `.env` file and add them in the Vercel dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   *(Do not add PORT, Vercel handles it)*
5. Click **Deploy**.
6. **Get URL**: Once deployed, copy the domain (e.g., `https://cpulse-backend.vercel.app`).

---

## Part 2: Deploying the Frontend

1. Go back to Vercel Dashboard.
2. Click **"Add New..."** -> **"Project"**.
3. Import the **same** `CPulse-Tracker` repository again.
4. **Configure Project**:
   - **Project Name**: e.g., `cpulse-frontend`
   - **Root Directory**: Click "Edit" and select `cpulse-frontend`.
   - **Framework Preset**: Ensure it selects **Create React App**.
5. **Environment Variables**:
   Add the following variable to point to your new backend:
   - `REACT_APP_API_URL`: `https://your-backend-url.vercel.app` (Paste the URL from Part 1 here).
6. Click **Deploy**.

## Part 3: Final Verification
Once the frontend is deployed:
1. Open your new frontend URL.
2. Try to log in or view the leaderboard to verify it connects to the backend successfully.

---
**Note on specific files added:**
- `vercel.json`: Tells Vercel how to route traffic to your backend API.
- `api/index.ts`: The entry point for the "Serverless" version of your backend.
- `cpulse-frontend/src/api/axios.ts`: Updated to read the API URL from environment variables.
