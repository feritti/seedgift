import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { contactFormEmail } from "@/lib/email-templates";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_EMAIL = "peteryan4721@gmail.com";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, subject, message } = body;

  // Validate
  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (typeof name !== "string" || name.trim().length < 1 || name.length > 100) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_REGEX.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (typeof subject !== "string" || subject.trim().length < 1 || subject.length > 200) {
    return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
  }

  if (typeof message !== "string" || message.trim().length < 1 || message.length > 5000) {
    return NextResponse.json({ error: "Message must be under 5000 characters" }, { status: 400 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "SeedGift Contact <noreply@seedgift.xyz>",
      to: CONTACT_EMAIL,
      replyTo: email.trim(),
      subject: `[SeedGift Contact] ${subject.trim()}`,
      html: contactFormEmail({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      }),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
