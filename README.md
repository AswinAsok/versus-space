# versus.space

![versus.space preview](public/meta-preview.png)

live tug-of-war for opinions. create a poll with two options, drop a link, and watch people vote in real time. bars grow and shrink with speedometer vibes, floating numbers, and the occasional crown for the leader.

## demo

[![Watch the demo](https://img.youtube.com/vi/lC7ViK-1DhI/maxresdefault.jpg)](https://youtu.be/lC7ViK-1DhI)

*Demo video was recorded in the last hour of submission. Demo v2 coming soon!*

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

# run dev server
npm run dev

# build for production
npm run build
npm run preview
```

## tech stack

- **frontend:** React + Vite + TypeScript, CSS modules
- **realtime + auth:** Supabase (email/password flow)
- **structure:** polls in `src/components/Poll/`, auth in `src/components/Auth/`
- **visuals:** custom CSS, `react-d3-speedometer` for gauges, CountUp for animationss
