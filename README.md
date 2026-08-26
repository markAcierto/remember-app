# Remember — starter app

A working starter for the REMEMBER app: courses, daily check-in log, and a community feed.
Built with Next.js + Tailwind, branded with the Kyria Mailman colours and fonts (hot pink
#FF1FA9, black, white, bronze accent, Playfair Display + Inter). Currently running on mock
data (`lib/mock-data.ts`) so the whole UI works before any backend is connected.

## Run it locally

You'll need [Node.js](https://nodejs.org) installed (v18 or later).

```
cd remember-app
npm install
npm run dev
```

Then open http://localhost:3000. On your phone, open the same URL (once deployed — see below)
in Safari or Chrome and choose "Add to Home Screen" — that's what makes it install like an app.

## What's built

- `app/page.tsx` — home community feed (breakthroughs + daily check-ins). Tries Supabase
  first, falls back to mock posts if no database is connected yet, so it always renders.
- `app/courses/page.tsx` — the 8 REMEMBER pillars with progress states
- `app/courses/[slug]/page.tsx` — lesson list for one pillar (up to 10 filming-idea lessons
  each, matching `REMEMBER_Course_Filming_Script.docx`) plus its affirmation and daily
  check-in question
- `app/log/page.tsx` — daily check-in against the 8 pillars, posts to Supabase if signed in
- `app/login/page.tsx` + `app/auth/callback/route.ts` — email/password sign up and sign in
- `app/profile/page.tsx` — shows signed-in state, streak, breakthroughs, pillar history
- `middleware.ts` — keeps the Supabase session alive across requests (standard setup, no
  changes needed)
- `components/BottomNav.tsx` — Home / Courses / Log / Profile navigation
- `public/manifest.json` — makes it installable as an app on phones (PWA)

The app is fully browsable right now on mock data (`lib/mock-data.ts`) — every screen works
with no backend connected. Once Supabase is wired up (below), real data takes over
automatically without any UI changes.

## Connecting real data (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` — creates the tables for profiles, courses,
   lessons, progress, and daily logs, with security rules so people can only edit their own
   data.
3. Then run `supabase/seed.sql` — pre-fills the 8 pillar courses and their lesson titles so
   the course section has real content from the start.
4. In Authentication > Providers, make sure Email is enabled (it is by default).
5. Copy `.env.local.example` to `.env.local` and fill in your project URL and anon key
   (found in Supabase under Project Settings > API).
6. That's it — `app/page.tsx`, `app/log/page.tsx`, and `app/profile/page.tsx` already call
   Supabase and will start using real data as soon as the env vars are set.

One thing not yet automated: when someone signs up, a matching row needs to be created in
`profiles` (for their display name and avatar initials). The simplest way is a Supabase
database trigger on `auth.users` — I can add that SQL next pass, or you can create it from
the Supabase dashboard under Database > Triggers.

## Deploying (near-zero cost)

1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, import the repo.
3. Add your Supabase env vars in the Vercel project settings.
4. Deploy — Vercel gives you a live URL immediately, free tier covers early usage.
5. Point your own domain at it later under Vercel > Domains.

## Still needed before this is client-ready

- Export your logo and app icons (192x192 and 512x512 PNG) from Canva into `public/icons/`.
- Real course video hosting — Supabase Storage works for small scale, or use Mux/Vimeo and
  store just the video URL in the `lessons` table, then swap the lesson list in
  `app/courses/[slug]/page.tsx` from mock titles to real video embeds.
- The `profiles` auto-creation trigger mentioned above.
- Push notifications for community replies (optional, phase 2).
