import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
]);

const signSchema = z.object({
  sessionFolderId: z.string().regex(/^[0-9a-zA-Z-]+$/).min(8).max(80),
  fileName: z.string().regex(/^[0-9A-Za-z._-]+$/).min(1).max(160),
  mimeType: z.string().refine((val) => ALLOWED_MIME_TYPES.has(val), {
    message: "Unsupported file type.",
  }),
  sizeBytes: z.number().int().positive().max(52_428_800),
});

// Simple per-instance rate window to curb abusive upload signing calls
const uploadWindow = new Map<string, { count: number; resetAt: number }>();

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const now = Date.now();
    const bucket = uploadWindow.get(ip);
    if (!bucket || bucket.resetAt < now) {
      uploadWindow.set(ip, { count: 1, resetAt: now + 60_000 });
    } else if (bucket.count >= 25) {
      return NextResponse.json(
        { error: "Upload rate limit exceeded. Try again shortly." },
        { status: 429 }
      );
    } else {
      bucket.count += 1;
    }

    const body = await request.json();
    const parsed = signSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid file metadata" },
        { status: 400 }
      );
    }

    const { sessionFolderId, fileName } = parsed.data;
    const storagePath = `inquiries/${sessionFolderId}/${fileName}`;

    // If SUPABASE_SERVICE_ROLE_KEY is configured, generate a true signed upload URL
    const adminClient = createServiceRoleClient();
    if (adminClient) {
      const { data, error } = await adminClient.storage
        .from("inquiry-uploads")
        .createSignedUploadUrl(storagePath);
      if (error) {
        console.error("Signed upload URL error:", error);
        return NextResponse.json(
          { error: "Unable to create signed upload URL." },
          { status: 500 }
        );
      }
      return NextResponse.json({
        storagePath,
        signedUrl: data.signedUrl,
        token: data.token,
      });
    }

    // Otherwise fall back cleanly to validated direct INSERT-only Storage upload
    return NextResponse.json({
      storagePath,
      signedUrl: null,
    });
  } catch (err) {
    console.error("sign-upload route error:", err);
    return NextResponse.json(
      { error: "Unable to initialize file upload." },
      { status: 500 }
    );
  }
}
