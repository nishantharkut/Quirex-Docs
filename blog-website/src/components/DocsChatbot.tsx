import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles, Settings2 } from "lucide-react";
import { getPosts } from "@/lib/content";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const BYOK_KEY = "quirex_ai_api_key";
const BYOK_PROVIDER_KEY = "quirex_ai_provider";

type AIProvider = "openai" | "anthropic";

function getAIKey(): string {
  return localStorage.getItem(BYOK_KEY) || "";
}
function getAIProvider(): AIProvider {
  return (localStorage.getItem(BYOK_PROVIDER_KEY) as AIProvider) || "openai";
}

function searchDocs(query: string): { title: string; slug: string; snippet: string }[] {
  const q = query.toLowerCase();
  const posts = getPosts().filter((p) => p.published);
  const results: { title: string; slug: string; snippet: string; score: number }[] = [];

  for (const post of posts) {
    let score = 0;
    const titleLower = post.title.toLowerCase();
    const contentLower = post.content.toLowerCase();

    if (titleLower.includes(q)) score += 10;
    post.tags.forEach((t) => { if (t.toLowerCase().includes(q)) score += 5; });

    const words = q.split(/\s+/).filter(Boolean);
    words.forEach((w) => {
      if (contentLower.includes(w)) score += 2;
      if (titleLower.includes(w)) score += 3;
    });

    if (score > 0) {
      const idx = contentLower.indexOf(words[0] || q);
      const start = Math.max(0, idx - 80);
      const end = Math.min(post.content.length, idx + 200);
      const snippet = (start > 0 ? "..." : "") + post.content.slice(start, end).replace(/[#*`]/g, "").trim() + (end < post.content.length ? "..." : "");
      results.push({ title: post.title, slug: post.slug, snippet, score });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 3);
}

function buildDocsContext(): string {
  const posts = getPosts().filter((p) => p.published);
  return posts
    .map((p) => `## ${p.title}\n${p.content.slice(0, 800)}`)
    .join("\n\n---\n\n")
    .slice(0, 6000);
}

function generateLocalResponse(query: string): string {
  const results = searchDocs(query);
  if (results.length === 0) {
    return "I couldn't find anything matching your question in the docs. Try rephrasing or check the sidebar for available topics.";
  }
  let response = `Here's what I found:\n\n`;
  results.forEach((r) => {
    response += `**[${r.title}](/docs/${r.slug})**\n\n${r.snippet}\n\n---\n\n`;
  });
  response += `_Using local search. Add an API key in settings for AI-powered answers._`;
  return response;
}

async function generateAIResponse(query: string, history: Message[]): Promise<string> {
  const apiKey = getAIKey();
  const provider = getAIProvider();
  const docsContext = buildDocsContext();

  const systemPrompt = `You are a helpful documentation assistant for Quirex. Answer questions based on the following documentation content. Be concise and link to relevant pages using markdown links like [Page Title](/docs/slug). If you're unsure, say so.\n\nDocumentation:\n${docsContext}`;

  try {
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: query },
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      return data.choices[0].message.content;
    } else {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-latest",
          max_tokens: 500,
          system: systemPrompt,
          messages: [
            ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: query },
          ],
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      return data.content[0].text;
    }
  } catch (e: any) {
    return `⚠️ AI request failed: ${e.message}\n\nFalling back to local search:\n\n${generateLocalResponse(query)}`;
  }
}

export function DocsChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aiKey, setAiKey] = useState(getAIKey);
  const [aiProvider, setAiProvider] = useState<AIProvider>(getAIProvider);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSaveSettings = () => {
    localStorage.setItem(BYOK_KEY, aiKey);
    localStorage.setItem(BYOK_PROVIDER_KEY, aiProvider);
    setShowSettings(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const hasKey = !!getAIKey();
    let response: string;

    if (hasKey) {
      response = await generateAIResponse(userMsg.content, messages);
    } else {
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
      response = generateLocalResponse(userMsg.content);
    }

    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setIsTyping(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
          open ? "bg-muted text-foreground rotate-0" : "bg-primary text-primary-foreground hover:scale-105"
        }`}
        aria-label={open ? "Close chat" : "Ask AI"}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-[360px] max-w-[calc(100vw-2.5rem)] h-[480px] max-h-[calc(100vh-7rem)] rounded-xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-foreground">Quirex Assistant</div>
              <div className="text-[11px] text-muted-foreground">
                {getAIKey() ? "AI-powered" : "Local search"}
              </div>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-md transition-colors ${showSettings ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}
              title="AI Settings"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="px-4 py-3 border-b border-border bg-muted/30 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">AI Settings (BYOK)</p>
              <p className="text-[11px] text-muted-foreground/70">Your key stays in your browser's localStorage.</p>
              <div className="flex gap-1.5">
                {(["openai", "anthropic"] as AIProvider[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setAiProvider(p)}
                    className={`px-2 py-0.5 text-[11px] rounded border capitalize transition-colors ${
                      aiProvider === p ? "border-primary/30 text-primary bg-primary/5" : "border-border text-muted-foreground"
                    }`}
                  >
                    {p === "openai" ? "OpenAI" : "Anthropic"}
                  </button>
                ))}
              </div>
              <input
                type="password"
                value={aiKey}
                onChange={(e) => setAiKey(e.target.value)}
                placeholder={aiProvider === "openai" ? "sk-..." : "sk-ant-..."}
                className="w-full px-2.5 py-1.5 text-[12px] rounded border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring font-mono"
              />
              <button
                onClick={handleSaveSettings}
                className="w-full px-3 py-1.5 text-[11px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
              >
                Save
              </button>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.length === 0 && !showSettings && (
              <div className="text-center py-8">
                <Bot className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-[13px] text-muted-foreground mb-1">Ask anything about the docs</p>
                <p className="text-[11px] text-muted-foreground/60">
                  {getAIKey() ? "Powered by AI • Your key is stored locally" : 'Add an API key via ⚙️ for AI answers'}
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === "user" ? "bg-primary/10" : "bg-muted"
                }`}>
                  {msg.role === "user" ? <User className="w-3 h-3 text-primary" /> : <Bot className="w-3 h-3 text-muted-foreground" />}
                </div>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose-docs [&_p]:text-[13px] [&_p]:mb-2 [&_p]:last:mb-0 [&_a]:text-primary [&_strong]:text-foreground [&_hr]:my-2 [&_em]:text-muted-foreground [&_em]:text-[11px]">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  ) : msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3 text-muted-foreground" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-3 py-3 border-t border-border bg-card">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the docs..."
                className="flex-1 min-w-0 px-3 py-2 text-[13px] rounded-lg border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0 self-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
