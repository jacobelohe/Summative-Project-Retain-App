# Retain

Retain is a web application for recording personal expenses and tracking them against a monthly budget. It was built as a summative project using React with TypeScript on the frontend and a Node.js and Express REST API with a MongoDB database on the backend.

Two kinds of accounts exist. A regular user records and reviews their own expenses and sets a budget for each month. An administrator manages the shared list of expense categories and can view statistics for the whole platform.

## Deployed application

| Part | URL |
| --- | --- |
| Frontend (Vercel) | https://summative-project-retain-app-hazel.vercel.app |
| API (Render) | https://retain-api-apcp.onrender.com (health check at `/api/health`) |

Demo account with sample data:

| Role | Email | Password |
| --- | --- | --- |
| User | `demo@retain.app` | `Demo@12345` |

The API runs on Render's free tier, which stops the service after a period of inactivity. The first request after that can take up to about a minute to respond.

## Features

### Regular users
- Sign up, sign in and sign out. The session is kept across page reloads.
- Create, view, edit and delete expenses. Each expense has a title, an amount, a category, a date, a payment method and optional notes.
- Search expenses by title or notes. Filter by category, payment method, date range and amount range. Sort by date or amount in either direction.
- Server-side pagination of the expense list, with page sizes of 5, 10, 20 and 50.
- Set, update or remove a budget for any month. For the selected month the app shows the total spent, the remaining amount and a status:
  - within budget: less than 80% of the budget spent
  - approaching the limit: 80% to 100% spent
  - over budget: more than 100% spent
- A dashboard for the selected month showing total spending, remaining budget, the highest single expense, the top category, spending by category in a chart, and the five most recently added expenses.
- A layout that adapts to screen size: a sidebar on large screens, a slide-out menu on phones, and expense cards instead of a table on small screens.

### Administrators
- Create, rename, recolour and delete expense categories. When a category is deleted, the expenses assigned to it are moved to a protected default category named "Uncategorized". The default category cannot be deleted.
- A platform insights page showing the number of registered users, the number of expenses recorded, the total value of those expenses, the number of expenses recorded in the current month, total spending per category, the five most-used and five least-used categories, the most recently added expenses and the most recently registered users.

## Technologies

| Area | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Material UI, React Router, Redux Toolkit, Axios, Recharts, Day.js |
| Backend | Node.js, Express 5, Mongoose, JSON Web Tokens, bcryptjs, express-validator, Helmet, CORS |
| Database | MongoDB (MongoDB Atlas in production) |
| Hosting | Vercel (frontend), Render (API), MongoDB Atlas (database) |

## How the application is structured

```
Summative-Project-Retain-App/
  client/                     React and TypeScript frontend (Vite)
    src/
      api/                    Axios instance and one typed module per resource
      components/             Reusable components (common, layout, expenses, budget, charts, admin)
      context/                AuthProvider (authentication) and NotifyProvider (messages)
      hooks/                  useAuth, useApi, useExpenses, useCategories and others
      pages/                  One component per screen
      routes/                 ProtectedRoute, AdminRoute, GuestRoute
      store/                  Redux store and the filters slice
      types/                  Shared TypeScript types
      utils/                  Formatting helpers
  server/                     Express API
    scripts/dev-memory.js     Runs the API against a temporary in-memory MongoDB
    src/
      config/                 Environment variables and database connection
      controllers/            Request handlers
      middleware/             Authentication, role checks, validation, error handling
      models/                 User, Expense, Category and Budget schemas
      routes/                 Route definitions and validation rules
      services/               Budget calculations
      utils/                  Query builder, date helpers, token helpers
      seed.js                 Creates categories, the admin account and demo data
  render.yaml                 Render deployment configuration
```

### State management
- Authentication uses React Context only. `AuthProvider` in `client/src/context/AuthProvider.tsx` stores the signed-in user and token and provides `login`, `register`, `logout`, `isAuthenticated` and `isAdmin`. `ProtectedRoute` redirects signed-out visitors to the login page. `AdminRoute` shows an "Admins only" page to signed-in users who are not administrators.
- Searching, filtering, sorting and pagination use Redux only. The filters slice in `client/src/store/filtersSlice.ts` holds all of that state. A selector converts it into the query parameters sent to the API, and the `useExpenses` hook requests new data whenever the query changes. Filtering and sorting are carried out by the database, so results remain correct across pages.

### Access control
- Passwords are hashed with bcrypt and are never returned by the API.
- Every expense and budget query is limited to the signed-in user. A request for another user's expense returns a 404 response.
- All routes under `/api/admin` require a valid token and the `admin` role. Public sign-up always creates a regular user. Administrator accounts are created by the seed script only.
- Request bodies are validated with express-validator. Helmet sets security headers, and CORS allows only the origin listed in `CLIENT_URL`.

## Running the project locally

### Requirements
- Node.js 18 or later
- A MongoDB connection string (MongoDB Atlas or a local MongoDB server). This is not needed if you use the in-memory option described below.

### Installation
```bash
git clone https://github.com/jacobelohe/Summative-Project-Retain-App.git
cd Summative-Project-Retain-App
cd server && npm install
cd ../client && npm install
```

### API configuration
Copy `server/.env.example` to `server/.env` and set the values below.

| Variable | Description |
| --- | --- |
| `PORT` | Port the API listens on. Default 5000. |
| `MONGODB_URI` | MongoDB connection string. |
| `JWT_SECRET` | Long random string used to sign tokens. |
| `JWT_EXPIRES_IN` | Token lifetime. Default `7d`. |
| `CLIENT_URL` | Allowed frontend origin or origins, separated by commas. Default `http://localhost:5173`. |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Details of the administrator account created by the seed script. |

