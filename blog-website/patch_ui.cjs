const fs = require('fs');
let content = fs.readFileSync('src/pages/BlogPostPage.tsx', 'utf8');

const toolbar = `
        {/* Author Toolbar */}
        {isAuthor && (
          <div className="flex flex-wrap items-center gap-2 p-3 mb-6 bg-muted/30 border border-border rounded-lg">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-background border border-border hover:bg-muted"
            >
              {isEditing ? <Eye className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {isEditing ? "View Mode" : "Edit Mode"}
            </button>
            <button
              onClick={togglePublished}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-background border border-border hover:bg-muted"
            >
              {post.published ? (
                <><Eye className="w-4 h-4 text-green-500" /> Public</>
              ) : (
                <><ShieldAlert className="w-4 h-4 text-orange-500" /> Private Draft</>
              )}
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 ml-auto"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        )}
`;

content = content.replace(
  '{/* Cover image */}',
  toolbar + '\n        {/* Cover image */}'
);

const editorReplace = `
        {/* Content */}
        <div className="prose-lg w-full max-w-none">
          {isEditing ? (
            <div className="border border-border rounded-xl mt-4 overflow-hidden h-[600px]">
              <MarkdownEditor
                value={editedContent}
                onChange={setEditedContent}
              />
            </div>
          ) : (
            <MarkdownRenderer content={post.content || ""} />
          )}
        </div>
`;

content = content.replace(
  /<div className="prose-lg">\s*<MarkdownRenderer content=\{post\.content \|\| ""\} \/>\s*<\/div>/g,
  editorReplace
);

fs.writeFileSync('src/pages/BlogPostPage.tsx', content);
