# CPulse Tracker

**CPulse Tracker** is a high-performance, unified platform for competitive programmers to track their progress, analyze performance metrics, and stay updated with global contests across Codeforces, CodeChef, and LeetCode.

## Key Features

-   **Unified Metrics**: Aggregated performance data from Codeforces, CodeChef, and LeetCode in a single dashboard.
-   **Advanced Analytics**: Detailed growth tracking and platform-specific performance insights.
-   **Contest Calendar**: Real-time updates on upcoming competitive programming contests.
-   **Institutional Insights**: Class-level performance monitoring and collective growth analysis.
-   **AI Integration**: Integrated coaching assistance and performance reports powered by Google Gemini 2.0 Flash.

## Architecture

The project is built with a modern full-stack architecture:

-   **Frontend**: React configured with TypeScript and TailwindCSS, utilizing a modular component architecture.
-   **Backend**: Scalable Node.js / Express server implemented in TypeScript.
-   **Database**: MongoDB for persistent user data and performance history.
-   **AI Engine**: Google Gemini 2.0 Flash REST integration for intelligent analytics and coaching.

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   MongoDB
-   Google Gemini API Key

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Abhishekgit01/CPulse-Tracker.git
    cd CPulse-Tracker
    ```

2.  **Backend Setup**:
    ```bash
    npm install
    cp .env.example .env
    # Edit .env with your MONGO_URI and GEMINI_API_KEY
    npm run dev
    ```

3.  **Frontend Setup**:
    ```bash
    cd cpulse-frontend
    npm install
    npm start
    ```

## Environment Variables

Ensure the following variables are configured in your `.env` file:

-   `PORT`: Backend server port (defaults to 5000).
-   `MONGO_URI`: MongoDB connection string.
-   `GEMINI_API_KEY`: Google Generative AI API Key.
-   `JWT_SECRET`: Secret key for authentication.

## Deployment

The platform is optimized for deployment on **Vercel**. Configuration is provided in the root `vercel.json` and `cpulse-frontend/vercel.json` for seamless API routing and SPA support.

---
*Developed for the global competitive programming community.*