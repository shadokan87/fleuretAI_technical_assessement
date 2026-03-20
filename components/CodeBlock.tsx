"use client";

import { useEffect, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  lang?: string;
  className?: string;
}

export default function CodeBlock({ code, lang = "", className = "" }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  const grammar = lang && Prism.languages[lang] ? Prism.languages[lang] : null;
  const highlighted = grammar
    ? Prism.highlight(code, grammar, lang)
    : code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative group my-4 rounded-lg overflow-hidden border border-white/10 bg-[#2d2d2d] ${className}`}>
      {/* {lang && (
        <span className="absolute top-2.5 left-4 text-[11px] font-mono text-white/40 select-none">
          {lang}
        </span>
      )} */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="absolute top-1.5 right-1.5 size-7 opacity-0 group-hover:opacity-100 transition-opacity text-white/60 hover:text-white hover:bg-white/10"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      </Button>
      <pre
        className={`language-${lang} !m-0 !rounded-none overflow-x-auto !bg-transparent px-4 py-4 whitespace-pre-wrap break-all ${lang ? "pt-8" : ""}`}
      >
        <code
          ref={codeRef}
          className={`language-${lang} !bg-transparent text-sm font-mono`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}
