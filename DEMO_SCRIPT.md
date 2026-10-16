# Retain: Demo Script (target length ≈ 8 minutes)

Read this out loud once or twice before recording. The **Say** lines are written to be spoken naturally, so put them in your own words. The **Do** lines are what to click. The **Code** lines are what to show in the IDE.

**Deployed app:** https://summative-project-retain-app-hazel.vercel.app
**API:** https://retain-api-apcp.onrender.com
**Demo user:** `demo@retain.app` / `Demo@12345` (36 sample expenses)
**Admin:** your `ADMIN_EMAIL` / `ADMIN_PASSWORD` from Render

---

## Before you press record (do this 5 minutes earlier)

- [ ] **Wake the API.** Open `https://retain-api-apcp.onrender.com/api/health`. The free tier sleeps after inactivity, and the first request can take about 50 seconds. Refresh until you see `{"status":"ok"}`.
- [ ] Open the deployed site in a **clean browser window** and sign out if you're signed in. Zoom to 100%.
- [ ] Open the IDE (VS Code) with these files in tabs, in this order:
  1. `client/src/context/AuthProvider.tsx`
  2. `client/src/routes/ProtectedRoute.tsx` and `AdminRoute.tsx`
  3. `client/src/store/filtersSlice.ts`
  4. `client/src/hooks/useExpenses.ts`
  5. `client/src/api/client.ts`
  6. `server/src/middleware/auth.js`
  7. `server/src/routes/adminRoutes.js`
  8. `server/src/controllers/expenseController.js`
  9. `server/src/services/budgetService.js`
  10. `server/src/controllers/categoryController.js`
- [ ] Open the GitHub repo README in a tab. The URLs are at the top.
- [ ] Open the Atlas **Browse collections** page in a tab (optional, for the database moment).
- [ ] Have your **admin email and password** ready, and a **new email** ready for sign-up (for example `yourname+demo1@gmail.com`).
- [ ] Close notifications and extra tabs. Do a quick test run of the whole flow once.

> **If something is slow:** the first login after the API sleeps is the slowest. Waking it beforehand avoids an awkward pause on camera.

---

## 0:00 – 0:40 · Introduction and deployment (rubric: Deployment)

**Do:** Show the GitHub README, scrolling to the **Live demo** table. Then switch to the deployed site.

**Say:**
> "Hi, this is **Retain**, a personal expense and budget manager. The frontend is React with TypeScript and Vite, using Material UI. The backend is a Node and Express REST API, and the data is stored in MongoDB Atlas. The frontend is deployed on Vercel and the API on Render. The deployment URLs are in the README, and everything I show now runs on the deployed version."

---

## 0:40 – 1:40 · Authentication (rubric: State management & Authentication)

**Do:**
1. Go to the site while signed out. In the address bar, type `/expenses` and press Enter. You're redirected to **/login**.

   **Say:** "I'm not signed in, so the protected page sent me back to login."
2. Click **Create an account**. Fill in the name, a new email and a password. Show the validation first by clicking Create with mismatched passwords. Then submit properly. You land on an empty dashboard.

   **Say:** "Sign-up creates a normal user. The password is hashed with bcrypt on the server."
3. In the address bar, go to `/admin`. The **Admins only** page appears.

   **Say:** "A normal user can't open admin routes. They get a 403 page."
4. Click the avatar → **Sign out**. You return to login.
5. Sign in as **demo@retain.app**.

**Code (30 seconds):** Show `AuthProvider.tsx`.

**Say:**
> "Authentication is handled entirely with **React Context**. `AuthProvider` holds the user and token, and exposes `login`, `register`, `logout` and `isAdmin`. On page load, this effect checks the stored token with `/auth/me`, so a refresh keeps you signed in. `ProtectedRoute` checks `isAuthenticated`, and `AdminRoute` also checks `isAdmin`."

Briefly show `ProtectedRoute.tsx` (the `Navigate` to login) and `AdminRoute.tsx` (the `ForbiddenPage` line).

---

