const fs = require('fs');

let content = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

// We'll replace the existing mapping logic with a PostCard component and grid.
// First, add the PostCard component at the top, just below imports.
const postCardCode = `
import { Clock, ArrowRight, PenLine, Eye, ShieldAlert, Key } from "lucide-react";

function DashboardPostCard({ post }: { post: any }) {
  const readTime = Math.max(1, Math.ceil((post.content || "").split(/\\s+/).length / 200));

  return (
    <Link
      to={\`/blog/\${post.slug}\`}
      className="group block rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      {post.cover_image_url && (
        <div className="overflow-hidden h-40">
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2.5">
          <span
            className={\`px-2 py-0.5 rounded-md font-medium text-[10px] uppercase tracking-wider \${
              post.published
                ? "bg-green-500/10 text-green-600"
                : "bg-orange-500/10 text-orange-600"
            }\`}
          >
            {post.published ? (
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Public</span>
            ) : (
              <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Draft</span>
            )}
          </span>
          {post.category && (
            <span className="capitalize">{post.category.replace(/-/g, " ")}</span>
          )}
          <span>·</span>
          <span>{readTime} min read</span>
        </div>

        <h2 className="font-bold text-[16px] text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2 mb-4">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last updated {new Date(post.updated_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1 text-primary group-hover:underline">
            Read / Edit <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}
`;

// Remove the conflicting lucide-react imports if any, and inject our DashboardPostCard before export default function
content = content.replace(/import \{.*?\} from "lucide-react";/, "");

content = content.replace(
  /export default function DashboardPage\(\) \{/,
  postCardCode + "\n\nexport default function DashboardPage() {"
);

// Now update the layout part
const oldListRegex = /<div className="flex flex-col border border-border rounded-xl bg-card overflow-hidden divide-y divide-border">[\s\S]*?<\/div>\n\s*\}\)/;

const newGridCode = `
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <DashboardPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
`;

content = content.replace(oldListRegex, newGridCode);

fs.writeFileSync('src/pages/DashboardPage.tsx', content);
