# Retain — Personal Expense & Budget Manager

Retain is a full-stack web app for recording personal expenses, setting a monthly budget and seeing where your money goes. Regular users manage their own expenses and budgets. Admins manage the shared expense categories and see platform-wide insights.

## 🔗 Live demo

| | URL |
| --- | --- |
| **Frontend (Vercel)** | https://summative-project-retain-app-hazel.vercel.app |
| **API (Render)** | https://retain-api-apcp.onrender.com (health check: `/api/health`) |

**Demo accounts** (created by the seed script):

| Role | Email | Password |
| --- | --- | --- |
| User (with sample data) | `demo@retain.app` | `Demo@12345` |
| Admin | value of `ADMIN_EMAIL` (default `admin@retain.app`) | value of `ADMIN_PASSWORD` |

> The API runs on Render's free tier, so the first request after a period of inactivity can take up to a minute while the server wakes up.

---

## ✨ Features

### For every user
- **Authentication**: sign up, sign in and sign out with JWT-based sessions that persist across page reloads.
- **Expense CRUD**: create, view, edit and delete expenses. Each expense has a title, amount, category, date, payment method and optional notes.
- **Search, filter and sort**: search by title or notes; filter by category, payment method, date range and amount range; sort by date or amount (ascending or descending).
- **Pagination**: the expense list is paginated on the server, with a choice of 5 / 10 / 20 / 50 per page.
- **Monthly budget**: set, update or remove a budget for any month. The app shows total spent, remaining budget and a status:
  - 🟢 **Within budget**: less than 80% used
  - 🟠 **Approaching limit**: 80–100% used
  - 🔴 **Over budget**: more than 100% used
- **Dashboard**: for the selected month it shows total spending, remaining budget, highest single expense, top category, spending by category (donut chart) and the most recently added expenses.
- **Responsive UI**: a sidebar on desktop and a slide-out drawer on mobile. Tables switch to cards on phones.

### For admins
- **Category management**: create, rename, recolour and delete categories. Deleting a category moves its expenses to the protected default category, **Uncategorized**, so no expense is ever left without a category. The confirm dialog says how many expenses will be moved.
- **Platform insights**: total registered users, total expenses recorded, total value recorded, expenses recorded this month, spending per category (bar chart), top 5 most-used and bottom 5 least-used categories, recently added expenses and recently registered users.

---

## 🧱 Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Material UI (MUI), React Router, Redux Toolkit, React Context, Axios, Recharts, Day.js |
| Backend | Node.js, Express 5, Mongoose, JSON Web Tokens, bcryptjs, express-validator, Helmet, CORS |
| Database | MongoDB (MongoDB Atlas in production) |
| Hosting | Vercel (frontend), Render (API), MongoDB Atlas (database) |

---

## 🏗️ Architecture

```
Summative-Project-Retain-App/
├── client/                     React + TypeScript (Vite)
│   └── src/
│       ├── api/                Axios instance + typed API modules
│       ├── components/         Reusable UI (common, layout, expenses, budget, charts, admin)
│       ├── context/            AuthProvider (auth) and NotifyProvider (toasts)
│       ├── hooks/              useAuth, useApi, useExpenses, useCategories, …
│       ├── pages/              Route-level screens (lazy loaded)
│       ├── routes/             ProtectedRoute, AdminRoute, GuestRoute
│       ├── store/              Redux store + filters slice
│       ├── types/              Shared TypeScript domain types
│       └── utils/              Formatting helpers
├── server/                     Express REST API
│   ├── scripts/dev-memory.js   Runs the API on a throwaway in-memory MongoDB
│   └── src/
│       ├── config/             Env + database connection
│       ├── controllers/        Request handlers
│       ├── middleware/         authenticate, requireRole, validate, error handling
│       ├── models/             User, Expense, Category, Budget
│       ├── routes/             Route definitions + validation rules
│       ├── services/           Budget calculations
│       ├── utils/              Query builder, dates, tokens, ApiError
│       └── seed.js             Seeds categories, admin and demo data
└── render.yaml                 Render deployment blueprint
```

### State management
- **Authentication uses React Context only.** `AuthProvider` ([client/src/context/AuthProvider.tsx](client/src/context/AuthProvider.tsx)) holds the user, the token, `isAdmin` / `hasRole()`, and `login`, `register` and `logout`. `ProtectedRoute` and `AdminRoute` read this context to guard routes. A non-admin who opens an admin URL sees a 403 page.
- **Expense searching, filtering, sorting and pagination use Redux only.** The `filters` slice ([client/src/store/filtersSlice.ts](client/src/store/filtersSlice.ts)) stores every control's value. A memoised selector turns that state into the API query, and `useExpenses` fetches again whenever the query changes. Filtering happens on the server, so results stay correct across pages.

### Security
- Passwords are hashed with bcrypt and never returned by the API.
- Every expense and budget query is scoped to the signed-in user (`{ user: req.user._id }`). Requests for someone else's expense return `404`, so the API never reveals that the expense exists.
- Admin endpoints are protected by `authenticate` + `requireRole('admin')`. Public sign-up always creates a regular `user`; admins are created only by the seed script.
- Requests are validated with express-validator. Helmet sets security headers, and CORS only allows the configured frontend origin(s).

---

## 🚀 Getting started (local)

### Prerequisites
- Node.js 18 or newer (developed on Node 24)
- A MongoDB connection string (MongoDB Atlas or a local `mongod`). This is optional if you use the in-memory option below.

