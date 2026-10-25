# BookDragon front end

A Netflix-style book browser. This is the front-end single-page app, built from the wireframes and user stories in `app_outline/`.

**Books come from the Supabase Edge Function API** (`src/data/api.js`, `bookService.js`). **Accounts, libraries and logs use Supabase Auth and the database directly** through supabase-js (`src/data/supabase.js`, `src/state/AppState.jsx`); Row Level Security decides what each user can read or change. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the public publishable key; never a secret or service-role key).

Signing in stores the Supabase session in `localStorage`, so a refresh keeps you signed in (an expired access token is renewed with the refresh token). Signing out ends the session on the server and removes it from the browser.

## Run it

Requires Node 20.19 or newer (or 22.12+), which is what Vite needs.

```bash
cd front-end
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build on port 4173 |
| `npm run lint` | Lint with oxlint |

## Try it

Sign up with any email and a password of 8+ characters. Your display name is shown on your logs; your email never is. With "Confirm email" turned off in Supabase Auth you are signed in straight away; with it on, the app asks you to confirm by email first.

Dev-server-only helpers (stripped from production builds):

- Add `?fail=1` to Home, a genre or a search URL to see the error state.

## What's in it

| Route | Page |
|---|---|
| `/` | Home: technology books |
| `/search?q=` | Title search (title only) |
| `/genres/:genre` | Genre results |
| `/books/:id` | Book details, reader logs |
| `/library` | My Library (sign-in required) |
| `/signin`, `/signup` | Authentication |

Rules the app enforces:

- A library is private to its owner.
- A log can only be written for a book in your own library.
- Removing a book from your library deletes your logs for it.
- You can edit and delete only your own logs.
- Logs show display names, never emails.

## Deploying

`vercel.json` rewrites every path to `index.html`, so deep links and refresh work on `/books/:id` and every other route.

## Layout

```
src/
  components/   shared UI (nav bar, cards, forms, log list)
  pages/        one file per route
  data/         Supabase client, Edge Function API client, book service
  state/        app state (auth session, library and logs via supabase-js + RLS)
  utils/        focus and document-title helpers
public/         logo, background image, robots.txt
```