### Starting the application
In the `server` folder:
```bash
npm run seed:demo    # creates categories, the admin account and the demo user (safe to run more than once)
npm run dev          # starts the API on http://localhost:5000
```
In the `client` folder, in a second terminal:
```bash
npm run dev          # starts the frontend on http://localhost:5173
```
During development Vite forwards requests for `/api` to `http://localhost:5000`, so `VITE_API_URL` does not need to be set.

To run without a MongoDB server, use `npm run dev:memory` in the `server` folder instead of the two commands above. It starts the API against a temporary in-memory database that is already seeded. The data is discarded when the process stops.

### Scripts

| Folder | Command | Purpose |
| --- | --- | --- |
| server | `npm run dev` | Start the API with automatic restart on file changes |
| server | `npm start` | Start the API |
| server | `npm run seed` | Create the categories and the administrator account |
| server | `npm run seed:demo` | Same as `seed`, and also create the demo user with sample expenses |
| server | `npm run dev:memory` | Start the API on a seeded in-memory database |
| client | `npm run dev` | Start the Vite development server |
| client | `npm run build` | Type-check and build for production |
| client | `npm run lint` | Run the linter |

## API reference

All paths are relative to `/api`. Routes marked "User" or "Admin" require the header `Authorization: Bearer <token>`. Errors are returned as JSON in the form `{ "message": string, "details"?: [{ "field": string, "message": string }] }`.

### Authentication

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Body `{ name, email, password }`. Returns `{ token, user }`. The role is always `user`. |
| POST | `/auth/login` | Public | Body `{ email, password }`. Returns `{ token, user }`. |
| GET | `/auth/me` | User | Returns the current user. |

### Expenses (limited to the signed-in user)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/expenses` | Paginated list. Query parameters: `search`, `category`, `paymentMethod`, `startDate`, `endDate` (format `YYYY-MM-DD`), `minAmount`, `maxAmount`, `sortBy` (`date` or `amount`), `order` (`asc` or `desc`), `page`, `limit` (maximum 100). Returns `{ data, page, limit, total, totalPages, totalAmount }`. |
| POST | `/expenses` | Body `{ title, amount, category, date, paymentMethod, notes? }`. |
| GET | `/expenses/:id` | Returns one expense. |
| PUT | `/expenses/:id` | Updates any of the fields above. |
| DELETE | `/expenses/:id` | Deletes the expense. |

`paymentMethod` must be one of `cash`, `card`, `mobile_money`, `bank_transfer` or `other`.

### Budgets (limited to the signed-in user)

| Method | Path | Description |
| --- | --- | --- |
| GET | `/budgets` | Lists the budgets the user has set, newest month first. |
| GET | `/budgets/:month` | The month is given as `YYYY-MM`. Returns `{ month, budget, totalSpent, remaining, percentUsed, status, expenseCount }`. |
| PUT | `/budgets/:month` | Body `{ amount }`. Creates or updates the budget for the month. |
| DELETE | `/budgets/:month` | Removes the budget for the month. |

### Dashboard

| Method | Path | Description |
| --- | --- | --- |
| GET | `/dashboard/summary?month=YYYY-MM` | Returns the budget overview for the month together with `highestExpense`, `byCategory` and `recentExpenses`. |

### Categories

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/categories` | User | Lists all categories, each with an `expenseCount`. |
| POST | `/categories` | Admin | Body `{ name, color? }`. Names must be unique, ignoring letter case. |
| PUT | `/categories/:id` | Admin | Renames or recolours a category. |
| DELETE | `/categories/:id` | Admin | Deletes the category and moves its expenses to "Uncategorized". Returns `{ reassignedCount, reassignedTo }`. The default category cannot be deleted. |

### Administration

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| GET | `/admin/insights` | Admin | Returns `totals` (users, expenses, value, expensesThisMonth), `spendingByCategory`, `topCategories`, `bottomCategories`, `recentExpenses` and `recentUsers`. |

### Response codes

| Code | Meaning |
| --- | --- |
| 200, 201 | Success, or resource created |
| 400 | Validation error |
| 401 | Missing, invalid or expired token |
| 403 | The user does not have the required role |
| 404 | Resource not found, or it belongs to another user |
| 409 | Duplicate email address or category name |
| 500 | Server error |

## Deployment

1. Database: create a MongoDB Atlas cluster and a database user. In Network Access, add the entry `0.0.0.0/0` so the hosted API can connect. Copy the connection string.
2. API: create a Render Blueprint from this repository. Render reads `render.yaml`. Set `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `CLIENT_URL` (the frontend address). `JWT_SECRET` is generated by Render. On every start the service runs the seed script and then starts the server.
3. Frontend: import the repository into Vercel, set the root directory to `client`, and add the environment variable `VITE_API_URL` with the value `https://<api-address>/api`. The file `client/vercel.json` rewrites all paths to `index.html` so that direct links to pages work.
4. After the frontend is deployed, set `CLIENT_URL` on Render to the frontend address, without a trailing slash.

## Error handling

- Forms are validated in the browser first. Validation messages returned by the API for individual fields are shown next to the matching input.
- Each screen that loads data has a loading state, an empty state and an error state with a retry button. Confirmations of saves and deletes appear as short messages.
- Deleting an expense, a budget or a category asks for confirmation first.
- If the API rejects the stored token, the user is signed out automatically.
- A React error boundary prevents a rendering error on one screen from blanking the whole application.

## Additional documents

- [HOW_IT_WORKS.md](HOW_IT_WORKS.md) describes how the application works and how it was built.
- [DEMO_SCRIPT.md](DEMO_SCRIPT.md) is the script used for the recorded demonstration.
