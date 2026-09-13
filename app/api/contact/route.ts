import { NextResponse } from "next/server";

const CONTACT_EMAIL = "jsmhomewatch@yahoo.com";

export async function POST() {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Send from the website</title>
    <style>
      body { font-family: system-ui, sans-serif; background: #f6f3ea; color: #092416; margin: 0; }
      main { max-width: 36rem; margin: 12vh auto; background: #fff; padding: 2rem; border-radius: 1.5rem; }
      a { color: #00529b; font-weight: 700; }
    </style>
  </head>
  <body>
    <main>
      <h1>Please send from the request form</h1>
      <p>
        Service requests are sent from the website popup so they can reach
        ${CONTACT_EMAIL}. Go back, open Request Service, and tap Send again.
      </p>
      <p>
        Or email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> directly.
      </p>
      <p><a href="/#request-service">Return to JSM Home Watch</a></p>
    </main>
  </body>
</html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
