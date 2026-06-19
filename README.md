# Syntiq — AI-Powered Coding Practice Platform

<div align="center">

![Syntiq Banner](https://img.shields.io/badge/Syntiq-AI%20Coding%20Platform-6366f1?style=for-the-badge&logo=code&logoColor=white)

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)

**Code Smarter. Level Up Faster.**

*Syntiq pairs you with real-time AI feedback, automated code analysis, and competitive live contests to accelerate your technical interview preparation.*

🌍 **Live Platform:** [https://syntiq-coding-platfrom.vercel.app](https://syntiq-coding-platfrom.vercel.app)  
⚙️ **Backend API:** [https://syntiq-coding-platfrom.onrender.com](https://syntiq-coding-platfrom.onrender.com)

[🚀 Start Practicing](#getting-started) · [📖 API Docs](#api-reference) · [🤝 Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Pages & Routes](#pages--routes)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Syntiq** is a full-stack competitive coding platform designed to help developers accelerate their technical interview preparation. It combines a curated problem set with AI-driven tools, live coding contests, gamified progression (XP, levels, streaks), and detailed skill analytics — all wrapped in a sleek, modern dark-themed UI.

Think of it as LeetCode meets an AI tutor — purpose-built for serious interview prep.

---

## ✨ Features

### 🤖 AI-Powered Tools (Google Gemini)
- **AI Hints System** — Get up to 3 progressive hints (conceptual → algorithmic → pseudo-code) when you're stuck, without spoiling the solution
- **AI Code Analyzer** — Receive instant complexity evaluation (Time & Space), anomaly detection, corner case identification, and optimization tips
- Powered by **Google Gemini Flash** (`gemini-flash-latest`) for fast, contextual responses

### 💻 Code Execution Engine
- **Run & Submit** actions with real-time test case evaluation
- Sandboxed JavaScript execution via Node.js `vm` module with a 1-second timeout guard (prevents infinite loops)
- Simulated multi-language support (Python, Java, C++, etc.) for a realistic multi-language experience
- Automatic status classification: `Accepted`, `Wrong Answer`, `Time Limit Exceeded`, `Runtime Error`
- Execution time and memory usage reporting per submission

### 🏆 Contests
- Browse and join live timed coding contests
- Ranked contest participation with real-time leaderboard updates
- Contest history and detailed result breakdowns per participant

### 📊 Gamification & Progress
- **XP & Leveling** — Earn XP per accepted submission (Easy: +10, Medium: +20, Hard: +30); level up every 100 XP
- **Daily Streaks** — Track consecutive days of accepted submissions
- **Skill Radar** — Visual breakdown of your proficiency across topics (Arrays, Strings, DP, Trees, Graphs, Sorting)
- **Leaderboard** — Platform-wide ranking of top coders by XP and solved count

### 👤 User Profiles
- Public profile pages per user (`/profile/:username`)
- Submission history, solved problem breakdown by difficulty, skill progress
- GitHub-style activity visualization

### 🛡️ Authentication
- JWT-based authentication with a 7-day token expiry
- Secure password hashing with `bcryptjs`
- Persistent login via `localStorage` with backend token validation on load

### 🔧 Admin Panel
- Admin-only route to add and manage coding problems (`/admin/add-problem`)
- Full problem configuration: title, description, difficulty, category, test cases, starter code

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19 | UI component framework |
| **Vite** | 8 | Build tool & dev server |
| **React Router DOM** | 7 | Client-side routing |
| **TailwindCSS** | 4 | Utility-first CSS styling |
| **Lucide React** | 1.17 | Icon library |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | LTS | Runtime environment |
| **Express** | 4 | REST API framework |
| **Supabase JS** | 2 | Database client (PostgreSQL via Supabase) |
| **@google/generative-ai** | 0.24 | Google Gemini AI integration |
| **jsonwebtoken** | 9 | JWT authentication |
| **bcryptjs** | 2 | Password hashing |
| **cors** | 2 | Cross-origin request handling |
| **dotenv** | 16 | Environment variable management |
| **nodemon** | 3 | Dev auto-restart |

### Database & Infrastructure

| Service | Purpose |
|---|---|
| **Supabase (PostgreSQL)** | Primary database — users/profiles, problems, submissions, contests |
| **Google Gemini AI** | AI hint generation & code analysis |
| **Vercel** | Frontend deployment (`vercel.json` included) |

### Code Execution

| Component | Details |
|---|---|
| **Judge0** | Robust, sandboxed code execution engine running via Docker |
| **Timeout guard** | Configurable execution limits to prevent infinite loops |
| **Multi-language** | Full support for JavaScript, Python, C++, and Java execution |

---

## 📁 Project Structure

```
Syntiq-Coding-Platform/
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigation bar with auth state
│   │   │   └── Footer.jsx      # Site footer
│   │   ├── pages/
│   │   │   ├── Landing.jsx     # Hero/landing page
│   │   │   ├── Login.jsx       # User login
│   │   │   ├── Signup.jsx      # User registration
│   │   │   ├── Dashboard.jsx   # Problems list & filters
│   │   │   ├── ProblemDetail.jsx # Code editor + AI tools
│   │   │   ├── Contests.jsx    # Contest browser
│   │   │   ├── ContestDetail.jsx # Live contest view
│   │   │   ├── Leaderboard.jsx # Platform leaderboard
│   │   │   ├── Profile.jsx     # User public profile
│   │   │   └── AdminAddProblem.jsx # Admin: add problems
│   │   ├── App.jsx             # Root component & routing
│   │   ├── config.js           # API base URL config
│   │   ├── main.jsx            # Entry point
│   │   ├── App.css             # Global app styles
│   │   └── index.css           # Base CSS & design tokens
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json             # Vercel SPA routing config
│   └── package.json
│
├── backend/                    # Express REST API
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js       # Register, login, /me
│   │   │   ├── problemController.js    # CRUD for problems
│   │   │   ├── submissionController.js # Run/submit code + XP/streak logic
│   │   │   ├── contestController.js    # Contest management
│   │   │   ├── userController.js       # Profile & leaderboard
│   │   │   └── aiController.js         # Gemini AI hints & analysis
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── problems.js
│   │   │   ├── submissions.js
│   │   │   ├── contests.js
│   │   │   ├── users.js
│   │   │   └── ai.js
│   │   ├── middleware/         # Auth middleware (JWT verify)
│   │   ├── utils/
│   │   │   ├── codeRunner.js   # Sandboxed JS execution engine
│   │   │   └── supabase.js     # Supabase client initialization
│   │   └── index.js            # Express app entry point
│   ├── seedProblem.js          # DB seed script
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- **Docker Desktop** (Required for the Judge0 code execution engine)
- A **Supabase** project (free tier works fine)
- A **Google Gemini API Key** (get one at [ai.google.dev](https://ai.google.dev))

### 1. Clone the Repository

```bash
git clone https://github.com/Shivamchouhan7/Syntiq-Coding-Platfrom.git
cd Syntiq-Coding-Platfrom
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your credentials (see [Environment Variables](#environment-variables) below), then start the dev server:

```bash
npm run dev
```

The backend will start on `http://localhost:5000`.

### 3. Set Up Judge0 (Code Execution Engine)

This platform uses Judge0 running in Docker containers to safely execute user code.

Open a new terminal:

```bash
cd judge0/judge0-v1.13.1
docker-compose up -d
```

This will spin up the Judge0 API, workers, Redis, and PostgreSQL instances required for code execution.

### 4. Set Up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE=http://localhost:5000/api
```

Start the frontend dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port for the Express server | `5000` |
| `JWT_SECRET` | Secret key for signing JWTs | `your_super_secret_key` |
| `JWT_EXPIRES_IN` | JWT token expiry duration | `7d` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `NODE_ENV` | Environment mode | `development` |
| `SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (keep secret!) | `eyJ...` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE` | Backend API base URL | `http://localhost:5000/api` |

---

## 📡 API Reference

All API routes are prefixed with `/api`.

### Auth — `/api/auth`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Register a new user |
| `POST` | `/login` | ❌ | Login and receive JWT |
| `GET` | `/me` | ✅ | Get current authenticated user |

### Problems — `/api/problems`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/` | ❌ | Get all problems (with filters) |
| `GET` | `/:id` | ❌ | Get problem by ID |
| `POST` | `/` | ✅ (Admin) | Create a new problem |

### Submissions — `/api/submissions`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/` | ✅ | Run or submit code against test cases |
| `GET` | `/` | ✅ | Get submission history (filter by `?problemId=`) |
| `GET` | `/:id` | ✅ | Get a specific submission by ID |

### AI — `/api/ai`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/analyze` | ✅ | Analyze code (complexity, bugs, optimizations) |
| `POST` | `/hint` | ✅ | Get a progressive hint (level 1–3) |

### Contests — `/api/contests`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/` | ❌ | List all contests |
| `GET` | `/:id` | ❌ | Get contest details |
| `POST` | `/:id/join` | ✅ | Join a contest |

### Users — `/api/users`

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/leaderboard` | ❌ | Get top users by XP |
| `GET` | `/:username` | ❌ | Get public user profile |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns server status and version |

---

## 🗺️ Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero page with feature overview and stats |
| `/login` | Login | JWT-based user authentication |
| `/signup` | Signup | New user registration |
| `/dashboard` | Dashboard | Browse and filter all problems |
| `/problem/:id` | ProblemDetail | Code editor, run/submit, AI hints & analysis |
| `/contests` | Contests | Browse upcoming and past contests |
| `/contest/:id` | ContestDetail | Compete in a specific contest |
| `/leaderboard` | Leaderboard | Platform-wide ranking table |
| `/profile/:username` | Profile | Public user profile with stats and history |
| `/admin/add-problem` | AdminAddProblem | Admin panel to add new problems |

---

## 📚 Adding New Problems

When adding a new problem to the database, it **must** include specific Judge0 metadata for the code execution engine to dynamically generate test drivers.

Required JSON metadata fields in the `problems` table:
- `functionName` (String): e.g., `"twoSum"`
- `returnType` (String): e.g., `"vector<int>"`
- `parameters` (JSON Array): `[{"name": "nums", "type": "vector<int>"}, {"name": "target", "type": "int"}]`
- `visibleTestCases` (JSON Array): `[{"input": "[2,7,11,15]\n9", "expectedOutput": "[0,1]"}]`
- `hiddenTestCases` (JSON Array): Same format as `visibleTestCases`

*Note: Currently, only problems that **return** a value are supported out-of-the-box. Problems requiring in-place memory modifications or custom data structures (like Linked Lists/Trees) require upgrading the execution engine infrastructure.*

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow conventional commit messages and keep PRs focused.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ by [Shivam Chouhan](https://github.com/Shivamchouhan7)

⭐ Star this repo if you found it helpful!

</div>
