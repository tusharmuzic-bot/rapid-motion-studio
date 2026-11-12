import crypto from "node:crypto";
import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || "/admin";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      // Complete initial owner claim if pending bootstrap cookie is present
      const cookieStore = await cookies();
      const pendingName = cookieStore.get("rms_pending_owner")?.value;
      const setupToken = process.env.ADMIN_SETUP_TOKEN;
      if (pendingName && setupToken) {
        const tokenHash = crypto
          .createHash("sha256")
          .update(setupToken)
          .digest("hex");
        await supabase.rpc("claim_initial_admin", {
          p_full_name: decodeURIComponent(pendingName),
          p_token_hash: tokenHash,
        });
        cookieStore.delete("rms_pending_owner");
      }
      redirect(next.startsWith("/") ? next : "/admin");
    }
  }

  redirect("/admin/login?error=auth_confirm_failed");
}
