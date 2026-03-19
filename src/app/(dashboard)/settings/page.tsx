"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);

  const stripeOnboarded = (session?.user as { stripeOnboarded?: boolean })?.stripeOnboarded ?? false;

  const handleStripeConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
        setIsConnecting(false);
      }
    } catch {
      alert("Something went wrong");
      setIsConnecting(false);
    }
  };

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
            <div className="flex items-center gap-4">
              <Avatar
                src={session?.user?.image}
                alt={session?.user?.name || "User"}
                size="lg"
              />
              <div>
                <p className="font-medium text-text-primary">
                  {session?.user?.name || "—"}
                </p>
                <p className="text-sm text-text-secondary">
                  {session?.user?.email || "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant={stripeOnboarded ? "featured" : "default"}>
          <CardContent>
            <div className="flex items-start justify-between">
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
