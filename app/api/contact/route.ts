import { NextResponse } from "next/server";

const CONTACT_EMAIL = "jsmhomewatch@yahoo.com";
const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

type ContactBody = {
  name?: string;
  email?: string;
  phone?: string;
  propertyType?: string;
  plan?: string;
  message?: string;
  website?: string;
  botcheck?: string;
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isSuccessFlag(value: unknown) {
  return value === true || value === "true";
}

async function readBody(request: Request): Promise<ContactBody> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await request.json()) as ContactBody;
  }

  const form = await request.formData();
  const body: Record<string, string> = {};
  form.forEach((value, key) => {
    if (typeof value === "string") body[key] = value;
  });
  return body;
}

function propertyLabel(value: string) {
  if (value === "primary") return "Primary Home";
  if (value === "vacation") return "Vacation Home";
  if (value === "airbnb") return "Airbnb";
  return value || "Not specified";
}

function planLabel(value: string) {
  if (value === "monthly") return "Monthly Watch";
  if (value === "yearly") return "Yearly Watch";
  return value || "Not specified";
}

function subjectFor(plan: string) {
  if (plan === "monthly" || plan === "Monthly Watch") {
    return "Monthly Home Watch Request";
  }
  if (plan === "yearly" || plan === "Yearly Watch") {
    return "Yearly Home Watch Request";
  }
  return "Home Watch Service Request";
}

export async function POST(request: Request) {
  let body: ContactBody;

  try {
    body = await readBody(request);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (asString(body.website) || asString(body.botcheck)) {
    return NextResponse.json({ ok: true });
  }

  const name = asString(body.name);
  const email = asString(body.email);
  const phone = asString(body.phone);
  const propertyType = asString(body.propertyType);
  const plan = asString(body.plan);
  const message = asString(body.message);
  const wantsJson = (request.headers.get("accept") || "").includes(
    "application/json",
  );

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter your name and a valid email." },
      { status: 400 },
    );
  }

  if (phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json(
      { error: "Please enter a 10-digit phone number." },
      { status: 400 },
    );
  }

  if (!propertyType || message.length < 10) {
    return NextResponse.json(
      { error: "Please choose a property type and add a short message." },
      { status: 400 },
    );
  }

  const payload = {
    name,
    email,
    phone,
    "Property Type": propertyLabel(propertyType),
    "Service Plan": planLabel(plan),
    message,
    _subject: subjectFor(plan),
    _template: "table",
    _captcha: "false",
  };

  try {
    const submitResponse = await fetch(FORMSUBMIT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
      },
      body: JSON.stringify(payload),
    });

    let submitPayload: { success?: unknown; message?: string } = {};
    try {
      submitPayload = (await submitResponse.json()) as {
        success?: unknown;
        message?: string;
      };
    } catch {
      submitPayload = {};
    }

    const activate =
      /activat/i.test(submitPayload.message || "") &&
      !isSuccessFlag(submitPayload.success);

    if (activate) {
      return NextResponse.json({
        ok: false,
        activate: true,
        error: `Check ${CONTACT_EMAIL} (and spam) for an email from FormSubmit titled something like "Activate Form". Click that link once, then send this request again.`,
      });
    }

    if (submitResponse.ok && isSuccessFlag(submitPayload.success)) {
      if (!wantsJson) {
        return NextResponse.redirect(new URL("/?sent=1", request.url), 303);
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      {
        error:
          submitPayload.message ||
          `We couldn't send that just now. Email ${CONTACT_EMAIL} directly.`,
      },
      { status: 502 },
    );
  } catch {
    return NextResponse.json(
      {
        error: `We couldn't send that just now. Email ${CONTACT_EMAIL} directly.`,
      },
      { status: 502 },
    );
  }
}
