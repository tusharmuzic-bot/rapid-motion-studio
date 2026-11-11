"use client";

import { useCallback, useEffect, useState } from "react";
import { Save, Loader2, Shield, UserPlus, KeyRound } from "lucide-react";
import {
  AdminModal,
  AdminPageHeader,
  adminInputClass,
  adminLabelClass,
  useAdminToast,
} from "@/components/admin/admin-ui";
import { MediaUrlOrUploadField } from "@/components/admin/media-upload-control";
import type { AdminRole, AdminUser, SiteSettings } from "@/lib/types";
import { cn, formatDateShort } from "@/lib/utils";

export default function AdminSettingsPage() {
  const { pushToast } = useAdminToast();
  const [tab, setTab] = useState<"studio" | "admins">("studio");
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [hasServiceKey, setHasServiceKey] = useState(false);

  // Password change form
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  // Add admin modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "admin" as "admin" | "editor",
  });
  const [inviting, setInviting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, accountsRes] = await Promise.all([
        fetch("/api/admin/settings", { cache: "no-store" }),
        fetch("/api/admin/accounts", { cache: "no-store" }),
      ]);
      const sJson = await settingsRes.json();
      const aJson = await accountsRes.json();
      setSettings(sJson.settings ?? null);
      setAdmins(aJson.admins ?? []);
      setCurrentAdmin(aJson.currentAdmin ?? null);
      setHasServiceKey(Boolean(aJson.hasServiceRoleKey));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_name: settings.brand_name,
          tagline: settings.tagline,
          logo_url: settings.logo_url,
          favicon_url: settings.favicon_url,
          announcement_enabled: settings.announcement_enabled,
          announcement_text: settings.announcement_text,
          contact_email: settings.contact_email,
          whatsapp_number: settings.whatsapp_number,
          social_links: settings.social_links,
          theme_accent: settings.theme_accent,
          seo_title: settings.seo_title,
          seo_description: settings.seo_description,
          og_image_url: settings.og_image_url,
          footer_tagline: settings.footer_tagline,
          footer_copyright: settings.footer_copyright,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        pushToast(j.error || "Could not save settings", "error");
        return;
      }
      pushToast("Global studio settings saved & published", "success");
    } finally {
      setSavingSettings(false);
    }
  }

  async function changeOwnPassword(e: React.FormEvent) {
    e.preventDefault();
    setChangingPw(true);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_password",
          new_password: newPassword,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        pushToast(json.error || "Password update failed", "error");
        return;
      }
      setNewPassword("");
      pushToast("Your admin password has been updated", "success");
    } finally {
      setChangingPw(false);
    }
  }

  async function updateAdminRow(
    id: string,
    patch: { role?: AdminRole; is_active?: boolean }
  ) {
    const res = await fetch("/api/admin/accounts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update_admin",
        id,
        ...patch,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      pushToast(json.error || "Update failed", "error");
      return;
    }
    setAdmins((prev) => prev.map((a) => (a.id === id ? json.admin : a)));
    pushToast("Admin permissions updated", "success");
  }

  async function createAdminAccount(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });
      const json = await res.json();
      if (!res.ok) {
        pushToast(json.error || "Could not create team admin", "error");
        return;
      }
      pushToast(`Created admin account for ${inviteForm.email}`, "success");
      setInviteOpen(false);
      setInviteForm({ full_name: "", email: "", password: "", role: "admin" });
      await loadData();
    } finally {
      setInviting(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Modules J & K • Configuration"
        title="Global Studio Settings & Admins"
        description="Manage brand identity, contact channels, SEO metadata, announcement bar, and admin team credentials."
      />

      <div className="mb-6 inline-flex rounded-xl border border-ivory/15 bg-charcoal p-1">
        <button
          type="button"
          onClick={() => setTab("studio")}
          className={cn(
            "rounded-lg px-4 py-1.5 text-xs font-medium transition",
            tab === "studio" ? "bg-wine text-gold" : "text-ivory/65 hover:text-ivory"
          )}
        >
          Studio &amp; SEO Settings
        </button>
        <button
          type="button"
          onClick={() => setTab("admins")}
          className={cn(
            "rounded-lg px-4 py-1.5 text-xs font-medium transition",
            tab === "admins" ? "bg-wine text-gold" : "text-ivory/65 hover:text-ivory"
          )}
        >
          Admin Accounts &amp; Security
        </button>
      </div>

      {loading || !settings ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : tab === "studio" ? (
        <form onSubmit={saveSettings} className="space-y-6">
          <div className="glass-card space-y-5 rounded-3xl p-6">
            <h2 className="font-display text-lg font-semibold text-ivory">
              Brand Identity &amp; Announcement Bar
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={adminLabelClass}>Brand Name</label>
                <input
                  type="text"
                  value={settings.brand_name}
                  onChange={(e) =>
                    setSettings({ ...settings, brand_name: e.target.value })
                  }
                  className={adminInputClass}
                />
              </div>
              <div>
                <label className={adminLabelClass}>Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) =>
                    setSettings({ ...settings, tagline: e.target.value })
                  }
                  className={adminInputClass}
                />
              </div>
              <div>
                <label className={adminLabelClass}>Official Brand Logo PNG</label>
                <MediaUrlOrUploadField
                  assetKind="image"
                  usageSlot="general"
                  value={settings.logo_url}
                  onChange={(url) => setSettings({ ...settings, logo_url: url })}
                />
                {settings.logo_url ? (
                  <div className="mt-2 flex items-center gap-4">
                    <div className="rounded-xl border border-ivory/15 bg-obsidian px-4 py-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={settings.logo_url}
                        alt="Logo on dark background"
                        className="h-6 w-auto object-contain"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
              <div>
                <label className={adminLabelClass}>Browser Favicon URL</label>
                <MediaUrlOrUploadField
                  assetKind="image"
                  usageSlot="general"
                  value={settings.favicon_url}
                  onChange={(url) =>
                    setSettings({ ...settings, favicon_url: url })
                  }
                />
              </div>
              <div>
                <label className={adminLabelClass}>Open Graph Share Image</label>
                <MediaUrlOrUploadField
                  assetKind="image"
                  usageSlot="general"
                  value={settings.og_image_url}
                  onChange={(url) =>
                    setSettings({ ...settings, og_image_url: url })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-ivory/10 pt-4 sm:grid-cols-5">
              {[
                { key: "burgundy", label: "Deep Burgundy" },
                { key: "wine", label: "Dark Wine" },
                { key: "gold", label: "Champagne Gold" },
                { key: "ivory", label: "Warm Ivory" },
                { key: "charcoal", label: "Charcoal" },
              ].map((swatch) => (
                <div key={swatch.key}>
                  <label className={adminLabelClass}>{swatch.label}</label>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-6 w-6 shrink-0 rounded-lg border border-ivory/25"
                      style={{
                        backgroundColor:
                          settings.theme_accent?.[swatch.key] || "#151313",
                      }}
                    />
                    <input
                      type="text"
                      value={settings.theme_accent?.[swatch.key] || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          theme_accent: {
                            ...settings.theme_accent,
                            [swatch.key]: e.target.value,
                          },
                        })
                      }
                      className={`${adminInputClass} font-mono text-xs`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-ivory/10 bg-charcoal/60 p-4">
              <label className="mb-3 flex items-center gap-2 text-xs font-medium text-ivory">
                <input
                  type="checkbox"
                  checked={settings.announcement_enabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcement_enabled: e.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-gold"
                />
                Enable Top Studio Announcement Banner
              </label>
              <input
                type="text"
                value={settings.announcement_text}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    announcement_text: e.target.value,
                  })
                }
                placeholder="Now booking Q4 commercial productions..."
                className={adminInputClass}
              />
            </div>
          </div>

          <div className="glass-card space-y-5 rounded-3xl p-6">
            <h2 className="font-display text-lg font-semibold text-ivory">
              Contact Channels &amp; Social Profiles (Optional)
            </h2>
            <p className="text-xs text-ivory/55">
              Leave blank to hide direct email or WhatsApp links cleanly across
              public contact and footer cards.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={adminLabelClass}>Contact Email</label>
                <input
                  type="email"
                  value={settings.contact_email}
                  onChange={(e) =>
                    setSettings({ ...settings, contact_email: e.target.value })
                  }
                  placeholder="hello@rapidmotion.studio"
                  className={adminInputClass}
                />
              </div>
              <div>
                <label className={adminLabelClass}>WhatsApp Number</label>
                <input
                  type="text"
                  value={settings.whatsapp_number}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      whatsapp_number: e.target.value,
                    })
                  }
                  placeholder="+1..."
                  className={adminInputClass}
                />
              </div>
              {["instagram", "youtube", "linkedin", "vimeo"].map((net) => (
                <div key={net}>
                  <label className={adminLabelClass}>{net} URL</label>
                  <input
                    type="url"
                    value={settings.social_links?.[net] || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        social_links: {
                          ...settings.social_links,
                          [net]: e.target.value,
                        },
                      })
                    }
                    placeholder={`https://${net}.com/...`}
                    className={adminInputClass}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card space-y-4 rounded-3xl p-6">
            <h2 className="font-display text-lg font-semibold text-ivory">
              SEO &amp; Footer Copy
            </h2>
            <div>
              <label className={adminLabelClass}>Default SEO Title</label>
              <input
                type="text"
                value={settings.seo_title}
                onChange={(e) =>
                  setSettings({ ...settings, seo_title: e.target.value })
                }
                className={adminInputClass}
              />
            </div>
            <div>
              <label className={adminLabelClass}>Default SEO Description</label>
              <textarea
                rows={2}
                value={settings.seo_description}
                onChange={(e) =>
                  setSettings({ ...settings, seo_description: e.target.value })
                }
                className={adminInputClass}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={adminLabelClass}>Footer Tagline</label>
                <input
                  type="text"
                  value={settings.footer_tagline}
                  onChange={(e) =>
                    setSettings({ ...settings, footer_tagline: e.target.value })
                  }
                  className={adminInputClass}
                />
              </div>
              <div>
                <label className={adminLabelClass}>Copyright Label</label>
                <input
                  type="text"
                  value={settings.footer_copyright}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      footer_copyright: e.target.value,
                    })
                  }
                  className={adminInputClass}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-warm px-6 py-3 text-sm font-semibold text-obsidian disabled:opacity-50"
            >
              {savingSettings ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Global Settings
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="font-display text-lg font-semibold text-ivory">
              Update Your Password
            </h2>
            <p className="mt-1 text-xs text-ivory/60">
              Signed in as {currentAdmin?.email} ({currentAdmin?.role})
            </p>
            <form
              onSubmit={changeOwnPassword}
              className="mt-4 flex flex-wrap items-end gap-3"
            >
              <div className="min-w-[240px] flex-1 max-w-md">
                <label className={adminLabelClass}>
                  New Password (min 10 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={10}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={adminInputClass}
                />
              </div>
              <button
                type="submit"
                disabled={changingPw}
                className="inline-flex items-center gap-2 rounded-xl border border-gold/35 bg-gold/15 px-4 py-2.5 text-xs font-semibold text-gold hover:bg-gold/25"
              >
                <KeyRound className="h-3.5 w-3.5" />
                {changingPw ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-ivory">
                  Studio Team Administrators
                </h2>
                <p className="text-xs text-ivory/55">
                  {hasServiceKey
                    ? "Server Service Role Key detected — direct team provisioning is active."
                    : "Note: Adding new team accounts from this UI requires SUPABASE_SERVICE_ROLE_KEY in Vercel/server environment variables."}
                </p>
              </div>
              {currentAdmin?.role === "super_admin" ? (
                <button
                  type="button"
                  onClick={() => setInviteOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold to-gold-warm px-3.5 py-2 text-xs font-semibold text-obsidian"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Add Team Admin
                </button>
              ) : null}
            </div>

            <div className="space-y-3">
              {admins.map((adm) => (
                <div
                  key={adm.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ivory/10 bg-charcoal/70 px-4 py-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-gold" />
                      <span className="text-sm font-medium text-ivory">
                        {adm.full_name || adm.email}
                      </span>
                      <span className="rounded-full border border-gold/25 bg-wine/50 px-2 py-0.5 font-mono text-[10px] text-gold">
                        {adm.role}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-ivory/55">
                      {adm.email}
                      {adm.last_login_at
                        ? ` • Last login ${formatDateShort(adm.last_login_at)}`
                        : ""}
                    </p>
                  </div>

                  {currentAdmin?.role === "super_admin" &&
                  adm.id !== currentAdmin.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={adm.role}
                        onChange={(e) =>
                          updateAdminRow(adm.id, {
                            role: e.target.value as AdminRole,
                          })
                        }
                        className="rounded-lg border border-ivory/15 bg-obsidian px-2.5 py-1 text-xs text-ivory"
                      >
                        <option value="super_admin">super_admin</option>
                        <option value="admin">admin</option>
                        <option value="editor">editor</option>
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          updateAdminRow(adm.id, { is_active: !adm.is_active })
                        }
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-xs",
                          adm.is_active
                            ? "border-emerald-400/30 text-emerald-200"
                            : "border-rose-400/30 text-rose-200"
                        )}
                      >
                        {adm.is_active ? "Active" : "Suspended"}
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AdminModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Provision Team Administrator"
        maxWidth="max-w-md"
      >
        <form onSubmit={createAdminAccount} className="space-y-4">
          {!hasServiceKey ? (
            <div className="rounded-xl border border-gold/30 bg-wine/40 p-3 text-xs text-ivory/85">
              <code>SUPABASE_SERVICE_ROLE_KEY</code> is not configured in this
              runtime environment. Add it in Vercel Project Settings to enable
              one-click sub-admin provisioning.
            </div>
          ) : null}
          <div>
            <label className={adminLabelClass}>Full Name</label>
            <input
              type="text"
              required
              value={inviteForm.full_name}
              onChange={(e) =>
                setInviteForm((f) => ({ ...f, full_name: e.target.value }))
              }
              className={adminInputClass}
            />
          </div>
          <div>
            <label className={adminLabelClass}>Email</label>
            <input
              type="email"
              required
              value={inviteForm.email}
              onChange={(e) =>
                setInviteForm((f) => ({ ...f, email: e.target.value }))
              }
              className={adminInputClass}
            />
          </div>
          <div>
            <label className={adminLabelClass}>Initial Password</label>
            <input
              type="password"
              required
              minLength={10}
              value={inviteForm.password}
              onChange={(e) =>
                setInviteForm((f) => ({ ...f, password: e.target.value }))
              }
              className={adminInputClass}
            />
          </div>
          <div>
            <label className={adminLabelClass}>Role</label>
            <select
              value={inviteForm.role}
              onChange={(e) =>
                setInviteForm((f) => ({
                  ...f,
                  role: e.target.value as "admin" | "editor",
                }))
              }
              className={adminInputClass}
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setInviteOpen(false)}
              className="rounded-xl border border-ivory/15 px-4 py-2 text-xs text-ivory/75"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviting || !hasServiceKey}
              className="rounded-xl bg-gradient-to-r from-gold to-gold-warm px-4 py-2 text-xs font-semibold text-obsidian disabled:opacity-45"
            >
              {inviting ? "Creating..." : "Create Admin"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
