import Link from "next/link";
import { Plus, Gift, Pencil, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMyGiftPages } from "@/lib/actions/gift-pages";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";

export default async function GiftPagesPage() {
  const giftPages = await getMyGiftPages();
  const isEmpty = giftPages.length === 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl text-text-primary mb-1">Gift Pages</h1>
          <p className="text-text-secondary">
            Create and manage gift pages for your children
          </p>
        </div>
        <Link href="/gift-pages/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Gift Page
          </Button>
        </Link>
      </div>

      {isEmpty ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2 font-[family-name:var(--font-body)]">
              No gift pages yet
            </h3>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Create your first gift page and share it with family and friends.
            </p>
            <Link href="/gift-pages/new">
              <Button>Create Your First Gift Page</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {giftPages.map((page) => (
            <Card key={page.id}>
              <CardContent>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary font-[family-name:var(--font-body)]">
                      {page.child_name}
                    </h3>
                    <p className="text-sm text-text-secondary">{page.event_name}</p>
                  </div>
                  <Badge variant={page.status === "active" ? "success" : "default"}>
                    {page.status}
                  </Badge>
                </div>

                <p className="text-sm text-text-secondary mb-4">
                  {page.fund_ticker} &middot; {page.fund_name}
                </p>

                <div className="flex gap-2 text-sm text-text-secondary mb-4">
                  <span>{page.giftsCount} gifts</span>
                  <span>&middot;</span>
                  <span>${(page.totalGifted / 100).toFixed(2)} raised</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/gift/${page.slug}`}
                    target="_blank"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border border-border text-text-secondary hover:bg-surface-muted transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                  <CopyLinkButton slug={page.slug} />
                  <Link
                    href={`/gift-pages/${page.id}/edit`}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border border-border text-text-secondary hover:bg-surface-muted transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
