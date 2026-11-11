"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Film,
  Inbox,
  Briefcase,
  FolderKanban,
  ArrowUpRight,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import type { ActivityLog, ClientInquiry } from "@/lib/types";
import { formatDateShort } from "@/lib/utils";

interface OverviewData {
  kpis: {
    totalProjects: number;
    publishedProjects: number;
    demoProjects: number;
    clientProjects: number;
    newInquiries: number;
    totalInquiries: number;
    publishedServices: number;
    mediaAssets: number;
  };
  recentInquiries: Pick<
    ClientInquiry,
    | "id"
    | "inquiry_code"
    | "full_name"
    | "brand_name"
    | "required_service"
    | "status"
    | "source_type"
    | "created_at"
  >[];
  activityLogs: ActivityLog[];
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/overview", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (mounted) setData(json);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const kpis = data?.kpis;

  const cards = [
    {
      label: "New Client Inquiries",
      value: kpis?.newInquiries ?? 0,
      sub: `${kpis?.totalInquiries ?? 0} total briefs & messages`,
      href: "/admin/inquiries",
      icon: Inbox,
      accent: "border-gold/35 bg-wine/35",
    },
    {
      label: "Published Portfolio",
      value: kpis?.publishedProjects ?? 0,
      sub: `${kpis?.demoProjects ?? 0} Demo • ${kpis?.clientProjects ?? 0} Client`,
      href: "/admin/portfolio",
      icon: Film,
      accent: "border-ivory/15 bg-charcoal/80",
    },
    {
      label: "Active Services",
      value: kpis?.publishedServices ?? 0,
      sub: "Live service capabilities",
      href: "/admin/services",
      icon: Briefcase,
      accent: "border-ivory/15 bg-charcoal/80",
    },
    {
      label: "Media Library",
      value: kpis?.mediaAssets ?? 0,
      sub: "Videos, posters & assets",
      href: "/admin/media",
      icon: FolderKanban,
      accent: "border-ivory/15 bg-charcoal/80",
    },
  ];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Studio Overview"
        title="RAPID MOTION Control"
        description="Monitor live portfolio works, incoming campaign briefs, video slots, and real-time studio audit activity."
        actions={
          <Link
            href="/admin/portfolio"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-warm px-4 py-2.5 text-xs font-semibold text-obsidian transition hover:brightness-105"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Manage Portfolio
          </Link>
        }
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className={`group rounded-2xl border p-5 transition hover:border-gold/45 ${card.accent}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-ivory/65">
                  {card.label}
                </span>
                <Icon className="h-4 w-4 text-gold" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-ivory">
                {card.value}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-ivory/55">
                <span>{card.sub}</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Inquiries + Activity Log */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="glass-card rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-ivory">
                Recent Client Inquiries
              </h2>
              <p className="text-xs text-ivory/55">
                Latest submissions from Start a Project &amp; Contact
              </p>
            </div>
            <Link
              href="/admin/inquiries"
              className="text-xs font-medium text-gold hover:underline"
            >
              Open CRM
            </Link>
          </div>

          {!data?.recentInquiries?.length ? (
            <p className="rounded-2xl border border-ivory/10 bg-charcoal/50 px-4 py-8 text-center text-sm text-ivory/55">
              No inquiries submitted yet. New client briefs appear here
              automatically.
            </p>
          ) : (
            <div className="space-y-2.5">
              {data.recentInquiries.map((inq) => (
                <Link
                  key={inq.id}
                  href={`/admin/inquiries?highlight=${inq.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-ivory/10 bg-charcoal/65 px-4 py-3 transition hover:border-gold/35"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-gold">
                        {inq.inquiry_code}
                      </span>
                      <span className="truncate text-sm font-medium text-ivory">
                        {inq.full_name}
                      </span>
                      {inq.brand_name ? (
                        <span className="hidden truncate text-xs text-ivory/50 sm:inline">
                          • {inq.brand_name}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ivory/55">
                      {inq.required_service || "General Studio Inquiry"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-block rounded-full border border-gold/25 bg-wine/50 px-2.5 py-0.5 text-[10px] font-medium text-gold">
                      {inq.status}
                    </span>
                    <p className="mt-1 text-[10px] text-ivory/45">
                      {formatDateShort(inq.created_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="glass-card rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-ivory">
                Studio Activity Log
              </h2>
              <p className="text-xs text-ivory/55">
                Audit trail across content, media &amp; client briefs
              </p>
            </div>
            <Clock className="h-4 w-4 text-gold/75" />
          </div>

          {!data?.activityLogs?.length ? (
            <p className="rounded-2xl border border-ivory/10 bg-charcoal/50 px-4 py-8 text-center text-sm text-ivory/55">
              Activity events will populate as edits are saved.
            </p>
          ) : (
            <div className="space-y-2.5">
              {data.activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-ivory/10 bg-charcoal/55 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-medium text-ivory/90">
                      {log.summary}
                    </p>
                    <span className="shrink-0 font-mono text-[10px] text-ivory/45">
                      {formatDateShort(log.created_at)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-ivory/50">
                    <span className="text-gold/80">{log.event_type}</span>
                    {log.actor_email ? <span>• {log.actor_email}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
