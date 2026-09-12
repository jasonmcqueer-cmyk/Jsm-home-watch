# JSM Home Watch & Property Care Services

A high-converting marketing site for **JSM Home Watch & Property Care Services**, a Northern Michigan home watch company.

Tagline: *Peace of mind while you're away.*

## What’s included

- Full-width lakefront hero with service-area badge and primary CTAs
- Trust bar (insured, references, year-round care)
- Six-service grid for home checks, seasonal care, storm visits, vendor access, photo updates, and complete watch
- Monthly and yearly plan comparison
- Lead-capture popup that posts to `/api/contact` and emails `jsmhomewatch@yahoo.com`

The marketing page lives in `app/page.tsx`. Form delivery lives in `app/api/contact/route.ts`.

## Local development

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Production build

```bash
npm run build
npm start
```

## Stack

- Next.js (App Router) + React
- Tailwind CSS
- Lucide icons

Deploy on Vercel with the default Next.js settings. No environment variables are required.

The contact form is delivered to `jsmhomewatch@yahoo.com` through FormSubmit.

The first live submission sends an activation email to that inbox. Open it, confirm once, and every request after that lands in Yahoo automatically.
