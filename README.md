# JSM Home Watch & Property Care Services

A high-converting marketing site for **JSM Home Watch & Property Care Services**, a Northern Michigan home watch company.

Tagline: *Peace of mind while you're away.*

## What’s included

- Full-width lakefront hero with service-area badge and primary CTAs
- Trust bar (insured, references, year-round care)
- Six-service grid for home checks, seasonal care, storm visits, vendor access, photo updates, and complete watch
- Monthly and yearly plan comparison
- Lead-capture popup (name, email, phone, property type, plan, message) that opens from Request Service and plan CTAs, then emails `jsmhomewatch@yahoo.com`

The entire page lives in `app/page.tsx` so the site stays a single responsive layout.

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

Deploy on Vercel with the default Next.js settings. No environment variables are required; the contact form uses a `mailto:` handoff to the published inbox.
