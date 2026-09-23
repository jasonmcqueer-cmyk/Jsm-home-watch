import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

const CONTACT_EMAIL = "jsmhomewatch@gmail.com";
const STORE = join(process.cwd(), "data", "submissions.json");

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

async function saveSubmission(entry: Record<string, string>) {
  await mkdir(join(process.cwd(), "data"), { recursive: true });
  let existing: Record<string, string>[] = [];
  try {
    existing = JSON.parse(await readFile(STORE, "utf8")) as Record<
      string,
      string
    >[];
    if (!Array.isArray(existing)) existing = [];
  } catch {
    existing = [];
  }
  existing.push(entry);
  await writeFile(STORE, JSON.stringify(existing, null, 2));
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

  try {
    await saveSubmission({
      receivedAt: new Date().toISOString(),
      name,
      email,
      phone,
      propertyType,
      plan,
      message,
      destination: CONTACT_EMAIL,
    });
  } catch {
    return NextResponse.json(
      {
        error: `We couldn't save that just now. Email ${CONTACT_EMAIL} directly.`,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
