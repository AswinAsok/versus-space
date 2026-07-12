# versus.space

![versus.space preview](public/meta/meta-preview-2.png)

live tug-of-war for opinions. create a poll with two options, drop a link, and watch people vote in real time. bars grow and shrink with speedometer vibes, floating numbers, and the occasional crown for the leader.

## demo

[![Watch the demo](https://img.youtube.com/vi/WhY-RmY92qU/maxresdefault.jpg)](https://youtu.be/WhY-RmY92qU)

## what it's for

- icebreakers, all-hands, quick debates, "this vs that" showdowns
- seeing momentum, not just totals—rate and streaks keep it exciting
- lightweight: one link, no installs

## how it works

- sign up with email and password
- create a poll, share the URL
- each click adds a point. shows rate (pts/sec), total points, playful streak effects
- wider bar wins; animated gauges show the battle
- for presenters: mirror on a big screen, let audience tap on their devices

## running locally

**requirements:** Node 18+, npm

```bash
# clone and install
git clone <repo-url>
npm install

# create .env with:
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_ANON_KEY=your_key
# Optional when the Worker API is on another origin: VITE_API_BASE_URL=http://127.0.0.1:8787

# run dev server
npm run dev

# build for production
npm run build
npm run preview
```

## tech stack

- **frontend:** React + Vite + TypeScript, CSS modules
- **backend:** Cloudflare Workers, D1, and Durable Objects
- **auth:** Supabase Auth (email/password flow), intentionally retained after the data cutover
- **structure:** polls in `src/components/Poll/`, auth in `src/components/Auth/`
- **visuals:** custom CSS, `react-d3-speedometer` for gauges, CountUp for animationss

## architecture

- `worker/`: Cloudflare Worker API, payment webhook, Cron handler, and poll-room Durable Object.
- `src/core/infrastructure/cloudflare`: poll, profile, vote, and realtime services.
- `src/core/infrastructure/supabase`: retained Supabase Auth service.
- `src/core/appServices.ts`: composition root for Cloudflare data services and Supabase Auth.
- Meta assets live under `public/meta` to keep the public root clean.