## 1:40 – 3:30 · Expense management, search, filter, sort (rubric: React components, Redux)

**Do:** Click **Expenses**. Point out the columns: title, category, date, payment method and amount.

**Say:** "These are this user's expenses, loaded live from the API. The list is paginated on the server."

**Search:** Type `taxi`. Three results appear.

**Filter:**
- Clear the search. Open **Category** → *Transport*.
- Set **Payment method** → *Cash*.
- Set the **From/To** dates to a range in September.
- Click **Clear filters**.

**Sort:** Open **Sort by** → *Highest amount*. The rent appears first. Click the **Date** and **Amount** column headers to flip direction.

**Pagination:** Change "Per page" and click the next-page arrow.

**Code (45 seconds):** Show `filtersSlice.ts`.

**Say:**
> "All searching, filtering, sorting and paging state lives in **Redux**. This slice holds the search text, category, payment method, date and amount ranges, sort field and page. Any change that alters the results, like `setSearch`, resets the page to 1. This selector, `selectExpenseQuery`, turns the state into the API query. `useExpenses` reads it and re-fetches whenever it changes. So the filtering happens in the database, and the results stay correct across pages."

Show `useExpenses.ts` for 10 seconds.

### Create, view, edit, delete

1. Click **Add expense**. Click **Add expense** with the form empty to show validation errors. Then fill it in:
   - Title: `Demo headphones`, Amount: `89.99`, Category: *Shopping*, Payment: *Card*, Notes: `For the demo`.
   - Submit. A toast confirms it, and it appears at the top of the list.
2. Click the new row. The **detail page** opens.
3. Click **Edit**. Change the amount to `79.99` and save.
4. Click **Delete** → confirm in the dialog.

**Say:** "Each step is a real request to the API. The data persists. If I refresh, it's still there or still gone."

**Do:** Refresh the browser once to prove persistence.

---

## 3:30 – 5:00 · Budget and dashboard (rubric: Expense, Budget & Dashboard)

**Do:** Click **Budget**. Set the budget for the current month to **`2000`** and click **Set budget**.

**Say:** "Total spent is about $808, so I'm well within budget. The status chip is green."

**Do:** Change it to **`900`** → *Approaching limit* (orange). Then **`500`** → *Over budget* (red), showing the negative remaining amount.

**Say:** "The status is calculated on the server. Below 80% is within budget, 80 to 100% is approaching, and above 100% is over."

**Do:** Click the month arrows to show a previous month. Click **Dashboard**.

**Say:** "The dashboard shows, for the selected month: total spent, the remaining budget, the highest single expense, which is the rent, the top category, spending by category in this chart, and the most recent expenses."

**Do:** Switch to the previous month with the arrows to show the numbers change.

**Code (20 seconds):** Show `server/src/services/budgetService.js`, the `budgetStatus` function.

---

## 5:00 – 5:45 · Responsive design (rubric: Responsive UI)

**Do:** Press **F12** → toggle the device toolbar (**Ctrl+Shift+M**). Choose a phone size such as iPhone 12 Pro.

Show these screens:
- **Expenses**: the table becomes cards, and filters sit behind the filter icon.
- Open the **☰ menu**: the sidebar becomes a drawer.
- **Dashboard**: the cards stack vertically.

**Say:** "On a phone, the sidebar becomes a drawer and tables become cards, so nothing needs sideways scrolling."

Close the device toolbar.

---

## 5:45 – 6:30 · Backend and database (rubric: RESTful API & Database)

**Do (optional, 20 seconds):** Show the Atlas **Browse collections** page with the `users`, `expenses`, `categories` and `budgets` collections. Or open `https://retain-api-apcp.onrender.com/api/health` in a tab.

**Say:**
> "The frontend talks to a RESTful API using Axios. This is the single Axios instance. It reads the API URL from an environment variable and attaches the JWT to every request. The API stores users, expenses, categories and budgets in MongoDB Atlas through Mongoose."

**Code:** Show `client/src/api/client.ts` (the `baseURL` and `Authorization` lines), then `server/src/controllers/expenseController.js` line 25.

