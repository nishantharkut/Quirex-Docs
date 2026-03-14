export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: string;
  /** If set, this post requires a password to view */
  protected?: boolean;
  /** Language code (default: "en") */
  language?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export interface Comment {
  id: string;
  postSlug: string;
  /** Paragraph index or heading ID anchor */
  anchor: string;
  author: string;
  text: string;
  createdAt: string;
}
