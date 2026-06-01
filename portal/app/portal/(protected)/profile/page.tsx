"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BillingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postCode?: string;
  country?: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  billingAddress: BillingAddress;
  notificationPreferences: string[];
}

// ─── Password strength ────────────────────────────────────────────────────────

function calcStrength(pw: string): 0 | 1 | 2 | 3 {
  if (!pw) return 0;
  if (pw.length < 8) return 1;
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;
  if (pw.length >= 12 && score >= 3) return 3;
  if (pw.length >= 8 && score >= 2) return 2;
  return 1;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Strong"] as const;
const STRENGTH_COLORS = [
  "",
  "bg-destructive",
  "bg-yellow-400",
  "bg-green-500",
] as const;

function PasswordStrengthBar({ password }: { password: string }) {
  const level = calcStrength(password);
  if (!password) return null;
  return (
    <div className="space-y-1 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= level ? STRENGTH_COLORS[level] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{STRENGTH_LABELS[level]}</p>
    </div>
  );
}

// ─── Profile tab ──────────────────────────────────────────────────────────────

function ProfileTab({
  data,
  onSaved,
}: {
  data: ProfileData;
  onSaved: (updated: Partial<ProfileData>) => void;
}) {
  const [firstName, setFirstName] = useState(data.firstName);
  const [lastName, setLastName] = useState(data.lastName);
  const [phone, setPhone] = useState(data.phone);
  const [billing, setBilling] = useState<BillingAddress>(data.billingAddress ?? {});
  const [saving, setSaving] = useState(false);

  const dirty =
    firstName !== data.firstName ||
    lastName !== data.lastName ||
    phone !== data.phone ||
    JSON.stringify(billing) !== JSON.stringify(data.billingAddress ?? {});

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, billingAddress: billing }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Save failed");
      }
      toast.success("Profile updated");
      onSaved({ firstName, lastName, phone, billingAddress: billing });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={data.email}
              readOnly
              disabled
              className="bg-muted/50 cursor-not-allowed"
              autoComplete="email"
            />
            <p className="text-xs text-muted-foreground">
              Email address cannot be changed here. Contact BluuHQ to update it.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="+44 7700 900000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={data.company}
              readOnly
              disabled
              className="bg-muted/50 cursor-not-allowed"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Billing address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="line1">Address line 1</Label>
            <Input
              id="line1"
              value={billing.line1 ?? ""}
              onChange={(e) => setBilling((b) => ({ ...b, line1: e.target.value }))}
              autoComplete="address-line1"
              placeholder="123 High Street"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="line2">Address line 2 <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              id="line2"
              value={billing.line2 ?? ""}
              onChange={(e) => setBilling((b) => ({ ...b, line2: e.target.value }))}
              autoComplete="address-line2"
              placeholder="Suite 4"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={billing.city ?? ""}
                onChange={(e) => setBilling((b) => ({ ...b, city: e.target.value }))}
                autoComplete="address-level2"
                placeholder="London"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">County / State</Label>
              <Input
                id="state"
                value={billing.state ?? ""}
                onChange={(e) => setBilling((b) => ({ ...b, state: e.target.value }))}
                autoComplete="address-level1"
                placeholder="Greater London"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="postCode">Post code</Label>
              <Input
                id="postCode"
                value={billing.postCode ?? ""}
                onChange={(e) => setBilling((b) => ({ ...b, postCode: e.target.value }))}
                autoComplete="postal-code"
                placeholder="SW1A 1AA"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={billing.country ?? ""}
                onChange={(e) => setBilling((b) => ({ ...b, country: e.target.value }))}
                autoComplete="country-name"
                placeholder="United Kingdom"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!dirty || saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

// ─── Security tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const mismatch = confirm.length > 0 && confirm !== newPw;
  const canSubmit =
    current.length > 0 && newPw.length >= 8 && newPw === confirm && calcStrength(newPw) >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      const res = await fetch("/api/portal/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Failed to update password");
      toast.success("Password updated");
      setCurrent("");
      setNewPw("");
      setConfirm("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Change password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <PasswordStrengthBar password={newPw} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              aria-invalid={mismatch}
              className={mismatch ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {mismatch && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={!canSubmit || saving}>
              {saving ? "Updating…" : "Update password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Notifications tab ────────────────────────────────────────────────────────

const NOTIFICATION_OPTIONS = [
  {
    key: "invoice_reminders",
    label: "Invoice reminders",
    description: "Get reminded when invoices are due or overdue",
  },
  {
    key: "new_files",
    label: "New files",
    description: "Be notified when BluuHQ shares a file with you",
  },
  {
    key: "service_updates",
    label: "Service updates",
    description: "Receive updates when your services change status",
  },
] as const;

function NotificationsTab({ preferences }: { preferences: string[] }) {
  const [prefs, setPrefs] = useState<string[]>(preferences);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const toggle = (key: string, enabled: boolean) => {
    const next = enabled ? [...prefs, key] : prefs.filter((p) => p !== key);
    setPrefs(next);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/portal/profile/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: prefs }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save");
      }
      toast.success("Notification preferences saved");
      setDirty(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Email notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 p-0">
          {NOTIFICATION_OPTIONS.map((opt, idx) => (
            <div key={opt.key}>
              {idx > 0 && <Separator />}
              <div className="flex items-start justify-between gap-4 px-6 py-4">
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                </div>
                <Switch
                  id={`notif-${opt.key}`}
                  checked={prefs.includes(opt.key)}
                  onCheckedChange={(checked) => toggle(opt.key, checked)}
                  aria-label={opt.label}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!dirty || saving}>
          {saving ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/profile")
      .then((r) => r.json())
      .then((data) => setProfile(data))
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-9 w-56 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <p>Could not load profile. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Account &amp; settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your profile, password, and notifications
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab
            data={profile}
            onSaved={(updated) =>
              setProfile((prev) => prev ? { ...prev, ...updated } : prev)
            }
          />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab preferences={profile.notificationPreferences} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
