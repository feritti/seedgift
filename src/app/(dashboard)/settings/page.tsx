"use client";

import { useSession } from "next-auth/react";
import { useState, useRef } from "react";
import { ExternalLink, CheckCircle, AlertCircle, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/lib/actions/profile";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Profile editing state
  const [name, setName] = useState(session?.user?.name || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync name when session loads
  const sessionName = session?.user?.name || "";
  if (sessionName && !name && !isSaving) {
    setName(sessionName);
  }

  const stripeOnboarded = (session?.user as { stripeOnboarded?: boolean })?.stripeOnboarded ?? false;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setProfileSuccess(false);
  };

  const handleProfileSave = async () => {
    setIsSaving(true);
    setProfileError(null);
    setProfileSuccess(false);
    try {
      const formData = new FormData();
      formData.set("name", name);
      if (avatarFile) {
        formData.set("avatar", avatarFile);
      }
      const result = await updateProfile(formData);
      if (result.error) {
        setProfileError(result.error);
      } else {
        setProfileSuccess(true);
        setAvatarFile(null);
        await updateSession();
      }
    } catch {
      setProfileError("Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStripeConnect = async () => {
    setIsConnecting(true);
    setConnectError(null);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setConnectError(data.error || "Something went wrong. Please try again.");
        setIsConnecting(false);
      }
    } catch {
      setConnectError("Something went wrong. Please try again.");
      setIsConnecting(false);
    }
  };

  const hasProfileChanges = name !== sessionName || avatarFile !== null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl text-text-primary mb-1">Settings</h1>
        <p className="text-text-secondary">Manage your account and payment setup</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-text-primary mb-4 font-[family-name:var(--font-body)]">
              Profile
            </h2>
            <div className="flex items-start gap-6">
              {/* Avatar with upload overlay */}
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer rounded-full"
                >
                  <Avatar
                    src={avatarPreview || session?.user?.image}
                    alt={session?.user?.name || "User"}
                    size="xl"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <p className="text-xs text-text-secondary mt-1.5 text-center">Edit photo</p>
              </div>

              {/* Name and email fields */}
              <div className="flex-1 space-y-4">
                <Input
                  id="name"
                  label="Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setProfileSuccess(false);
                  }}
                  placeholder="Your name"
                />
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Email
                  </label>
                  <p className="text-sm text-text-secondary px-4 py-2.5">
                    {session?.user?.email || "—"}
                  </p>
                </div>

                {profileError && (
                  <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-[var(--radius-md)] p-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}
                {profileSuccess && (
                  <div className="flex items-center gap-2 text-sm text-primary-dark">
                    <CheckCircle className="h-4 w-4" />
                    <span>Profile updated successfully.</span>
                  </div>
                )}

                <Button
                  onClick={handleProfileSave}
                  isLoading={isSaving}
                  disabled={!hasProfileChanges || isSaving}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant={stripeOnboarded ? "featured" : "default"}>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1 font-[family-name:var(--font-body)]">
                  Payment Setup
                </h2>
                <p className="text-sm text-text-secondary mb-4">
                  Connect your bank account to receive gift payments via Stripe.
                </p>
              </div>
              <Badge variant={stripeOnboarded ? "success" : "warning"}>
                {stripeOnboarded ? "Connected" : "Not connected"}
              </Badge>
            </div>

            {stripeOnboarded ? (
              <div className="flex items-center gap-2 text-sm text-primary-dark">
                <CheckCircle className="h-4 w-4" />
                <span>Your Stripe account is connected and ready to receive payments.</span>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-2 text-sm text-amber-700 bg-secondary rounded-[var(--radius-md)] p-3 mb-4">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>
                    You need to connect a Stripe account before you can receive
                    gift payments. This takes about 5 minutes.
                  </span>
                </div>
                {connectError && (
                  <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 rounded-[var(--radius-md)] p-3 mb-4">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{connectError}</span>
                  </div>
                )}
                <Button onClick={handleStripeConnect} isLoading={isConnecting}>
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  Connect Stripe Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold text-text-primary mb-1 font-[family-name:var(--font-body)]">
              Notifications
            </h2>
            <p className="text-sm text-text-secondary">
              Notification preferences coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
