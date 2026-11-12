import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

const bootstrapSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  email: z.string().trim().email("Valid email is required").max(200),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128),
  setupToken: z.string().min(8, "Setup token is required"),
});

function timingSafeMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  try {
    const expectedToken = process.env.ADMIN_SETUP_TOKEN;
    if (!expectedToken) {
      return NextResponse.json(
        { error: "ADMIN_SETUP_TOKEN is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parsed = bootstrapSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { fullName, email, password, setupToken } = parsed.data;
    if (!timingSafeMatch(setupToken.trim(), expectedToken.trim())) {
      return NextResponse.json(
        { error: "Invalid Studio Setup Token." },
        { status: 403 }
      );
    }

    const supabase = await createClient();
    const { data: stateRow } = await supabase
      .from("app_bootstrap_state")
      .select("admin_initialized")
      .eq("id", 1)
      .maybeSingle();

    if (stateRow?.admin_initialized) {
      return NextResponse.json(
        { error: "Studio administrator is already initialized." },
        { status: 409 }
      );
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(expectedToken.trim())
      .digest("hex");

    // If SUPABASE_SERVICE_ROLE_KEY is present, create confirmed user immediately
    const serviceClient = createServiceRoleClient();
    if (serviceClient) {
      const { data: created, error: createErr } =
        await serviceClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });
      if (createErr || !created.user) {
        return NextResponse.json(
          { error: createErr?.message || "Failed to create owner account." },
          { status: 400 }
        );
      }

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr) {
        return NextResponse.json(
          { error: signInErr.message },
          { status: 400 }
        );
      }

      const { error: claimErr } = await supabase.rpc("claim_initial_admin", {
        p_full_name: fullName,
        p_token_hash: tokenHash,
      });
      if (claimErr) {
        return NextResponse.json(
          { error: claimErr.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        initialized: true,
        requiresEmailConfirm: false,
      });
    }

    // Standard publishable-key flow
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/confirm?next=/admin`,
        data: { full_name: fullName },
      },
    });

    if (signUpErr) {
      return NextResponse.json({ error: signUpErr.message }, { status: 400 });
    }

    if (signUpData.session) {
      const { error: claimErr } = await supabase.rpc("claim_initial_admin", {
        p_full_name: fullName,
        p_token_hash: tokenHash,
      });
      if (claimErr) {
        return NextResponse.json(
          { error: claimErr.message },
          { status: 400 }
        );
      }
      return NextResponse.json({
        initialized: true,
        requiresEmailConfirm: false,
      });
    }

    // Email confirmation required on hosted Supabase Auth
    const cookieStore = await cookies();
    cookieStore.set("rms_pending_owner", encodeURIComponent(fullName), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 30,
      path: "/",
    });

    return NextResponse.json({
      initialized: false,
      requiresEmailConfirm: true,
      message:
        "Confirmation email sent. Click the verification link in your inbox to activate your Super Admin account.",
    });
  } catch (err) {
    console.error("POST /api/admin/bootstrap error:", err);
    return NextResponse.json(
      { error: "Unable to complete studio setup." },
      { status: 500 }
    );
  }
}
