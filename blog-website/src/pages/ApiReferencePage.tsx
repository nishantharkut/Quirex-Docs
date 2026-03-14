import { useState } from "react";
import { Header } from "@/components/Header";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { FileJson, Upload, Play, ChevronRight, ChevronDown, Copy, Check, Send, Loader2 } from "lucide-react";

interface OpenAPISpec {
  openapi?: string;
  info?: { title?: string; version?: string; description?: string };
  paths?: Record<string, Record<string, PathItem>>;
  servers?: { url: string; description?: string }[];
}

interface PathItem {
  summary?: string;
  description?: string;
  parameters?: Parameter[];
  requestBody?: { content?: Record<string, { schema?: any }> };
  responses?: Record<string, { description?: string; content?: Record<string, { schema?: any }> }>;
}

interface Parameter {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema?: { type?: string; default?: any };
}

const HTTP_COLORS: Record<string, string> = {
  get: "text-[hsl(142,60%,45%)]",
  post: "text-primary",
  put: "text-[hsl(35,90%,55%)]",
  patch: "text-[hsl(35,90%,55%)]",
  delete: "text-destructive",
};

export default function ApiReferencePage() {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [specInput, setSpecInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("quirex_api_key") || "");
  const [baseUrl, setBaseUrl] = useState("");
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const handleImport = async () => {
    setError("");
    setLoading(true);
    try {
      let parsed: OpenAPISpec;
      // Try as URL first
      if (specInput.startsWith("http")) {
        const res = await fetch(specInput);
        const text = await res.text();
        parsed = JSON.parse(text);
      } else {
        parsed = JSON.parse(specInput);
      }

      if (!parsed.paths) throw new Error("Invalid OpenAPI spec: no paths found");
      setSpec(parsed);
      setBaseUrl(parsed.servers?.[0]?.url || "https://api.example.com");
      // Expand first 3 paths
      const paths = Object.keys(parsed.paths);
      setExpandedPaths(new Set(paths.slice(0, 3)));
    } catch (e: any) {
      setError(e.message || "Failed to parse spec. Ensure it's valid OpenAPI 3.x JSON.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    localStorage.setItem("quirex_api_key", apiKey);
  };

  const togglePath = (key: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (!spec) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <h1 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-[-0.03em] text-foreground mb-1">
            API Reference
          </h1>
          <p className="text-[14px] text-muted-foreground mb-8">
            Import an OpenAPI 3.x specification to generate interactive API documentation.
          </p>

          {/* BYOK */}
          <div className="mb-6 p-4 rounded-lg border border-border bg-card">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
              API Key (BYOK)
            </label>
            <p className="text-[12px] text-muted-foreground/70 mb-2">
              Your key is stored locally in your browser. Used for the try-it playground.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1 min-w-0 px-3 py-1.5 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring font-mono"
              />
              <button
                onClick={handleSaveApiKey}
                className="px-3 py-1.5 text-[12px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium shrink-0"
              >
                Save
              </button>
            </div>
          </div>

          {/* Spec input */}
          <div className="p-4 rounded-lg border border-border bg-card">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
              OpenAPI Specification
            </label>
            <textarea
              value={specInput}
              onChange={(e) => setSpecInput(e.target.value)}
              placeholder={'Paste a URL (e.g. https://petstore3.swagger.io/api/v3/openapi.json)\nor paste raw JSON...'}
              rows={6}
              className="w-full px-3 py-2 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring resize-none font-mono mb-3"
            />
            {error && <p className="text-[12px] text-destructive mb-3">{error}</p>}
            <button
              onClick={handleImport}
              disabled={!specInput.trim() || loading}
              className="flex items-center gap-1.5 px-4 py-2 text-[13px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium disabled:opacity-40"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Import Spec
            </button>
          </div>

          {/* Quick demo link */}
          <p className="text-[12px] text-muted-foreground mt-4">
            Try it with:{" "}
            <button
              onClick={() => setSpecInput("https://petstore3.swagger.io/api/v3/openapi.json")}
              className="text-primary hover:underline"
            >
              Petstore API
            </button>
          </p>
        </main>
      </div>
    );
  }

  const paths = Object.entries(spec.paths || {});

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-[1.75rem] font-bold tracking-[-0.03em] text-foreground mb-1">
              {spec.info?.title || "API Reference"}
            </h1>
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              {spec.info?.version && <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">v{spec.info.version}</span>}
              {spec.info?.description && <span>· {spec.info.description.slice(0, 100)}</span>}
            </div>
          </div>
          <button
            onClick={() => setSpec(null)}
            className="px-3 py-1.5 text-[12px] rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            Import new spec
          </button>
        </div>

        {/* Base URL */}
        <div className="mb-6 p-3 rounded-lg border border-border bg-card flex items-center gap-2 text-[13px]">
          <span className="text-muted-foreground font-medium shrink-0">Base URL:</span>
          <code className="font-mono text-primary">{baseUrl}</code>
        </div>

        {/* Endpoints */}
        <div className="space-y-2">
          {paths.map(([path, methods]) => (
            Object.entries(methods).filter(([m]) => ["get", "post", "put", "patch", "delete"].includes(m)).map(([method, details]) => {
              const key = `${method}:${path}`;
              const expanded = expandedPaths.has(key);
              return (
                <EndpointCard
                  key={key}
                  method={method}
                  path={path}
                  details={details as PathItem}
                  expanded={expanded}
                  onToggle={() => togglePath(key)}
                  baseUrl={baseUrl}
                  apiKey={apiKey}
                />
              );
            })
          ))}
        </div>
      </main>
    </div>
  );
}

function EndpointCard({ method, path, details, expanded, onToggle, baseUrl, apiKey }: {
  method: string; path: string; details: PathItem; expanded: boolean;
  onToggle: () => void; baseUrl: string; apiKey: string;
}) {
  const [response, setResponse] = useState<{ status: number; body: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  const handleTryIt = async () => {
    setSending(true);
    setResponse(null);
    try {
      let url = baseUrl + path;
      // Replace path params
      (details.parameters || []).filter((p) => p.in === "path").forEach((p) => {
        url = url.replace(`{${p.name}}`, paramValues[p.name] || p.schema?.default || "1");
      });
      // Add query params
      const queryParams = (details.parameters || []).filter((p) => p.in === "query" && paramValues[p.name]);
      if (queryParams.length > 0) {
        url += "?" + queryParams.map((p) => `${p.name}=${encodeURIComponent(paramValues[p.name])}`).join("&");
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

      const res = await fetch(url, {
        method: method.toUpperCase(),
        headers,
      });
      const text = await res.text();
      let body: string;
      try { body = JSON.stringify(JSON.parse(text), null, 2); } catch { body = text; }
      setResponse({ status: res.status, body });
    } catch (e: any) {
      setResponse({ status: 0, body: `Error: ${e.message}` });
    } finally {
      setSending(false);
    }
  };

  const curlCmd = (() => {
    let url = baseUrl + path;
    (details.parameters || []).filter((p) => p.in === "path").forEach((p) => {
      url = url.replace(`{${p.name}}`, paramValues[p.name] || `{${p.name}}`);
    });
    let cmd = `curl -X ${method.toUpperCase()} "${url}"`;
    if (apiKey) cmd += ` \\\n  -H "Authorization: Bearer ${apiKey}"`;
    return cmd;
  })();

  const handleCopy = () => {
    navigator.clipboard.writeText(curlCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
      >
        {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
        <span className={`text-[11px] font-bold uppercase font-mono w-14 shrink-0 ${HTTP_COLORS[method] || "text-foreground"}`}>
          {method}
        </span>
        <code className="text-[13px] font-mono text-foreground">{path}</code>
        {details.summary && (
          <span className="text-[12px] text-muted-foreground ml-auto truncate hidden sm:block">{details.summary}</span>
        )}
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-4 bg-card space-y-4">
          {details.description && (
            <p className="text-[13px] text-foreground/80 leading-relaxed">{details.description}</p>
          )}

          {/* Parameters */}
          {details.parameters && details.parameters.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Parameters</h4>
              <div className="space-y-2">
                {details.parameters.map((p) => (
                  <div key={p.name} className="flex items-start gap-3">
                    <div className="min-w-[120px] sm:min-w-[160px]">
                      <code className="text-[12px] font-mono text-foreground">{p.name}</code>
                      <span className="text-[10px] text-muted-foreground ml-1">({p.in})</span>
                      {p.required && <span className="text-[10px] text-destructive ml-1">*</span>}
                      {p.description && <p className="text-[11px] text-muted-foreground mt-0.5">{p.description}</p>}
                    </div>
                    <input
                      value={paramValues[p.name] || ""}
                      onChange={(e) => setParamValues({ ...paramValues, [p.name]: e.target.value })}
                      placeholder={p.schema?.default?.toString() || p.schema?.type || "value"}
                      className="flex-1 min-w-0 px-2 py-1 text-[12px] rounded border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Responses */}
          {details.responses && (
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Responses</h4>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(details.responses).map(([code, resp]) => (
                  <span key={code} className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                    code.startsWith("2") ? "border-[hsl(142,60%,45%)]/30 text-[hsl(142,60%,45%)]" : "border-border text-muted-foreground"
                  }`}>
                    {code} {resp.description && `— ${resp.description.slice(0, 30)}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* cURL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">cURL</h4>
              <button onClick={handleCopy} className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="text-[12px] font-mono bg-muted p-3 rounded-md text-foreground/80 overflow-x-auto whitespace-pre-wrap">{curlCmd}</pre>
          </div>

          {/* Try it */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTryIt}
              disabled={sending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity font-medium"
            >
              {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              Try it
            </button>
            {!apiKey && (
              <span className="text-[11px] text-muted-foreground">No API key set. Go back to import page to add one.</span>
            )}
          </div>

          {response && (
            <div className="rounded-md border border-border overflow-hidden">
              <div className={`px-3 py-1.5 text-[11px] font-mono font-semibold border-b border-border ${
                response.status >= 200 && response.status < 300
                  ? "text-[hsl(142,60%,45%)] bg-[hsl(142,60%,45%)]/5"
                  : response.status >= 400
                  ? "text-destructive bg-destructive/5"
                  : "text-muted-foreground bg-muted"
              }`}>
                {response.status > 0 ? `${response.status} ${response.status < 300 ? "OK" : "Error"}` : "Network Error"}
              </div>
              <pre className="text-[12px] font-mono p-3 bg-muted text-foreground/80 overflow-x-auto max-h-60 whitespace-pre-wrap">
                {response.body}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
