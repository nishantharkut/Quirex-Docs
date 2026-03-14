import { useState } from "react";
import { Check, Clipboard, Play, ExternalLink } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { useTheme } from "@/hooks/useTheme";

// Custom themes inspired by GitHub's code rendering
const lightTheme: Record<string, React.CSSProperties> = {
  'code[class*="language-"]': { color: '#24292f', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left', whiteSpace: 'pre', wordSpacing: 'normal', wordBreak: 'normal', wordWrap: 'normal', lineHeight: '1.6', tabSize: 4 },
  'pre[class*="language-"]': { color: '#24292f', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left', whiteSpace: 'pre', wordSpacing: 'normal', wordBreak: 'normal', wordWrap: 'normal', lineHeight: '1.6', overflow: 'auto', tabSize: 4 },
  comment: { color: '#6e7781', fontStyle: 'italic' }, prolog: { color: '#6e7781' }, doctype: { color: '#6e7781' }, cdata: { color: '#6e7781' },
  punctuation: { color: '#24292f' }, property: { color: '#0550ae' }, tag: { color: '#116329' }, boolean: { color: '#0550ae' },
  number: { color: '#0550ae' }, constant: { color: '#0550ae' }, symbol: { color: '#0550ae' },
  deleted: { color: '#82071e', background: '#ffebe9' }, selector: { color: '#116329' }, 'attr-name': { color: '#0550ae' },
  string: { color: '#0a3069' }, char: { color: '#0a3069' }, builtin: { color: '#0550ae' },
  inserted: { color: '#116329', background: '#dafbe1' }, operator: { color: '#cf222e' }, entity: { color: '#0550ae', cursor: 'help' },
  url: { color: '#0550ae' }, variable: { color: '#953800' }, atrule: { color: '#0550ae' }, 'attr-value': { color: '#0a3069' },
  function: { color: '#8250df' }, 'class-name': { color: '#953800' }, keyword: { color: '#cf222e' }, regex: { color: '#0a3069' },
  important: { color: '#cf222e', fontWeight: 'bold' }, bold: { fontWeight: 'bold' }, italic: { fontStyle: 'italic' },
  'template-string': { color: '#0a3069' }, 'template-punctuation': { color: '#cf222e' }, 'script-punctuation': { color: '#24292f' },
};

const darkTheme: Record<string, React.CSSProperties> = {
  'code[class*="language-"]': { color: '#e6edf3', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left', whiteSpace: 'pre', wordSpacing: 'normal', wordBreak: 'normal', wordWrap: 'normal', lineHeight: '1.6', tabSize: 4 },
  'pre[class*="language-"]': { color: '#e6edf3', background: 'transparent', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left', whiteSpace: 'pre', wordSpacing: 'normal', wordBreak: 'normal', wordWrap: 'normal', lineHeight: '1.6', overflow: 'auto', tabSize: 4 },
  comment: { color: '#8b949e', fontStyle: 'italic' }, prolog: { color: '#8b949e' }, doctype: { color: '#8b949e' }, cdata: { color: '#8b949e' },
  punctuation: { color: '#e6edf3' }, property: { color: '#79c0ff' }, tag: { color: '#7ee787' }, boolean: { color: '#79c0ff' },
  number: { color: '#79c0ff' }, constant: { color: '#79c0ff' }, symbol: { color: '#79c0ff' },
  deleted: { color: '#ffa198', background: '#490202' }, selector: { color: '#7ee787' }, 'attr-name': { color: '#79c0ff' },
  string: { color: '#a5d6ff' }, char: { color: '#a5d6ff' }, builtin: { color: '#79c0ff' },
  inserted: { color: '#7ee787', background: '#04260f' }, operator: { color: '#ff7b72' }, entity: { color: '#79c0ff', cursor: 'help' },
  url: { color: '#79c0ff' }, variable: { color: '#ffa657' }, atrule: { color: '#79c0ff' }, 'attr-value': { color: '#a5d6ff' },
  function: { color: '#d2a8ff' }, 'class-name': { color: '#ffa657' }, keyword: { color: '#ff7b72' }, regex: { color: '#a5d6ff' },
  important: { color: '#ff7b72', fontWeight: 'bold' }, bold: { fontWeight: 'bold' }, italic: { fontStyle: 'italic' },
  'template-string': { color: '#a5d6ff' }, 'template-punctuation': { color: '#ff7b72' }, 'script-punctuation': { color: '#e6edf3' },
};

const LANG_MAP: Record<string, string> = {
  js: "JavaScript", javascript: "JavaScript", ts: "TypeScript", typescript: "TypeScript",
  tsx: "TSX", jsx: "JSX", py: "Python", python: "Python", go: "Go", rust: "Rust",
  rs: "Rust", java: "Java", cpp: "C++", c: "C", cs: "C#", php: "PHP",
  swift: "Swift", kotlin: "Kotlin", bash: "Bash", sh: "Shell", sql: "SQL",
  html: "HTML", css: "CSS", json: "JSON", yaml: "YAML", yml: "YAML",
  xml: "XML", http: "HTTP", graphql: "GraphQL", dockerfile: "Dockerfile",
  rb: "Ruby", ruby: "Ruby", toml: "TOML", md: "Markdown",
};

const RUNNABLE_LANGS = ["javascript", "js"];

export function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  const isRunnable = RUNNABLE_LANGS.includes(language.toLowerCase());

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRun = () => {
    setOutput(null);
    setError(null);
    const logs: string[] = [];
    const origLog = console.log;
    const origWarn = console.warn;
    const origErr = console.error;
    console.log = (...args) => logs.push(args.map(String).join(" "));
    console.warn = (...args) => logs.push("⚠️ " + args.map(String).join(" "));
    console.error = (...args) => logs.push("❌ " + args.map(String).join(" "));
    try {
      const result = new Function(code)();
      if (result !== undefined) logs.push(`→ ${String(result)}`);
      setOutput(logs);
    } catch (e: any) {
      setError(e.message);
      setOutput(logs);
    } finally {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origErr;
    }
  };

  const label = LANG_MAP[language] || language;
  const lines = code.split("\n").length;

  return (
    <div className="code-block group">
      <div className="code-block-header">
        <span className="code-block-lang">
          {label}
          {isRunnable && <span className="ml-1.5 text-[9px] text-primary font-semibold">▶ RUN</span>}
        </span>
        <div className="flex items-center gap-1">
          {isRunnable && (
            <button onClick={handleRun} className="text-[11px] flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <Play className="w-3 h-3" /> Run
            </button>
          )}
          <button onClick={handleCopy} className="code-block-copy">
            {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Clipboard className="w-3 h-3" /> Copy</>}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <SyntaxHighlighter
          language={language}
          style={theme === "dark" ? darkTheme : lightTheme}
          customStyle={{ margin: 0, padding: '12px 16px', fontSize: '13px', background: 'transparent' }}
          showLineNumbers={lines > 3}
          lineNumberStyle={{
            minWidth: '2.5em', paddingRight: '1em',
            color: theme === 'dark' ? '#484f58' : '#bcc0c5', fontSize: '12px', userSelect: 'none',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
      {output !== null && (
        <div className="border-t border-[hsl(var(--code-border))]">
          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground border-b border-[hsl(var(--code-border))] bg-[hsl(var(--code-header))]">
            Output
          </div>
          <div className="px-3 py-2 text-[12px] font-mono min-h-[1.5rem] max-h-32 overflow-y-auto scrollbar-thin bg-[hsl(var(--code-bg))]">
            {output.map((line, i) => (
              <div key={i} className="text-foreground/80 leading-relaxed">{line}</div>
            ))}
            {error && <div className="text-destructive">Error: {error}</div>}
            {output.length === 0 && !error && <div className="text-muted-foreground/50 italic">No output</div>}
          </div>
        </div>
      )}
    </div>
  );
}
