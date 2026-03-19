"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/gift/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border border-border text-text-secondary hover:bg-surface-muted transition-colors cursor-pointer"
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-primary" />
          Copied!
        </>
      ) : (
        <>
          <Link2 className="h-3.5 w-3.5" />
          Copy Link
        </>
      )}
    </button>
  );
}
