import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendCsatSurveyEmail } from "@/lib/email";

const FALLBACK_EMAIL = "rizqyyourin6@gmail.com";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const toEmail: string = body.email?.trim() || FALLBACK_EMAIL;

  // Basic email format guard
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const settings = await prisma.csatSettings.findFirst();
  const question = settings?.question ?? "How satisfied are you with our support?";

  const csatToken = "test-preview-token";

  try {
    await sendCsatSurveyEmail({
      to: toEmail,
      customerName: "Test Customer",
      ticketNumber: "SR0000",
      ticketSubject: "Test CSAT preview",
      question,
      csatToken,
    });

    return NextResponse.json({ ok: true, sentTo: toEmail });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
