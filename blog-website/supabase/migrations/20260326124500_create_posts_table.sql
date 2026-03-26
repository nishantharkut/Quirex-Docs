-- Create the posts table used by the Supabase-backed blog/editor flows.
-- Verified against current app usage in:
--   - src/pages/AdminPage.tsx
--   - src/hooks/useBlogPosts.ts
--   - src/pages/DashboardPage.tsx
--   - src/pages/BlogPostPage.tsx
--
-- Notes:
-- - `protected` and `language` exist only in local/export types today and are not
--   persisted to Supabase by the current app.
-- - `cover_image_url` is read by multiple pages even though the current editor
--   does not expose it yet, so the column is included.

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  published BOOLEAN NOT NULL DEFAULT false,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT posts_user_id_slug_key UNIQUE (user_id, slug)
);

COMMENT ON TABLE public.posts IS 'User-authored blog posts and docs content.';
COMMENT ON COLUMN public.posts.slug IS 'Per-user unique slug used in public blog URLs.';
COMMENT ON COLUMN public.posts.published IS 'Whether the post is visible on public surfaces.';

CREATE INDEX IF NOT EXISTS posts_slug_idx
  ON public.posts (slug);

CREATE INDEX IF NOT EXISTS posts_published_created_at_idx
  ON public.posts (published, created_at DESC);

CREATE INDEX IF NOT EXISTS posts_user_id_updated_at_idx
  ON public.posts (user_id, updated_at DESC);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Explicit grants keep PostgREST behavior predictable even if default privileges
-- differ between projects. RLS policies below still control actual access.
GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;

DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can view all posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can update posts" ON public.posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;

CREATE POLICY "Anyone can view published posts"
  ON public.posts FOR SELECT
  TO authenticated, anon
  USING (published = true);

CREATE POLICY "Users can view own posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all posts"
  ON public.posts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
