# FSGS Research Notebook

A daily task tracker and journal for the GMU summer research program
("Immunosuppression and Recurrent FSGS After Kidney Transplantation").
Covers all 25 program weekdays (June 22 \u2013 July 24, 2026), split into:

- **fsgs** \u2014 the actual project tasks (lit review, writing, presentation)
- **r** (required) \u2014 R coding tasks tied to the data/code the mentors provide
- **python** (optional) \u2014 a lighter, optional track for building a personal
  Python portfolio project alongside the required R work

Each day has a checklist plus two journal fields: "What did you learn today?"
and "Questions for your mentor/teacher." Progress and journal entries are
saved in the browser's local storage, so they persist between visits on the
same device/browser (nothing is sent to a server).

Default timezone for all program deadlines shown in the app is **US
Eastern** (matches the actual GMU deadlines, all noon ET).

## Run it locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## Deploy to GitHub Pages

1. Push this project to a new GitHub repo, e.g. `fsgs-research-portal`.
2. In `vite.config.js`, make sure `base` matches your repo name exactly:
   ```js
   base: "/fsgs-research-portal/",
   ```
3. Install the deploy helper and publish:
   ```bash
   npm install
   npm run build
   npm run deploy
   ```
4. In your repo's Settings \u2192 Pages, set the source to the `gh-pages`
   branch (created automatically by the deploy script).
5. Your app will be live at `https://<your-username>.github.io/fsgs-research-portal/`.

### Alternative: Vercel or Netlify
Both can deploy this repo directly with zero config \u2014 just import the repo
on either platform, using build command `npm run build` and output directory
`dist`. If you use one of these instead of GitHub Pages, change `base` back
to `"/"` in `vite.config.js`.

## Editing the schedule

All day/task data lives in the `DAYS` array near the top of `src/App.jsx`.
Each day has a `date`, `wk` (week number), optional `deadline` text, and a
`tasks` array. Each task has a `track` (`"fsgs"`, `"r"`, or `"py"`) which
controls its badge color, and a `label`.
