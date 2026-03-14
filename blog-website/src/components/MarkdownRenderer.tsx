import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// @ts-ignore
import rehypeRaw from "rehype-raw";
import { CodeBlock } from "./CodeBlock";
import { Callout } from "./markdown/Callout";
import { TabbedCode } from "./markdown/TabbedCode";
import { CollapsibleSection } from "./markdown/CollapsibleSection";
import { Link as LinkIcon } from "lucide-react";
import { useState, useMemo } from "react";

function HeadingWithAnchor({
  level,
  children,
  ...props
}: {
  level: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  [key: string]: any;
}) {
  const id = headingId(children);
  const [copied, setCopied] = useState(false);
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const Component = Tag as any;
  return (
    <Component id={id} className="group relative" {...props}>
      <a
        href={`#${id}`}
        onClick={handleCopy}
        className="anchor-link absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
        aria-label="Copy link"
      >
        {copied ? (
          <span className="text-[10px] text-primary font-mono">✓</span>
        ) : (
          <LinkIcon className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
        )}
      </a>
      {children}
    </Component>
  );
}

/**
 * Pre-process markdown to extract custom directives:
 * - :::info / :::warning / :::tip / :::danger blocks → <Callout>
 * - :::tabs → <TabbedCode>
 * - :::details → <CollapsibleSection>
 */
function preprocessContent(raw: string): string {
  // Extract code blocks to protect them from preprocessing
  const codeBlocks: string[] = [];
  let result = raw.replace(/```[\s\S]*?```/g, (match) => {
    codeBlocks.push(match);
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  // Callouts: :::info, :::warning, :::tip, :::danger, :::note
  result = result.replace(
    /^:::(info|warning|tip|danger|note)(?:\s+(.*))?\n([\s\S]*?)^:::\s*$/gm,
    (_, type, title, body) => {
      const safeTitle = (title || "").trim();
      const safeBody = body.trim().replace(/\n/g, "<br/>");
      return `\n\n<div data-callout="${type}" data-title="${safeTitle}">${safeBody}</div>\n\n`;
    }
  );

  // Collapsible: :::details
  result = result.replace(
    /^:::details(?:\s+(.*))?\n([\s\S]*?)^:::\s*$/gm,
    (_, title, body) => {
      const safeTitle = (title || "Details").trim();
      const safeBody = body.trim().replace(/\n/g, "<br/>");
      return `\n\n<div data-collapsible="true" data-title="${safeTitle}">${safeBody}</div>\n\n`;
    }
  );

  // Ensure thematic breaks (---) have proper blank lines so the markdown
  // parser recognizes them as <hr> instead of treating them as text.
  // Do NOT convert to <hr/> — let the parser handle it natively.
  result = result.replace(/^---\s*$/gm, '\n---\n');

  // Normalize excessive blank lines to max 2 (so parser sees clean block boundaries)
  result = result.replace(/\n{4,}/g, '\n\n\n');

  // Restore code blocks
  result = result.replace(/__CODE_BLOCK_(\d+)__/g, (_, i) => codeBlocks[parseInt(i)]);

  return result;
}

export function MarkdownRenderer({ content }: { content: string }) {
  const processed = useMemo(() => preprocessContent(content), [content]);

  return (
    <div className="prose-docs">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children, ...props }) => <HeadingWithAnchor level={1} {...props}>{children}</HeadingWithAnchor>,
          h2: ({ children, ...props }) => <HeadingWithAnchor level={2} {...props}>{children}</HeadingWithAnchor>,
          h3: ({ children, ...props }) => <HeadingWithAnchor level={3} {...props}>{children}</HeadingWithAnchor>,
          h4: ({ children, ...props }) => <HeadingWithAnchor level={4} {...props}>{children}</HeadingWithAnchor>,
          div: ({ node, children, ...props }) => {
            const el = node as any;
            const calloutType = el?.properties?.["dataCallout"];
            const collapsible = el?.properties?.["dataCollapsible"];

            if (calloutType) {
              const title = el?.properties?.["dataTitle"] || "";
              const bodyText = typeof children === "string" 
                ? children 
                : extractText(children).replace(/<br\s*\/?>/g, "\n");
              return <Callout type={calloutType} title={title}>{bodyText}</Callout>;
            }

            if (collapsible) {
              const title = el?.properties?.["dataTitle"] || "Details";
              return <CollapsibleSection title={title}>{children}</CollapsibleSection>;
            }

            return <div {...props}>{children}</div>;
          },
          pre: ({ children, ...props }) => {
            // Check if the child is a code element without a language class (plain code block)
            const child = Array.isArray(children) ? children[0] : children;
            if (child && typeof child === "object" && "props" in child) {
              const childProps = (child as any).props;
              const className = childProps?.className || "";
              const match = /language-(\w+)/.exec(className);
              const code = String(childProps?.children || "").replace(/\n$/, "");
              if (match) {
                return <CodeBlock code={code} language={match[1]} />;
              }
              // Plain code block (no language specified) — still render as a code block
              return <CodeBlock code={code} language="text" />;
            }
            return <pre {...props}>{children}</pre>;
          },
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const code = String(children).replace(/\n$/, "");
            // If it has a language class, CodeBlock is handled by the pre component
            // This code component now only handles inline code
            if (match) return <CodeBlock code={code} language={match[1]} />;
            return <span className="inline-code" {...props}>{children}</span>;
          },
          img: ({ src, alt }) => (
            <img src={src} alt={alt || ""} loading="lazy" />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          input: ({ type, checked, ...props }) => {
            if (type === "checkbox") {
              return <input type="checkbox" checked={checked} readOnly className="mr-1.5 accent-primary" {...props} />;
            }
            return <input type={type} {...props} />;
          },
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}

function headingId(children: React.ReactNode): string {
  return extractText(children).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) return extractText((node as any).props.children);
  return "";
}
