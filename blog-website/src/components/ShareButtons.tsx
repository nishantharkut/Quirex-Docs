import { Share2, Twitter, Linkedin, Link2, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/docs/${slug}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-[11px] text-muted-foreground mr-1">Share:</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Share on Twitter"
      >
        <Twitter className="w-3 h-3" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Share on LinkedIn"
      >
        <Linkedin className="w-3 h-3" />
      </a>
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Copy link"
      >
        {copied ? <Check className="w-3 h-3 text-primary" /> : <Link2 className="w-3 h-3" />}
      </button>
    </div>
  );
}