### 1. Clone and install
```bash
git clone https://github.com/jacobelohe/Summative-Project-Retain-App.git
cd Summative-Project-Retain-App
cd server && npm install
cd ../client && npm install
```

### 2. Configure the API
```bash
cd server
cp .env.example .env   # then edit MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
```

| Variable | Description |
| --- | --- |
| `PORT` | API port (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `CLIENT_URL` | Allowed frontend origin(s), comma separated (default `http://localhost:5173`) |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin account created by the seed script |

### 3. Seed and run
```bash
# in server/
npm run seed:demo   # categories + admin + demo user with sample expenses (safe to re-run)
npm run dev         # API on http://localhost:5000

# in client/ (separate terminal)
npm run dev         # app on http://localhost:5173 (Vite proxies /api to :5000)
```

**No MongoDB?** Run `npm run dev:memory` in `server/` instead of the seed and dev steps. It starts the API on an in-memory MongoDB that is already seeded. The data is lost when it stops.

### Scripts

| Location | Command | What it does |
| --- | --- | --- |
| server | `npm run dev` | Start the API with auto-reload (nodemon) |
| server | `npm start` | Start the API (production) |
| server | `npm run seed` / `seed:demo` | Seed categories + admin (and the demo user) |
| server | `npm run dev:memory` | API on a throwaway, pre-seeded in-memory MongoDB |
| client | `npm run dev` | Vite dev server |
| client | `npm run build` | Type-check (`tsc -b`) and build for production |
| client | `npm run lint` | Lint with oxlint |

---

## 📡 API reference

Base URL: `/api`. Protected routes need an `Authorization: Bearer <token>` header. Errors always come back as JSON in the form `{ "message": string, "details"?: [{ "field", "message" }] }`.

### Auth
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | `{ name, email, password }` → `{ token, user }` (role is always `user`) |
| POST | `/auth/login` | Public | `{ email, password }` → `{ token, user }` |
| GET | `/auth/me` | User | Current user |

### Expenses (scoped to the signed-in user)
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/expenses` | Paginated list. Query params: `search`, `category`, `paymentMethod`, `startDate`, `endDate` (`YYYY-MM-DD`), `minAmount`, `maxAmount`, `sortBy` (`date`/`amount`), `order` (`asc`/`desc`), `page`, `limit` (max 100). Returns `{ data, page, limit, total, totalPages, totalAmount }` |
| POST | `/expenses` | Create `{ title, amount, category, date, paymentMethod, notes? }` |
| GET | `/expenses/:id` | Get one expense |
| PUT | `/expenses/:id` | Update any of the fields above |
| DELETE | `/expenses/:id` | Delete |

`paymentMethod` is one of `cash`, `card`, `mobile_money`, `bank_transfer` or `other`.

### Budgets (scoped to the signed-in user)
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/budgets` | All budgets the user has set (newest month first) |
| GET | `/budgets/:month` | `YYYY-MM` → `{ month, budget, totalSpent, remaining, percentUsed, status, expenseCount }` |
| PUT | `/budgets/:month` | `{ amount }`: create or update the month's budget |
| DELETE | `/budgets/:month` | Remove the month's budget |

### Dashboard
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/dashboard/summary?month=YYYY-MM` | Budget overview plus `highestExpense`, `byCategory[]` and `recentExpenses[]` for the month |

### Categories
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/categories` | User | All categories with an `expenseCount` for each |
| POST | `/categories` | Admin | `{ name, color? }` (names are unique, case-insensitive) |
| PUT | `/categories/:id` | Admin | Rename / recolour |
| DELETE | `/categories/:id` | Admin | Deletes the category and moves its expenses to **Uncategorized**. Returns `{ reassignedCount, reassignedTo }`. The default category cannot be deleted |

### Admin
| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/admin/insights` | Admin | `totals` (users, expenses, value, expensesThisMonth), `spendingByCategory`, `topCategories`, `bottomCategories`, `recentExpenses`, `recentUsers` |

### Status codes
`200` OK · `201` created · `400` validation error · `401` not signed in / bad token · `403` not an admin · `404` not found (or not yours) · `409` duplicate (email or category) · `500` server error

---

## ☁️ Deployment

1. **Database: MongoDB Atlas.** Create a free cluster and a database user. Allow network access from anywhere (`0.0.0.0/0`) so Render can connect. Copy the connection string.
2. **API: Render.** Create a **New → Blueprint** from this repository; Render reads [render.yaml](render.yaml). Set `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `CLIENT_URL` (your Vercel URL). `JWT_SECRET` is generated automatically. Every start runs the idempotent seed, then starts the API.
3. **Frontend: Vercel.** Import the repository, set the **Root Directory** to `client`, and add the environment variable `VITE_API_URL=https://<your-render-service>.onrender.com/api`. [client/vercel.json](client/vercel.json) rewrites all paths to `index.html` so deep links work.
4. Put the two URLs in the **Live demo** table at the top of this README.

---

## 🧭 Error handling & UX notes
- Forms validate on the client first, then show any field errors the server returns.
- Every data view has a loading state, an empty state and an error state with a **Retry** button. Toast notifications confirm saves and deletes.
- Destructive actions (deleting an expense, budget or category) ask for confirmation first.
- An expired or invalid token signs the user out automatically. A React error boundary keeps a single broken screen from blanking the whole app.
- Search input is debounced, in-flight requests are cancelled when filters change, and route-level code splitting keeps the first page load small.
