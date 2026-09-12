import { NextResponse } from "next/server";

type ContactBody = {
  name?: string;
  email?: string;
  phone?: string;
  propertyType?: string;
  plan?: string;
  message?: string;
  website?: string;
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: ContactBody;

  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (asString(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const name = asString(body.name);
  const email = asString(body.email);
  const phone = asString(body.phone);
  const propertyType = asString(body.propertyType);
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

  return NextResponse.json({ ok: true, deliver: "client" });
}
