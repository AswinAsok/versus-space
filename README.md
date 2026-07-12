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

# copy .env.example to .env for browser configuration
# copy worker/.env.example to worker/.env for local Worker configuration

# apply local D1 migrations and run the full Worker-backed app
npm run d1:migrate:local
npm run cf:dev

# build for production
npm run build
npm run preview
```

## tech stack

- **frontend:** React + Vite + TypeScript, CSS modules
- **backend:** Cloudflare Workers, D1, and Durable Objects
- **auth:** Better Auth on Cloudflare Workers and D1
- **structure:** polls in `src/components/Poll/`, auth in `src/components/Auth/`
- **visuals:** custom CSS, `react-d3-speedometer` for gauges, CountUp for animationss

## architecture

- `worker/`: Cloudflare Worker API, Better Auth, transactional auth email, payment webhook, Cron handler, and poll-room Durable Object.
- `src/core/infrastructure/cloudflare`: poll, profile, vote, and realtime services.
- `src/core/appServices.ts`: composition root for Cloudflare data and auth services.
- Meta assets live under `public/meta` to keep the public root clean.
