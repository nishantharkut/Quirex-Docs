const fs = require('fs');

let content = fs.readFileSync('src/pages/BlogPostPage.tsx', 'utf8');

// Insert useAuth and more imports
content = content.replace(
  'import { usePageMeta } from "@/hooks/usePageMeta";',
  `import { usePageMeta } from "@/hooks/usePageMeta";
import { useAuth } from "@/hooks/useAuth";
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { toast } from "sonner";`
);

content = content.replace(
  'import { Calendar, Clock, ArrowLeft, User } from "lucide-react";',
  'import { Calendar, Clock, ArrowLeft, User, Edit2, Save, Eye, Check, X, ShieldOff, ShieldAlert, MonitorUp } from "lucide-react";'
);

content = content.replace(
  'export default function BlogPostPage() {',
  `export default function BlogPostPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(false);`
);

content = content.replace(
  'const { data: post, isLoading } = useBlogPost(slug || "");',
  `const { data: post, isLoading, refetch } = useBlogPost(slug || "");

  useEffect(() => {
    if (post) setEditedContent(post.content || "");
  }, [post]);`
);

const saveFunc = `
  const isAuthor = user?.id === post?.user_id;

  const handleSave = async () => {
    if (!post || !user) return;
    setIsSaving(true);
    const { error } = await supabase
      .from("posts")
      .update({ content: editedContent })
      .eq("id", post.id);

    setIsSaving(false);
    if (error) {
      toast.error("Failed to save changes.");
    } else {
      toast.success("Post updated!");
      refetch();
      setIsEditing(false);
    }
  };

  const togglePublished = async () => {
    if (!post) return;
    const newStatus = !post.published;
    const { error } = await supabase
      .from("posts")
      .update({ published: newStatus })
      .eq("id", post.id);
    if (error) {
      toast.error("Failed to update status.");
    } else {
      toast.success(newStatus ? "Post is now Public" : "Post is now Private");
      refetch();
    }
  };

  const exportToFile = async () => {
    // Basic Electron File System integration
    if ((window as any).electron) {
      // IPC would go here
    } else {
      toast.info("Native file access requires the desktop app");
    }
  };
`;

content = content.replace(
  'return (',
  saveFunc + '\n  return ('
);

fs.writeFileSync('src/pages/BlogPostPage.tsx', content);
