import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { GiftPageForm } from "@/components/dashboard/gift-page-form";

export default function NewGiftPagePage() {
  return (
    <div>
      <Link
        href="/gift-pages"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Gift Pages
      </Link>

      <h1 className="text-3xl text-text-primary mb-2">Create Gift Page</h1>
      <p className="text-text-secondary mb-8">
        Set up a gift page for your child. You&apos;ll get a shareable link to
        send to family and friends.
      </p>

      <Card className="max-w-2xl">
        <CardContent>
          <GiftPageForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
