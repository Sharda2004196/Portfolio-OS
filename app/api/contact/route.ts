import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

// Where the contact form messages get delivered.
const OWNER_EMAIL = "shardavatsalbhat@gmail.com";

let resendClient: Resend | null = null;

function getResend() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey.startsWith("REPLACE_")) {
      throw new Error("RESEND_API_KEY environment variable is not configured.");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const name = body?.name;
    const email = body?.email;
    const msg = body?.msg;

    // Validate required fields
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    if (typeof msg !== "string" || !msg.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const client = getResend();

    const { data, error } = await client.emails.send({
      from: "Portfolio OS <onboarding@resend.dev>",
      to: [OWNER_EMAIL],
      replyTo: email,
      subject: `New portfolio message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${msg}`,
    });

    if (error) {
      console.error("Resend API error in contact route:", error);
      return NextResponse.json({ error: "Message could not be delivered." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (err: any) {
    console.error("Contact route error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
