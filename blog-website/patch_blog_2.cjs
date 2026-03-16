const fs = require('fs');
let content = fs.readFileSync('src/pages/BlogPostPage.tsx', 'utf8');

const updatedExportFunc = `  const exportToFile = async () => {
    if ((window as any).electronAPI) {
      const success = await (window as any).electronAPI.saveLocalFile(editedContent || post?.content || "", post?.title || "untitled");
      if (success) {
        toast.success("Saved to local file system!");
        (window as any).electronAPI.showNotification("Success", "Blog post successfully saved to disk.");
      }
    } else {
      toast.info("Native file access requires the desktop app");
    }
  };

  const importFromFile = async () => {
    if ((window as any).electronAPI) {
      const fileContent = await (window as any).electronAPI.openLocalFile();
      if (fileContent) {
        setEditedContent(fileContent);
        toast.success("Loaded from local file!");
      }
    } else {
      toast.info("Native file access requires the desktop app");
    }
  };`;

content = content.replace(
  /const exportToFile = async \(\) => \{[\s\S]*?toast\.info\("Native file access requires the desktop app"\);\s*\}\s*\};/,
  updatedExportFunc
);

const extraButtons = `
            {isEditing && (
              <>
                <button
                  onClick={importFromFile}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-background border border-border hover:bg-muted ml-auto"
                >
                  <MonitorUp className="w-4 h-4" /> Import Local
                </button>
                <button
                  onClick={exportToFile}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-background border border-border hover:bg-muted"
                >
                  <Save className="w-4 h-4" /> Export Local
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save to Cloud"}
                </button>
              </>
            )}
`;

content = content.replace(
  /\{isEditing && \([\s\S]*?Save Changes"\}\s*<\/button>\s*\)\}/,
  extraButtons
);

fs.writeFileSync('src/pages/BlogPostPage.tsx', content);
