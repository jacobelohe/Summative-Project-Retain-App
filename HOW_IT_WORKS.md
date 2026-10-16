# How Retain Works

This document explains what Retain does, how its pieces fit together, and how it was built. For setup steps and the full API list, see the [README](README.md).

## 1. What the app does

Retain helps people keep track of their spending.

- **Users** record expenses, set a monthly budget and see summaries of where their money went.
- **Admins** manage the list of expense categories and see statistics for the whole platform.

## 2. The big picture

```
┌──────────────────────┐   HTTPS + JSON    ┌──────────────────────┐   Mongoose   ┌───────────────┐
│  React frontend      │ ────────────────► │  Express REST API    │ ───────────► │ MongoDB Atlas │
│  (Vercel)            │ ◄──────────────── │  (Render)            │ ◄─────────── │ (database)    │
│  TypeScript + MUI    │   Bearer token    │  JWT + role checks   │              │               │
└──────────────────────┘                   └──────────────────────┘              └───────────────┘
```

1. The user acts in the browser, such as saving an expense.
2. The frontend sends a request to the API with the user's token in the `Authorization` header.
3. The API checks the token, checks the user is allowed to do this, validates the data and talks to MongoDB.
4. The API replies with JSON, and the frontend updates the screen.

The frontend never talks to the database directly. All rules live in the API.

## 3. Main features and how they work

### 3.1 Sign up, sign in, sign out
- **Sign up** (`POST /api/auth/register`) creates a user. The password is hashed with **bcrypt**, so it's never stored as plain text. The role is always `user`.
- **Sign in** (`POST /api/auth/login`) checks the password and returns a signed **JWT** (a token that proves who you are, valid for 7 days).
- The frontend keeps the token in `localStorage`, so you stay signed in after a refresh. On load, it asks `GET /api/auth/me` to confirm the token is still valid.
- **Sign out** removes the token and clears the user from memory. It also resets the expense filters, so the next person starts clean.
- If the API ever replies "401 not signed in", the frontend signs the user out automatically.

### 3.2 Roles and protected pages
- Every user has a role: `user` or `admin`.
- **Frontend:** `ProtectedRoute` sends signed-out visitors to the login page. `AdminRoute` shows an "Admins only" page to normal users.
- **Backend:** admin endpoints require a valid token and `requireRole('admin')`. This is the real security. Hiding a page in the frontend is only for convenience, because someone could still call the API directly.
- Admins can't be created from the sign-up form. They're created by the seed script.

### 3.3 Expenses
Each expense has a title, amount, category, date, payment method and optional notes.

