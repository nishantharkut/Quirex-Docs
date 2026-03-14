import { useState } from "react";
import { Play, Check, Clipboard, AlertTriangle, ExternalLink } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useTheme } from "@/hooks/useTheme";

interface RunnableCodeProps {
  code: string;
  language: string;
}

export function RunnableCode({ code, language }: RunnableCodeProps) {
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ran, setRan] = useState(false);
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const isRunnable = ["javascript", "js"].includes(language.toLowerCase());

  const handleRun = () => {
    setOutput([]);
    setError(null);
    setRan(true);

    // Capture console.log output
    const logs: string[] = [];
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => logs.push(args.map(String).join(" "));
    console.warn = (...args) => logs.push("⚠️ " + args.map(String).join(" "));
    console.error = (...args) => logs.push("❌ " + args.map(String).join(" "));

    try {
      // Use Function constructor for safer eval
      const fn = new Function(code);
      const result = fn();
      if (result !== undefined) logs.push(`→ ${String(result)}`);
      setOutput(logs);
    } catch (e: any) {
      setError(e.message);
      setOutput(logs);
    } finally {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const openInStackBlitz = () => {
    const html = `<!DOCTYPE html><html><body><script>\n${code}\n</script></body></html>`;
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://stackblitz.com/run";
    form.target = "_blank";
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "project[files][index.html]";
    input.value = html;
    form.appendChild(input);
    const title = document.createElement("input");
    title.type = "hidden";
    title.name = "project[title]";
    title.value = "Quirex Snippet";
    form.appendChild(title);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  return (
    <div className="code-block group">
      <div className="code-block-header">
        <span className="code-block-lang">
          {language}
          {isRunnable && <span className="ml-1.5 text-[9px] text-primary font-semibold">RUNNABLE</span>}
        </span>
        <div className="flex items-center gap-1">
          {isRunnable && (
            <>
              <button
                onClick={handleRun}
                className="text-[11px] flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Play className="w-3 h-3" /> Run
              </button>
              <button
                onClick={openInStackBlitz}
                className="code-block-copy"
                title="Open in StackBlitz"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </>
          )}
          <button onClick={handleCopy} className="code-block-copy">
            {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Clipboard className="w-3 h-3" /> Copy</>}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <SyntaxHighlighter
          language={language}
          style={{}}
          useInlineStyles={false}
          customStyle={{
            margin: 0,
            padding: "12px 16px",
            fontSize: "13px",
            background: "transparent",
          }}
          className="syntax-hl"
        >
          {code}
        </SyntaxHighlighter>
      </div>
      {ran && (
        <div className="border-t border-[hsl(var(--code-border))] bg-[hsl(var(--code-bg))]">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground border-b border-[hsl(var(--code-border))]">
            Output
          </div>
          <div className="px-3 py-2 text-[12px] font-mono min-h-[2rem] max-h-40 overflow-y-auto scrollbar-thin">
            {output.map((line, i) => (
              <div key={i} className="text-foreground/80 leading-relaxed">{line}</div>
            ))}
            {error && (
              <div className="flex items-start gap-1.5 text-destructive">
                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                {error}
              </div>
            )}
            {output.length === 0 && !error && (
              <div className="text-muted-foreground/50 italic">No output</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
