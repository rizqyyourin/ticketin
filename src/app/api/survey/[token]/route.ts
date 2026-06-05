import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ token: string }> };

/** GET /api/survey/:token — public, returns ticket + survey question */
export async function GET(_req: Request, { params }: Params) {
  const { token } = await params;

  // Allow test token to return a preview payload without DB hit
  if (token === "test-preview-token") {
    const settings = await prisma.csatSettings.findFirst();
    return NextResponse.json({
      ticketNumber: "SR0000",
      question: settings?.question ?? "How satisfied are you with our support?",
      thankYou: settings?.thankYou ?? "Thank you for your feedback! It helps us improve.",
      alreadySubmitted: false,
    });
  }

  const ticket = await prisma.serviceRequest.findUnique({
    where: { csatToken: token },
    select: {
      ticketNumber: true,
      csatSurvey: { select: { id: true } },
    },
  });

  if (!ticket) return NextResponse.json({ error: "Invalid survey link" }, { status: 404 });

  const settings = await prisma.csatSettings.findFirst();

  return NextResponse.json({
    ticketNumber: ticket.ticketNumber,
    question: settings?.question ?? "How satisfied are you with our support?",
    thankYou: settings?.thankYou ?? "Thank you for your feedback! It helps us improve.",
    alreadySubmitted: !!ticket.csatSurvey,
  });
}

/** POST /api/survey/:token — public, submit rating */
export async function POST(request: Request, { params }: Params) {
  const { token } = await params;

  // Block test token from writing to DB
  if (token === "test-preview-token") {
    return NextResponse.json({ ok: true, preview: true });
  }

  const body = await request.json();
  const { rating, comment } = body;

  const validRatings = ["dissatisfied", "neutral", "satisfied"];
  if (!validRatings.includes(rating)) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const ticket = await prisma.serviceRequest.findUnique({
    where: { csatToken: token },
    select: { id: true, csatSurvey: { select: { id: true } } },
  });

  if (!ticket) return NextResponse.json({ error: "Invalid survey link" }, { status: 404 });
  if (ticket.csatSurvey) {
    return NextResponse.json({ error: "Survey already submitted" }, { status: 409 });
  }

  const survey = await prisma.csatSurvey.create({
    data: {
      serviceRequestId: ticket.id,
      rating: rating as "dissatisfied" | "neutral" | "satisfied",
      comment: comment ?? null,
    },
  });

  return NextResponse.json(survey, { status: 201 });
}