- **Create, view, edit, delete** are standard REST calls on `/api/expenses`.
- **Privacy:** every query includes `user: req.user._id`. If you ask for an expense that belongs to someone else, you get a 404, exactly as if it didn't exist.
- **Validation** happens twice: in the form (instant feedback) and again on the server (so bad data can't get in through the API).

### 3.4 Search, filter, sort and pagination
- The controls are in `ExpenseFilters`. Their values live in a **Redux** slice (`store/filtersSlice.ts`):
  search text, category, payment method, date range, amount range, sort field and direction, page and page size.
- A selector (`selectExpenseQuery`) converts that state into API query parameters.
- The `useExpenses` hook reads the selector and fetches again whenever it changes. Older requests are cancelled, so a slow response can't overwrite a newer one.
- The API builds a MongoDB query from those parameters, sorts, and returns one page plus totals.
- Typing in the search box is debounced (about 0.35 s), so it doesn't send a request for every key press.
- Changing any filter returns to page 1, and a "Clear filters" button resets everything.

### 3.5 Monthly budget
- A budget is one amount per user per month (`YYYY-MM`).
- The API adds up that month's expenses and works out the remaining amount and the status:

  | Spent vs. budget | Status |
  | --- | --- |
  | no budget set | not set |
  | under 80% | **within** budget (green) |
  | 80% to 100% | **approaching** limit (orange) |
  | over 100% | **over** budget (red) |

### 3.6 User dashboard
One request (`GET /api/dashboard/summary?month=…`) returns everything the dashboard needs for the chosen month: total spent, remaining budget and status, the highest expense, spending grouped by category (a MongoDB aggregation) and the five most recently added expenses.

### 3.7 Admin dashboard
`GET /api/admin/insights` returns the platform-wide numbers: users, expenses, total value, expenses this month, spending per category, the top 5 and bottom 5 categories by usage, and the newest expenses and users. Categories with zero expenses are included, so the "least used" list is meaningful.

### 3.8 Category management and deleting a category
Admins can create, rename, recolour and delete categories. Names are unique, ignoring capital letters.

**What happens when you delete a category that has expenses?** Those expenses are moved to a protected default category called **Uncategorized**, and then the category is removed. The default category itself can't be deleted. The confirmation dialog tells the admin how many expenses will move.

## 4. How the code is organised

```
client/src
  api/          one Axios instance (adds the token) + one small file per resource
  components/   reusable pieces: common, layout, expenses, budget, charts, admin
  context/      AuthProvider (login state), NotifyProvider (toast messages)
  hooks/        useAuth, useApi (loading/error/data), useExpenses, useCategories …
  pages/        one file per screen, loaded on demand (code splitting)
  routes/       ProtectedRoute, AdminRoute, GuestRoute
  store/        Redux store + the filters slice
  types/        TypeScript types shared across the app
server/src
  routes/       URLs and validation rules
  controllers/  what each endpoint does
  middleware/   authenticate, requireRole, validation, error handling
  models/       User, Expense, Category, Budget (Mongoose schemas)
  services/     budget calculations
  utils/        query builder, date helpers, tokens
```

A request flows like this: **route** (validate input) → **middleware** (check token and role) → **controller** (do the work with the **models**) → JSON response. Errors from anywhere end up in one error handler that returns a consistent `{ message }`.

## 5. Why these choices

| Decision | Reason |
| --- | --- |
| **React Context for auth** | Required by the assignment. Auth is global, changes rarely, and many components need to read it. |
| **Redux Toolkit for filters** | Required by the assignment. Filters change often, are shared by several components and drive data fetching, which suits one central store. |
| **Server-side filtering and paging** | Results stay correct across pages and the app stays fast with a lot of data. |
| **TypeScript everywhere in the frontend** | Types for users, expenses, budgets, API responses, Redux state and context catch mistakes early. The code uses no `any`. |
| **JWT + role checks on the server** | The API stays secure even if someone ignores the frontend. |
| **Default "Uncategorized" category** | Deleting a category never leaves expenses without one. |
| **Dates stored as UTC midnight** | An expense dated 5 June stays on 5 June in every time zone. |
| **Material UI** | A consistent, accessible, responsive look with little custom CSS. |

## 6. Security summary
- Passwords are hashed (bcrypt) and never sent back.
- Tokens are signed with a secret that lives only in the server's environment variables.
- Users can only reach their own expenses and budgets.
- Admin endpoints require the admin role on the server.
- Inputs are validated with express-validator. Helmet adds security headers. CORS allows only the real frontend address.
- Secrets (`.env`) are never committed to Git.

## 7. How it was built

The project was built in small steps, each as its own Git commit, in this order:

1. **Project setup:** repository, `.gitignore`, README skeleton.
2. **Backend foundation:** Express app, environment config, MongoDB connection, central error handling.
3. **Authentication:** the User model, register / login / me, JWT and role middleware.
4. **Expenses:** the Category and Expense models, user-scoped CRUD, and the query builder for search, filters, sorting and pagination.
5. **Categories:** admin-only CRUD with reassignment to *Uncategorized*, plus a seed script.
6. **Budgets and dashboard:** budget model, status calculation and the summary endpoint.
7. **Admin insights:** the platform statistics endpoint, using aggregations.
8. **Frontend foundation:** Vite + React + TypeScript, the Material UI theme and routing.
9. **API layer and types:** shared TypeScript types and typed Axios modules.
10. **Authentication in the UI:** AuthContext, sign-in and sign-up pages, protected and admin routes, the app shell.
11. **Redux filters:** the store and filters slice.
12. **Expense screens:** list, filters, pagination, detail, create, edit, delete.
13. **Budget and dashboard screens** with charts.
14. **Admin screens:** insights and category management.
15. **Polish:** code splitting, error boundary, page titles, mobile fixes.
16. **Documentation and deployment:** README, Render blueprint, Vercel config.

**How it was tested:** the API was checked with scripted requests against a temporary in-memory MongoDB (login, privacy between users, admin-only access, filters, budgets, category deletion). The frontend was checked with a real browser run through the main flows, at desktop and phone sizes. After deployment the same login and expense flow was run against the live site.

## 8. Deployment
- **Database:** MongoDB Atlas (free cluster).
- **API:** Render, defined in `render.yaml`. On start it runs the seed script, which is safe to repeat, and then the server.
- **Frontend:** Vercel, with the root directory set to `client`. `VITE_API_URL` tells it where the API lives, and `vercel.json` makes deep links work.
- The API only accepts browser requests from the address in `CLIENT_URL`.
- Render's free tier sleeps when idle, so the first request after a quiet period can take up to about a minute.

## 9. Ideas for the future
Recurring expenses, spending trends over time, budget alerts and notifications, CSV export, per-category budgets and password reset by email.
