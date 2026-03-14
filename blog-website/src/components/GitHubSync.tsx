import { useState } from "react";
import { getPosts, getCategories } from "@/lib/content";
import { Settings, Upload, Check, AlertCircle, ExternalLink } from "lucide-react";

interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

const GH_CONFIG_KEY = "quirex_gh_config";

function getConfig(): GitHubConfig | null {
  const stored = localStorage.getItem(GH_CONFIG_KEY);
  return stored ? JSON.parse(stored) : null;
}

function saveConfig(config: GitHubConfig) {
  localStorage.setItem(GH_CONFIG_KEY, JSON.stringify(config));
}

export function GitHubSync() {
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<GitHubConfig>(
    getConfig() || { token: "", owner: "", repo: "", branch: "main", path: "content" }
  );
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleSaveConfig = () => {
    saveConfig(config);
    setShowSettings(false);
    setResult({ ok: true, msg: "Settings saved" });
    setTimeout(() => setResult(null), 2000);
  };

  const pushToGitHub = async () => {
    const cfg = getConfig();
    if (!cfg?.token || !cfg.owner || !cfg.repo) {
      setResult({ ok: false, msg: "Configure GitHub settings first" });
      return;
    }

    setSyncing(true);
    setResult(null);

    try {
      const posts = getPosts();
      const categories = getCategories();
      const headers = {
        Authorization: `token ${cfg.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      };
      const apiBase = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}`;

      // Push categories index
      await pushFile(
        apiBase,
        headers,
        cfg.branch,
        `${cfg.path}/categories.json`,
        JSON.stringify(categories, null, 2)
      );

      // Push each post as a separate markdown file with frontmatter
      for (const post of posts) {
        const frontmatter = [
          "---",
          `title: "${post.title}"`,
          `slug: "${post.slug}"`,
          `category: "${post.category}"`,
          `tags: [${post.tags.map((t) => `"${t}"`).join(", ")}]`,
          `published: ${post.published}`,
          `createdAt: "${post.createdAt}"`,
          `updatedAt: "${post.updatedAt}"`,
          `author: "${post.author}"`,
          `excerpt: "${post.excerpt}"`,
          "---",
          "",
        ].join("\n");

        await pushFile(
          apiBase,
          headers,
          cfg.branch,
          `${cfg.path}/posts/${post.slug}.md`,
          frontmatter + post.content
        );
      }

      setResult({ ok: true, msg: `Pushed ${posts.length} posts to GitHub` });
    } catch (err: any) {
      setResult({ ok: false, msg: err.message || "Push failed" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="border border-border rounded-md p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-foreground" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span className="text-[13px] font-medium text-foreground">GitHub Sync</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={pushToGitHub}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
          >
            <Upload className="w-3 h-3" />
            {syncing ? "Pushing..." : "Push to GitHub"}
          </button>
        </div>
      </div>

      {result && (
        <div
          className={`flex items-center gap-1.5 text-[12px] p-2 rounded-md mb-3 ${
            result.ok
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {result.ok ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {result.msg}
        </div>
      )}

      {showSettings && (
        <div className="space-y-2.5 pt-3 border-t border-border">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
              Personal Access Token
            </label>
            <input
              type="password"
              value={config.token}
              onChange={(e) => setConfig({ ...config, token: e.target.value })}
              className="w-full px-2.5 py-1.5 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring font-mono"
              placeholder="ghp_..."
            />
            <a
              href="https://github.com/settings/tokens/new?scopes=repo&description=Quirex"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary mt-1 hover:underline"
            >
              Generate token <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Owner</label>
              <input
                value={config.owner}
                onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                className="w-full px-2.5 py-1.5 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
                placeholder="username"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Repository</label>
              <input
                value={config.repo}
                onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                className="w-full px-2.5 py-1.5 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
                placeholder="my-docs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Branch</label>
              <input
                value={config.branch}
                onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                className="w-full px-2.5 py-1.5 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
                placeholder="main"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Content Path</label>
              <input
                value={config.path}
                onChange={(e) => setConfig({ ...config, path: e.target.value })}
                className="w-full px-2.5 py-1.5 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
                placeholder="content"
              />
            </div>
          </div>
          <button
            onClick={handleSaveConfig}
            className="flex items-center gap-1 px-3 py-1.5 text-[12px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
          >
            Save Settings
          </button>
        </div>
      )}
    </div>
  );
}

async function pushFile(
  apiBase: string,
  headers: Record<string, string>,
  branch: string,
  path: string,
  content: string
) {
  // Check if file exists to get SHA for updates
  let sha: string | undefined;
  try {
    const res = await fetch(`${apiBase}/contents/${path}?ref=${branch}`, { headers });
    if (res.ok) {
      const data = await res.json();
      sha = data.sha;
    }
  } catch {}

  const body: any = {
    message: `Update ${path}`,
    content: btoa(unescape(encodeURIComponent(content))),
    branch,
  };
  if (sha) body.sha = sha;

  const res = await fetch(`${apiBase}/contents/${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to push ${path}`);
  }
}