**Say:**
> "Every expense query is scoped to the signed-in user with `user: req.user._id`. So one user can never read or change another user's data. A request for someone else's expense returns 404."

Show `server/src/middleware/auth.js` briefly: `authenticate` verifies the token, and `requireRole` checks the role.

---

## 6:30 – 8:00 · Admin (rubric: Admin Dashboard & Technical Explanation)

**Do:** Sign out and sign in as the **admin**. You land on **Platform insights**.

**Say:** "The admin sees an extra Administration section. Here are the platform insights."

Point to each one, in the order of the assignment:
- **Registered users**
- **Expenses recorded**
- **Total value recorded**
- **Expenses this month**
- **Total spending per category** (bar chart)
- **Top 5 most-used** and **Bottom 5 least-used** categories
- **Recently added expenses**
- **Recently registered users**: your new demo account is at the top.

**Code (20 seconds):** Show `server/src/routes/adminRoutes.js`.

**Say:**
> "Admin access is enforced twice. In the frontend, `AdminRoute` hides these pages from non-admins. More importantly, on the server every admin route goes through `authenticate` and `requireRole('admin')`, so a normal user gets a 403 even if they call the API directly."

### Category management

1. Click **Categories** → **New category**. Name it `Travel`, choose a colour and create it.
2. Click the **pencil** to edit it. Rename it to `Trips` and save.
3. Make sure at least one existing category has expenses, such as **Health**. Click its **trash** icon.

   **Say:** "The dialog warns me how many expenses use this category. They'll be moved to the default category, *Uncategorized*, so no expense is orphaned."
4. Confirm. Show that the category is gone.
5. Delete `Trips`.
6. Point out that **Uncategorized** has no delete button because it's the protected default.

**Code (20 seconds):** Show `categoryController.js` around `updateMany`.

**Say:** "On delete, `updateMany` moves every expense to the default category before the category is removed."

> **Heads-up:** deleting *Health* changes the demo data, so the Health expenses become *Uncategorized* for good. If you want to keep the data intact for another take, create a new category and an expense in it first, and delete that one instead.

---

## 8:00 – 8:30 · Wrap-up

**Say:**
> "To summarise, Retain has expense CRUD with Redux-driven search, filters, sorting and pagination, monthly budgets with status tracking, a user dashboard, React Context authentication with role-based routes, and an admin area with category management and platform insights. It's deployed on Vercel and Render with MongoDB Atlas. Extras I added include server-side pagination, code splitting, an error boundary and automatic sign-out when a token expires. Future ideas are recurring expenses, charts over time and notifications. Thank you."

---

## Quick Q&A cheat sheet (in case you're asked)

| Question | Short answer |
| --- | --- |
| Why Context for auth and Redux for filters? | The assignment requires it. It also fits: auth is global and rarely changes, while filters change often and drive the data fetching. |
| How is the token stored? | In `localStorage` and sent as a `Bearer` header. An expired token triggers an automatic sign-out. |
| How do you stop users seeing each other's data? | Every query includes `user: req.user._id`, and someone else's record returns 404. |
| How can someone become admin? | Only the seed script creates admins. Public sign-up always creates `role: user`. |
| What happens when a category is deleted? | Its expenses move to the default "Uncategorized" category. The default category can't be deleted. |
| Why is the first request slow? | Render's free tier sleeps after inactivity, so the API takes about 50 seconds to wake. |
| How is the budget status decided? | The server compares spent to budget: under 80% is within, 80–100% is approaching, over 100% is over. |

## Timing guide

| Section | Time |
| --- | --- |
| Intro and deployment | 0:40 |
| Authentication | 1:00 |
| Expenses, search, filter, sort, CRUD | 1:50 |
| Budget and dashboard | 1:30 |
| Responsive design | 0:45 |
| Backend and database | 0:45 |
| Admin and categories | 1:30 |
| Wrap-up | 0:30 |
| **Total** | **≈ 8:30** (the limit is 10:00) |
