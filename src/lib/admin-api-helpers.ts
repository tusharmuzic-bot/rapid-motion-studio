import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { AdminUser } from "./types";

export const assetUrlSchema = z
  .string()
  .trim()
  .max(1000)
  .refine(
    (val) => {
      if (!val) return true;
      if (val.startsWith("/")) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
      } catch {
        return false;
      }
    },
    { message: "Must be a valid http(s) URL or local /media path" }
  );

export async function logAdminActivity(
  supabase: SupabaseClient,
  admin: AdminUser,
  eventType: string,
  entityType: string,
  entityId: string | null,
  summary: string,
  metadata: Record<string, unknown> = {}
) {
  await supabase.from("activity_logs").insert({
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    summary,
    metadata,
    actor_email: admin.email,
  });
}

export function zodErrorResponse(error: z.ZodError) {
  return NextResponse.json(
    {
      error: error.issues[0]?.message || "Validation failed",
      issues: error.issues,
    },
    { status: 400 }
  );
}
