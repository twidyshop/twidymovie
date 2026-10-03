# TWYMOVIE

Premium, mobile-first website for Movie, Anime & Komik powered by the Sansekai API.

## Scope

- Movie — MovieBox
- Anime — Sansekai Anime
- Komik — Sansekai Komik
- Drama intentionally excluded because the separate TPlay project handles short drama.

## Stack

Next.js App Router, TypeScript, Tailwind CSS and Vercel.

## Run locally

npm install
cp .env.example .env.local
npm run dev

Default upstream: https://api.sansekai.my.id/api
Override with SANSEKAI_BASE_URL when needed.

## Included

- Cinematic premium dark UI
- Responsive desktop/mobile layout
- Home with Trending, Movie, Anime and Komik
- Search across all three content types
- Movie watch page
- Anime watch page
- Komik reader
- Server-side Sansekai fetching with Next.js revalidation

Sansekai documents a demonstration rate limit of 10 requests/minute, so the app uses server-side caching/revalidation to reduce repeated upstream requests.

Before public production use, review the upstream API terms, source availability, and applicable content rights.