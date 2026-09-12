# JSM Home Watch & Property Care Services

A high-converting marketing site for **JSM Home Watch & Property Care Services**, a Northern Michigan home watch company.

Tagline: *Peace of mind while you're away.*

## What’s included

- Full-width lakefront hero with service-area badge and primary CTAs
- Trust bar (insured, background-checked, references, community reputation)
- Four service categories: home watch, grounds & exterior, Airbnb co-hosting, and concierge
- Monthly and yearly plan comparison
- Lead-capture popup that sends through Web3Forms to `jsmhomewatch@yahoo.com`

The marketing page lives in `app/page.tsx`. Field checks live in `app/api/contact/route.ts`.

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

The contact form sends through [Web3Forms](https://web3forms.com) to the verified business inbox. After the site is on Vercel, this can be switched to Resend without changing the popup.
