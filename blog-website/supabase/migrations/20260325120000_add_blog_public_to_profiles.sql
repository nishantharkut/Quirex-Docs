-- When false, the user's published posts are omitted from the public blog index,
-- homepage blog section, and search; direct URLs are not shown to other visitors.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS blog_public boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.profiles.blog_public IS 'If false, hide this user''s posts from public listings and anonymous direct links.';
