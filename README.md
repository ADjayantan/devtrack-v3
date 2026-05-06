# DevTrack — Developer Learning Tracker

A full-stack developer progress dashboard. Track daily learning logs, build streaks, manage roadmaps, and visualize your weekly activity.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS      |
| Routing    | React Router v6                     |
| Backend    | Node.js + Express                   |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT + bcryptjs                      |
| HTTP       | Axios                               |

---

## Project Structure

```
devtrack/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Route-level page components
│       ├── context/         # Auth global state
│       ├── services/        # API call functions
│       ├── hooks/           # Custom React hooks
│       └── utils/           # Date & chart helpers
├── server/                  # Express backend
│   ├── controllers/         # Business logic
│   ├── routes/              # Express routers
│   ├── models/              # Mongoose schemas
│   ├── middleware/          # Auth + error handler
│   ├── config/              # MongoDB connection
│   └── utils/               # Input validators
├── .env.example             # Environment variable template
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd devtrack

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure environment

```bash
cd ..  # back to devtrack root
cp .env.example .env
```

Edit `.env` with:
- Your MongoDB connection string (`MONGO_URI`)
- A strong `JWT_SECRET` (use `openssl rand -base64 32`)

### 3. Run locally

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# App starts at http://localhost:5173
```

---

## API Reference

### Auth
| Method | Endpoint             | Body                        | Auth |
|--------|---------------------|-----------------------------|------|
| POST   | /api/auth/register  | name, email, password       | No   |
| POST   | /api/auth/login     | email, password             | No   |
| GET    | /api/auth/me        | —                           | Yes  |

### Daily Logs
| Method | Endpoint        | Description         | Auth |
|--------|----------------|---------------------|------|
| GET    | /api/logs       | Get all logs + stats| Yes  |
| POST   | /api/logs       | Create new log      | Yes  |
| PUT    | /api/logs/:id   | Update log          | Yes  |
| DELETE | /api/logs/:id   | Delete log          | Yes  |

### Roadmap
| Method | Endpoint           | Description          | Auth |
|--------|-------------------|----------------------|------|
| GET    | /api/roadmap       | Get all roadmaps     | Yes  |
| POST   | /api/roadmap       | Create roadmap       | Yes  |
| PUT    | /api/roadmap/:id   | Update / add milestone / toggle | Yes |
| DELETE | /api/roadmap/:id   | Delete roadmap       | Yes  |

---

## Deployment

### Backend → Render.com

1. Push your `devtrack/` folder to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. Add environment variables in the Render dashboard:
   ```
   MONGO_URI=your_atlas_uri
   JWT_SECRET=your_secret
   JWT_EXPIRE=7d
   CLIENT_URL=https://your-vercel-app.vercel.app
   NODE_ENV=production
   ```
5. Copy the Render service URL (e.g. `https://devtrack-api.onrender.com`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → Import Project → GitHub
2. Set:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
3. Add environment variable:
   ```
   VITE_API_URL=https://devtrack-api.onrender.com/api
   ```
4. Update `client/src/services/api.js` to use:
   ```js
   baseURL: import.meta.env.VITE_API_URL || '/api'
   ```
5. Deploy — Vercel auto-detects Vite and builds correctly

---

## Features

- ✅ JWT authentication (register / login / logout)
- ✅ Protected routes
- ✅ Daily log CRUD (date, learned, tasks, hours, tags)
- ✅ Streak calculation (consecutive active days)
- ✅ Weekly bar chart (custom SVG, no chart library needed)
- ✅ Roadmap with milestones + toggle completion
- ✅ Progress bar per roadmap
- ✅ Dark mode (always-on, terminal aesthetic)
- ✅ Responsive layout
- ✅ Centralized error handling
- ✅ Input validation (express-validator)

---

## License
MIT
