"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface DescriptionPreviewProps {
  value: string;
  copy?: boolean;
  className?: string;
}

export default function DescriptionPreview({ value, copy = true, className = "" }: DescriptionPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative group ${className}`}>
      {copy && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="absolute top-1.5 right-1.5 size-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
      )}
      <pre className="text-xs bg-muted rounded-md p-3 max-h-48 overflow-auto whitespace-pre-wrap break-words">
        {value}
      </pre>
    </div>
  );
}
