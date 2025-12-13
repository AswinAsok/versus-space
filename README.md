# versus.space, quick explainer 🎉

Think “live tug-of-war for opinions.” You create a poll with two options, drop a link, and watch people mash the vote button. The bars grow and shrink in real time with a speedometer vibe, floating numbers, and the occasional crown for the leader.

## What it’s great for

- Icebreakers, all-hands, quick debates, “this vs that” showdowns.
- Seeing momentum, not just totals—rate and streaks keep the room excited.
- Lightweight shareability: one link, no installs.

## How to use

- Open the app and sign up/in with email and password.
- Create or open a poll; share the URL with your crowd.
- Each click adds a point. The interface shows rate (pts/sec), total points, and playful effects for streaks.
- Leaderboard feel: the wider bar wins; keep an eye on the animated gauges.
- For presenters: mirror the UI on a big screen and let the audience tap away on their devices.

## Running it yourself (short version)

- Requirements: Node 18+, npm.
- Clone, `npm install`, create `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then `npm run dev`.
- Build + preview: `npm run build` then `npm run preview`.

## Tiny tech peek

- Frontend: React + Vite + TypeScript, styled with CSS modules.
- Realtime + auth: Supabase client (`src/lib/supabaseClient.ts`); current flow is email/password.
- UI neighborhoods: polls in `src/components/Poll/`, auth in `src/components/Auth/`.
- Animations/visuals: custom CSS, `react-d3-speedometer` for gauges, CountUp/Counter bits for numbers.
