import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { getCategories, saveCategory, deleteCategory, generateSlug, generateId } from "@/lib/content";
import { Category } from "@/types/blog";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Plus, Trash2, Edit, Eye, EyeOff, Save, X, ArrowLeft, ChevronDown, History, Lock, Shield, Download, Bell, TestTube2, Send, FileText } from "lucide-react";
import { docTemplates } from "@/lib/templates";
import { toast } from "sonner";
import { GitHubSync } from "@/components/GitHubSync";
import { FileUpload } from "@/components/FileUpload";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { siteConfig } from "@/lib/siteConfig";
import { saveRevision, getRevisions, diffRevisions, Revision } from "@/lib/revisions";
import { getGatePassword, setGatePassword } from "@/lib/authGate";
import { exportAllAsJSON, exportAllAsMarkdown } from "@/lib/exportDocs";
import { getWebhookConfigs, saveWebhookConfig, deleteWebhookConfig, testWebhook, WebhookConfig } from "@/lib/webhooks";
import { broadcastSync } from "@/lib/syncChannel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Post } from "@/types/blog";

type Tab = "posts" | "categories" | "settings";
type EditorMode = "edit" | "preview" | "split" | "history";

interface DbPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  tags: string[] | null;
  published: boolean | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

function dbToLocal(p: DbPost): Post {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt || "",
    content: p.content || "",
    category: p.category || "general",
    tags: p.tags || [],
    published: p.published ?? false,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    author: "",
  };
}

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCats] = useState<Category[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("edit");
  const [newCatName, setNewCatName] = useState("");
  const [gatePass, setGatePass] = useState(() => getGatePassword());
  const [saving, setSaving] = useState(false);
  const editParamHandled = useRef(false);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    // Admins see all, editors see own
    let query = supabase.from("posts").select("*").order("updated_at", { ascending: false });
    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Failed to fetch posts:", error);
      return;
    }
    setPosts((data || []).map(dbToLocal));
  }, [user, isAdmin]);

  useEffect(() => {
    fetchPosts();
    setCats(getCategories());
  }, [fetchPosts]);

  // Auto-open post from URL param (?edit=<id>)
  useEffect(() => {
    if (editParamHandled.current || posts.length === 0) return;
    const editId = searchParams.get("edit");
    if (editId) {
      const post = posts.find((p) => p.id === editId);
      if (post) {
        setEditingPost(post);
        editParamHandled.current = true;
        // Clean URL
        setSearchParams({}, { replace: true });
      }
    }
  }, [posts, searchParams, setSearchParams]);

  const refreshCats = () => setCats(getCategories());

  const handleNewPost = async () => {
    if (!user) return;
    const slug = "untitled-" + Date.now();
    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: "Untitled",
        slug,
        content: "# Untitled\n\nStart writing...",
        excerpt: "",
        category: categories[0]?.slug || "general",
        tags: [],
        published: false,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create post: " + error.message);
      return;
    }
    const post = dbToLocal(data);
    await fetchPosts();
    setEditingPost(post);
  };

  const handleSavePost = async () => {
    if (!editingPost || !user || saving) return;
    setSaving(true);
    const newSlug = generateSlug(editingPost.title) || editingPost.slug;
    const updated = { ...editingPost, slug: newSlug };

    const { error } = await supabase
      .from("posts")
      .update({
        title: updated.title,
        slug: updated.slug,
        content: updated.content,
        excerpt: updated.excerpt,
        category: updated.category,
        tags: updated.tags,
        published: updated.published,
      })
      .eq("id", updated.id);

    setSaving(false);
    if (error) {
      toast.error("Save failed: " + error.message);
      return;
    }

    saveRevision(updated);
    setEditingPost(updated);
    await fetchPosts();
    broadcastSync({ type: "post_updated", slug: updated.slug });
    toast.success("Post saved");
  };

  // Auto-save every 30 seconds
  const autoSaveRef = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => {
    if (editingPost) {
      autoSaveRef.current = setInterval(() => {
        handleSavePost();
      }, 30000);
    }
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [editingPost]);

  const handleNewFromTemplate = async (templateContent: string) => {
    if (!user) return;
    const slug = "untitled-" + Date.now();
    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: "Untitled",
        slug,
        content: templateContent,
        excerpt: "",
        category: categories[0]?.slug || "general",
        tags: [],
        published: false,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create post");
      return;
    }
    const post = dbToLocal(data);
    await fetchPosts();
    setEditingPost(post);
    toast.success("Created from template");
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const post = posts.find((p) => p.id === id);
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed: " + error.message);
      return;
    }
    if (editingPost?.id === id) setEditingPost(null);
    await fetchPosts();
    if (post) broadcastSync({ type: "post_deleted", slug: post.slug });
    toast.success("Post deleted");
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    saveCategory({ id: generateId(), name: newCatName.trim(), slug: generateSlug(newCatName.trim()), order: categories.length });
    setNewCatName("");
    refreshCats();
  };

  const handleDeleteCategory = (id: string) => {
    if (!confirm("Delete this category?")) return;
    deleteCategory(id);
    refreshCats();
  };

  if (editingPost) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        {/* Editor toolbar */}
        <div className="border-b border-border">
          <div className="max-w-[90rem] mx-auto px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => { handleSavePost(); setEditingPost(null); }}
              className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex rounded-md border border-border overflow-hidden text-[12px]">
                {(["edit", "split", "preview"] as EditorMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setEditorMode(m)}
                    className={`px-2 sm:px-2.5 py-1 capitalize transition-colors ${
                      editorMode === m ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setEditorMode(editorMode === "history" ? "edit" : "history")}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-[12px] rounded-md border transition-colors ${
                  editorMode === "history" ? "border-primary/30 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                }`}
                title="Revision history"
              >
                <History className="w-3 h-3" />
                <span className="hidden sm:inline">History</span>
              </button>

              <button
                onClick={() => setEditingPost({ ...editingPost, protected: !editingPost.protected })}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-[12px] rounded-md border transition-colors ${
                  editingPost.protected ? "border-primary/30 text-primary" : "border-border text-muted-foreground"
                }`}
                title="Password-protect this page"
              >
                <Lock className="w-3 h-3" />
                <span className="hidden sm:inline">{editingPost.protected ? "Protected" : "Public"}</span>
              </button>

              <button
                onClick={() => setEditingPost({ ...editingPost, published: !editingPost.published })}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-[12px] rounded-md border transition-colors ${
                  editingPost.published ? "border-primary/30 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                {editingPost.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span className="hidden xs:inline">{editingPost.published ? "Published" : "Draft"}</span>
              </button>

              <button
                onClick={handleSavePost}
                className="flex items-center gap-1 px-3 py-1 text-[12px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
              >
                <Save className="w-3 h-3" /> Save
              </button>
            </div>
          </div>
        </div>

        {/* Metadata fields */}
        <div className="border-b border-border">
          <div className="max-w-[90rem] mx-auto px-3 sm:px-6 py-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Title</label>
              <input
                value={editingPost.title}
                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                className="w-full px-2.5 py-1.5 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Category</label>
              <div className="relative">
                <select
                  value={editingPost.category}
                  onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                  className="w-full appearance-none px-2.5 py-1.5 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring pr-7"
                >
                  {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Tags</label>
              <input
                value={editingPost.tags.join(", ")}
                onChange={(e) => setEditingPost({ ...editingPost, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                className="w-full px-2.5 py-1.5 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
                placeholder="comma separated"
              />
            </div>
          </div>
        </div>

        {/* Editor / Preview / History area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {editorMode === "history" ? (
            <RevisionHistory postId={editingPost.id} currentContent={editingPost.content} onRestore={(content) => {
              setEditingPost({ ...editingPost, content });
              setEditorMode("edit");
            }} />
          ) : (
            <>
              {(editorMode === "edit" || editorMode === "split") && (
                <div className={`${editorMode === "split" ? "md:w-1/2 md:border-r border-b md:border-b-0 border-border" : "w-full"} flex flex-col min-h-[40vh] md:min-h-0`}>
                  <MarkdownEditor
                    value={editingPost.content}
                    onChange={(content) => setEditingPost({ ...editingPost, content, excerpt: content.substring(0, 120).replace(/[#*\n]/g, "").trim() })}
                  />
                </div>
              )}
              {(editorMode === "preview" || editorMode === "split") && (
                <div className={`${editorMode === "split" ? "md:w-1/2" : "w-full"} overflow-y-auto p-4 sm:p-5 scrollbar-thin min-h-[40vh] md:min-h-0`}>
                  <div className="max-w-3xl mx-auto"><MarkdownRenderer content={editingPost.content} /></div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <h1 className="text-[1.25rem] sm:text-[1.5rem] font-bold tracking-[-0.02em] text-foreground mb-1">Admin</h1>
        <p className="text-[13px] text-muted-foreground mb-6">Manage posts, categories, and settings.</p>

        <GitHubSync />

        <div className="flex gap-0.5 mb-6 border-b border-border">
          {(["posts", "categories", "settings"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-[13px] font-medium capitalize border-b-2 -mb-px transition-colors ${
                tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "posts" && (
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button onClick={handleNewPost} className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
                <Plus className="w-3.5 h-3.5" /> New post
              </button>
              {/* Template buttons */}
              <div className="flex items-center gap-1">
                {docTemplates.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => handleNewFromTemplate(tpl.content)}
                    className="flex items-center gap-1 px-2 py-1.5 text-[11px] rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
                    title={tpl.description}
                  >
                    <FileText className="w-3 h-3" /> {tpl.name}
                  </button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <button
                  onClick={() => exportAllAsMarkdown(posts)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Download className="w-3 h-3" /> Export .md
                </button>
                <button
                  onClick={() => exportAllAsJSON(posts)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Download className="w-3 h-3" /> Export JSON
                </button>
              </div>
            </div>
            <FileUpload defaultCategory={categories[0]?.slug || "guides"} onComplete={fetchPosts} />
            <div className="border border-border rounded-md divide-y divide-border">
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between px-3 sm:px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] sm:text-[14px] font-medium text-foreground truncate flex items-center gap-1.5">
                      {post.title}
                      {post.protected && <Lock className="w-3 h-3 text-primary shrink-0" />}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 font-mono flex gap-2">
                      <span className="truncate">{post.category}</span>
                      <span>·</span>
                      <span className={post.published ? "text-primary" : ""}>{post.published ? "published" : "draft"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 ml-2">
                    <button onClick={() => setEditingPost(post)} className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeletePost(post.id)} className="p-1.5 rounded text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">No posts yet</div>
              )}
            </div>
          </div>
        )}

        {tab === "categories" && (
          <div>
            <div className="flex gap-2 mb-4">
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                placeholder="Category name"
                className="flex-1 min-w-0 px-2.5 py-1.5 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
              />
              <button onClick={handleAddCategory} className="px-3 py-1.5 text-[13px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium shrink-0">
                Add
              </button>
            </div>
            <div className="border border-border rounded-md divide-y divide-border">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between px-3 sm:px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-[13px] sm:text-[14px] font-medium text-foreground">{cat.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate">{cat.slug}</div>
                  </div>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 rounded text-muted-foreground hover:text-destructive transition-colors shrink-0 ml-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="space-y-6">
            {/* Auth gate password */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-primary" />
                <h3 className="text-[14px] font-semibold text-foreground">Content Protection</h3>
              </div>
              <p className="text-[12px] text-muted-foreground mb-3">
                Set a password to protect docs marked as "Protected". Readers must enter this password to view protected pages.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={gatePass}
                  onChange={(e) => setGatePass(e.target.value)}
                  placeholder="Set protection password"
                  className="flex-1 min-w-0 px-3 py-1.5 text-[13px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring font-mono"
                />
                <button
                  onClick={() => { setGatePassword(gatePass); }}
                  className="px-3 py-1.5 text-[12px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium shrink-0"
                >
                  Save
                </button>
              </div>
              {!gatePass && (
                <p className="text-[11px] text-muted-foreground/60 mt-2">No password set — protected pages will be visible to everyone.</p>
              )}
            </div>

            {/* Webhook notifications */}
            <WebhookSettings />
          </div>
        )}
      </main>
    </div>
  );
}

function WebhookSettings() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(() => getWebhookConfigs());
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState<"slack" | "discord" | "custom">("slack");
  const [testing, setTesting] = useState<string | null>(null);

  const refresh = () => setWebhooks(getWebhookConfigs());

  const handleAdd = () => {
    if (!newName.trim() || !newUrl.trim()) return;
    saveWebhookConfig({
      id: Date.now().toString(36),
      name: newName.trim(),
      type: newType,
      url: newUrl.trim(),
      enabled: true,
      events: ["publish", "update"],
    });
    setNewName("");
    setNewUrl("");
    setShowAdd(false);
    refresh();
  };

  const handleTest = async (wh: WebhookConfig) => {
    setTesting(wh.id);
    await testWebhook(wh);
    setTimeout(() => setTesting(null), 1500);
  };

  const handleDelete = (id: string) => {
    deleteWebhookConfig(id);
    refresh();
  };

  const handleToggle = (wh: WebhookConfig) => {
    saveWebhookConfig({ ...wh, enabled: !wh.enabled });
    refresh();
  };

  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="text-[14px] font-semibold text-foreground">Webhook Notifications</h3>
        </div>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="px-2.5 py-1 text-[11px] rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-3 h-3 inline mr-1" /> Add
          </button>
        )}
      </div>
      <p className="text-[12px] text-muted-foreground mb-3">
        Send notifications to Slack, Discord, or custom webhooks when docs are published or updated.
      </p>

      {showAdd && (
        <div className="p-3 mb-3 rounded-md border border-border bg-background space-y-2">
          <div className="flex gap-1.5">
            {(["slack", "discord", "custom"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setNewType(t)}
                className={`px-2 py-0.5 text-[11px] rounded border capitalize transition-colors ${
                  newType === t ? "border-primary/30 text-primary bg-primary/5" : "border-border text-muted-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Webhook name (e.g. #docs-updates)"
            className="w-full px-2.5 py-1.5 text-[12px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://hooks.slack.com/services/..."
            className="w-full px-2.5 py-1.5 text-[12px] rounded-md border border-border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring font-mono"
          />
          <div className="flex items-center gap-2">
            <button onClick={handleAdd} className="px-3 py-1 text-[11px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
              Add webhook
            </button>
            <button onClick={() => setShowAdd(false)} className="px-3 py-1 text-[11px] rounded-md border border-border text-muted-foreground hover:text-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      {webhooks.length === 0 && !showAdd && (
        <p className="text-[11px] text-muted-foreground/60">No webhooks configured.</p>
      )}

      <div className="space-y-1.5">
        {webhooks.map((wh) => (
          <div key={wh.id} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background">
            <button
              onClick={() => handleToggle(wh)}
              className={`w-2 h-2 rounded-full shrink-0 ${wh.enabled ? "bg-[hsl(142,60%,45%)]" : "bg-muted-foreground/30"}`}
              title={wh.enabled ? "Enabled" : "Disabled"}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-foreground truncate">{wh.name}</div>
              <div className="text-[10px] text-muted-foreground font-mono truncate">{wh.type} · {wh.url.slice(0, 40)}...</div>
            </div>
            <button
              onClick={() => handleTest(wh)}
              className="px-2 py-0.5 text-[10px] rounded border border-border text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              {testing === wh.id ? "Sent!" : "Test"}
            </button>
            <button onClick={() => handleDelete(wh.id)} className="p-1 text-muted-foreground hover:text-destructive shrink-0">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevisionHistory({ postId, currentContent, onRestore }: { postId: string; currentContent: string; onRestore: (content: string) => void }) {
  const revisions = getRevisions(postId);
  const [selected, setSelected] = useState<Revision | null>(null);

  if (revisions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[13px] text-muted-foreground p-8">
        No revisions yet. Save the post to create your first revision.
      </div>
    );
  }

  const diff = selected ? diffRevisions(selected.content, currentContent) : null;

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-border overflow-y-auto scrollbar-thin">
        <div className="p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground mb-2">
            Revisions ({revisions.length})
          </p>
          <div className="space-y-1">
            {revisions.map((rev) => (
              <button
                key={rev.id}
                onClick={() => setSelected(rev)}
                className={`w-full text-left px-2.5 py-2 rounded-md text-[12px] transition-colors ${
                  selected?.id === rev.id
                    ? "bg-primary/[0.08] text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <div className="font-medium truncate">{rev.title}</div>
                <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  {new Date(rev.timestamp).toLocaleString("en-US", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {selected && diff ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-muted-foreground">Comparing revision to current content</p>
              <button
                onClick={() => onRestore(selected.content)}
                className="px-3 py-1 text-[12px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
              >
                Restore this version
              </button>
            </div>
            <div className="font-mono text-[12px] leading-relaxed rounded-md border border-border overflow-hidden">
              {diff.map((line, i) => (
                <div
                  key={i}
                  className={`px-3 py-0.5 ${
                    line.type === "add"
                      ? "bg-[hsl(142,60%,45%)]/[0.08] text-foreground"
                      : line.type === "remove"
                      ? "bg-destructive/[0.08] text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="inline-block w-4 shrink-0 text-muted-foreground/50 select-none">
                    {line.type === "add" ? "+" : line.type === "remove" ? "−" : " "}
                  </span>
                  {line.text || " "}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-[13px] text-muted-foreground">
            Select a revision to compare
          </div>
        )}
      </div>
    </div>
  );
}
