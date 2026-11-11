import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateInquiryCode } from "@/lib/utils";

const attachmentSchema = z.object({
  fileName: z.string().min(1).max(160),
  mimeType: z.string().min(1).max(100),
  sizeBytes: z.number().int().nonnegative().max(52_428_800),
  storagePath: z.string().regex(/^inquiries\/[0-9a-zA-Z-]+\/[0-9A-Za-z._-]+$/),
});

const inquirySchema = z.object({
  sourceType: z.enum(["project_brief", "contact_message"]).default("project_brief"),
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  brandName: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().email("Valid email is required").max(200),
  whatsapp: z.string().trim().max(50).optional().default(""),
  websiteUrl: z.string().trim().max(300).optional().default(""),
  industry: z.string().trim().max(100).optional().default(""),
  requiredService: z.string().trim().max(120).optional().default(""),
  budgetRange: z.string().trim().max(120).optional().default(""),
  expectedDeliverables: z.string().trim().max(500).optional().default(""),
  preferredTimeline: z.string().trim().max(120).optional().default(""),
  projectDescription: z.string().trim().min(5, "Please include a description").max(4000),
  referenceLinks: z.array(z.string().trim().max(300)).max(15).optional().default([]),
  consentAccepted: z.literal(true),
  honeypot: z.string().optional().default(""),
  attachments: z.array(attachmentSchema).max(10).optional().default([]),
});

const submitRateLimiter = new Map<string, { count: number; resetAt: number }>();

async function sendAcknowledgmentEmail(params: {
  to: string;
  name: string;
  inquiryCode: string;
  service: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const from =
    process.env.RESEND_FROM_EMAIL || "RAPID MOTION STUDIO <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: `Brief Received [${params.inquiryCode}] — RAPID MOTION STUDIO`,
        html: `
          <div style="font-family:Inter,Arial,sans-serif;background:#151313;color:#F5F0E8;padding:32px;border-radius:16px;">
            <p style="letter-spacing:0.2em;color:#D8B477;font-size:11px;text-transform:uppercase;">RAPID MOTION STUDIO</p>
            <h1 style="font-size:24px;margin:12px 0;">Thank you, ${params.name}.</h1>
            <p style="color:#d6cfc7;line-height:1.6;">We have received your ${params.service || "creative production"} inquiry. Our production team is reviewing your brief and materials.</p>
            <p style="margin-top:20px;padding:16px;background:#290B12;border:1px solid #D8B477;border-radius:12px;">
              <strong>Inquiry Reference:</strong> <span style="color:#D8B477;">${params.inquiryCode}</span>
            </p>
          </div>
        `,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("Resend email dispatch error:", err);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const now = Date.now();
    const bucket = submitRateLimiter.get(ip);
    if (!bucket || bucket.resetAt < now) {
      submitRateLimiter.set(ip, { count: 1, resetAt: now + 300_000 });
    } else if (bucket.count >= 10) {
      return NextResponse.json(
        { error: "Too many submissions from this address. Please wait a few minutes." },
        { status: 429 }
      );
    } else {
      bucket.count += 1;
    }

    const body = await request.json();
    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid submission fields" },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    // Silent spam rejection if honeypot filled
    if (payload.honeypot) {
      return NextResponse.json({
        inquiryCode: generateInquiryCode(),
        emailSent: false,
      });
    }

    const supabase = await createClient();
    const inquiryId = crypto.randomUUID();
    const inquiryCode = generateInquiryCode();

    const { error: insertError } = await supabase.from("client_inquiries").insert({
      id: inquiryId,
      inquiry_code: inquiryCode,
      source_type: payload.sourceType,
      full_name: payload.fullName,
      brand_name: payload.brandName,
      email: payload.email,
      whatsapp: payload.whatsapp,
      website_url: payload.websiteUrl,
      industry: payload.industry,
      required_service: payload.requiredService,
      budget_range: payload.budgetRange,
      expected_deliverables: payload.expectedDeliverables,
      preferred_timeline: payload.preferredTimeline,
      project_description: payload.projectDescription,
      reference_links: payload.referenceLinks,
      consent_accepted: true,
      status: "New",
    });

    if (insertError) {
      console.error("Inquiry insert failed:", insertError);
      return NextResponse.json(
        { error: "Failed to save your inquiry. Please verify your details." },
        { status: 500 }
      );
    }

    if (payload.attachments.length > 0) {
      const assetRows = payload.attachments.map((att) => ({
        title: att.fileName,
        alt_text: `Client brief asset: ${att.fileName}`,
        asset_kind: att.mimeType.startsWith("video/")
          ? "video"
          : att.mimeType === "application/pdf"
          ? "document"
          : "image",
        usage_slot: "inquiry_upload",
        bucket_name: "inquiry-uploads",
        storage_path: att.storagePath,
        public_url: "",
        mime_type: att.mimeType,
        file_size_bytes: att.sizeBytes,
        inquiry_id: inquiryId,
      }));

      const { error: mediaError } = await supabase
        .from("media_assets")
        .insert(assetRows);

      if (mediaError) {
        console.error("Media asset link warning:", mediaError);
      }
    }

    await supabase.from("activity_logs").insert({
      event_type: "inquiry_submitted",
      entity_type: "client_inquiry",
      entity_id: inquiryId,
      summary: `New ${payload.sourceType === "contact_message" ? "contact inquiry" : "project brief"} ${inquiryCode} from ${payload.fullName}`,
      metadata: {
        inquiryCode,
        service: payload.requiredService,
        attachments: payload.attachments.length,
      },
      actor_email: payload.email,
    });

    const emailSent = await sendAcknowledgmentEmail({
      to: payload.email,
      name: payload.fullName,
      inquiryCode,
      service: payload.requiredService,
    });

    return NextResponse.json({
      inquiryCode,
      inquiryId,
      emailSent,
    });
  } catch (err) {
    console.error("POST /api/inquiries error:", err);
    return NextResponse.json(
      { error: "Unexpected error processing your request." },
      { status: 500 }
    );
  }
}
