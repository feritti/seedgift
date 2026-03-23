"use client";

import { useState } from "react";
import { Heart, Send, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatCurrency } from "@/shared/utils/growth-calculator";
import { markGiftThanked } from "@/lib/actions/gifts";

interface GiftItem {
  id: string;
  giver_name: string;
  giver_email: string;
  amount_cents: number;
  note: string | null;
  giftPageChildName: string;
  status: string;
  thanked: boolean;
  created_at: string;
}

export function GiftsList({ gifts }: { gifts: GiftItem[] }) {
  const [thankYouModal, setThankYouModal] = useState<string | null>(null);
  const [thankYouMessage, setThankYouMessage] = useState("");
  const isEmpty = gifts.length === 0;

  const selectedGift = gifts.find((g) => g.id === thankYouModal);

  const handleSendThankYou = async () => {
    if (!thankYouModal || !thankYouMessage.trim()) return;
    await markGiftThanked(thankYouModal, thankYouMessage);
    setThankYouModal(null);
    setThankYouMessage("");
    window.location.reload();
  };

  if (isEmpty) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2 font-[family-name:var(--font-body)]">
            No gifts yet
          </h3>
          <p className="text-text-secondary max-w-md mx-auto">
            When someone sends a gift through one of your gift pages, it will
            appear here. Share your gift page links to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {gifts.map((gift) => (
          <Card key={gift.id}>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">
                      {gift.giver_name}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {formatCurrency(gift.amount_cents / 100)} for{" "}
                      {gift.giftPageChildName} &middot;{" "}
                      {new Date(gift.created_at).toLocaleDateString()}
                    </p>
                    {gift.note && (
                      <p className="text-sm text-text-secondary mt-1 italic">
                        &ldquo;{gift.note}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={gift.status === "completed" ? "success" : "warning"}
                  >
                    {gift.status}
                  </Badge>
                  {gift.thanked ? (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <Check className="h-3.5 w-3.5" />
                      Thanked
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setThankYouModal(gift.id);
                        setThankYouMessage(
                          `Thank you so much for your generous gift of ${formatCurrency(gift.amount_cents / 100)} for ${gift.giftPageChildName}! Your kindness means the world to us.`
                        );
                      }}
                    >
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                      Thank
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!thankYouModal}
        onClose={() => setThankYouModal(null)}
        title="Send Thank You"
      >
        {selectedGift && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Sending to: <strong>{selectedGift.giver_email}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2.5 text-base text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setThankYouModal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSendThankYou}>
                <Send className="h-4 w-4 mr-1.5" />
                Send Thank You
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
