# To-Do — Manage What To Do

A mobile-first to-do app built with **Next.js (App Router)**, **JavaScript** and **Tailwind CSS**.
The same Next.js project serves both the UI and the REST API, so it deploys to Vercel as-is.

## Screens

| Route     | What it does |
|-----------|--------------|
| `/`       | Onboarding ("Get Started"; skipped automatically on later visits) |
| `/home`   | Search bar, Mon–Sun day strip (swipe/drag sideways to change week), Task Complete / Task Pending cards, Weekly Progress, tasks for the selected day, + button |
| `/search` | Keyword search over title and description; tap a task to view/edit, swipe left to delete |
| `/weeks`  | All tasks grouped by week (Mon–Sun) with open vs completed counts; tap a week to expand it |

Creating and editing use the **Add New Task** bottom sheet (title, start/end time, date, priority, description; status when editing).
Tick the checkbox to switch a task between *In Progress* and *Completed*. Delete with the trash icon or by swiping a row left (with Undo).

## API

| Method | Path | Body / query |
|--------|------|--------------|
| GET    | `/api/tasks?q=keyword` | optional search |
| POST   | `/api/tasks` | `{ title*, date*, startTime*, endTime, description, priority, status }` |
| GET    | `/api/tasks/:id` | |
| PATCH  | `/api/tasks/:id` | any subset of the fields above |
| DELETE | `/api/tasks/:id` | |

`date` is `YYYY-MM-DD`, times are `HH:MM`, `priority` is `low | medium | high | null`, `status` is `in_progress | completed`.
Each browser gets an anonymous `todo_uid` cookie, so visitors only see their own tasks.

## Database (MongoDB)

Tasks are stored in MongoDB, in the `tasks` collection: one document per task, with `_id` = task id and a `uid`
field for the visitor. The connection is configured with environment variables:

| Variable      | Required | Example |
|---------------|----------|---------|
| `MONGODB_URI` | yes      | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority` |
| `MONGODB_DB`  | no       | `todo` (default) |

Locally these go in **`.env.local`** in the project root (git-ignored; `.env.example` is the template).

**Free MongoDB Atlas setup:** create a free cluster at https://www.mongodb.com/cloud/atlas, then
*Database Access* → add a user, *Network Access* → allow `0.0.0.0/0` (required for Vercel),
*Connect → Drivers* → copy the connection string into `MONGODB_URI`, replacing `<password>`.

## Run locally

```bash
npm install
# put your MONGODB_URI in .env.local
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

1. Push this folder to GitHub and import it in Vercel (framework preset: Next.js).
2. In *Project → Settings → Environment Variables* add `MONGODB_URI` (and `MONGODB_DB` if you changed it),
   or connect *MongoDB Atlas* from the Vercel Marketplace, which sets `MONGODB_URI` for you.
3. Deploy (or redeploy if you added the variables after the first deploy).
