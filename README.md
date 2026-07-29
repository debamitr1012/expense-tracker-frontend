# ExpenseFlow Web — React + Vite

Frontend for the ExpenseFlow daily expense tracker: a React single-page app
with JWT-based auth, a dashboard, and spending analytics.

- **Stack:** React 18 + Vite, React Router, Chart.js, Axios

> Backend API lives in a separate repository: **expense-tracker-backend**.

## Features

- Register / login with JWT-based stateless auth
- Add, list, and delete expenses (per-user, isolated)
- Dashboard stat cards: total spent, this month, transaction count, avg/day
- Analytics: spending-by-category doughnut chart + 14-day daily trend bar chart
- Filter transactions by category and search by description
- Dark / light mode toggle (remembers your choice, follows OS preference by default)

---

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- A running instance of the **expense-tracker-backend** API

---

## Setup

```bash
# Install dependencies
npm install

# Point the app at your backend API (defaults to http://localhost:5050/api)
# Set VITE_API_URL in .env if your backend runs elsewhere.

# Start the dev server
npm run dev
```

The app runs at **http://localhost:5173**.

### Environment variables

| Key | Description | Default |
|-----|-------------|---------|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5050/api` |

---

## Notes

- The JWT is stored in `localStorage` and attached to every request via an Axios
  interceptor. A 401 response clears the session and redirects to login.
- The theme (dark / light) is stored in `localStorage` and defaults to the OS
  `prefers-color-scheme` setting on first visit. Toggle it with the 🌙/☀️ button
  in the top-right of the login and dashboard screens.
- Make sure the backend's `CORS_ALLOWED_ORIGINS` includes this app's origin.

---

## Deployment (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New** → **Project**
2. Import this GitHub repository
3. Configure:
   - **Root Directory:** *(leave as the repo root)*
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add **Environment Variable:**
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://expensetracker-api.onrender.com/api` *(your backend URL + `/api`)* |
5. Click **Deploy**
6. Note your frontend URL (e.g. `https://your-app.vercel.app`)

### After deploying

Update the backend's `CORS_ALLOWED_ORIGINS` environment variable to include your
Vercel URL, e.g.:

```
http://localhost:5173,https://your-app.vercel.app
```

Both services auto-deploy when you push to their respective GitHub repositories.
