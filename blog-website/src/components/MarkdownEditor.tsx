import { useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  CodeSquare,
  Link,
  Image,
  Minus,
  Table,
  Undo2,
  Redo2,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

type Action = {
  icon: React.ReactNode;
  label: string;
  action: (ta: HTMLTextAreaElement) => { text: string; selStart: number; selEnd: number };
  separator?: false;
} | {
  separator: true;
};

function wrap(ta: HTMLTextAreaElement, before: string, after: string) {
  const { selectionStart: s, selectionEnd: e, value } = ta;
  const selected = value.slice(s, e);
  const text = value.slice(0, s) + before + selected + after + value.slice(e);
  return { text, selStart: s + before.length, selEnd: e + before.length };
}

function linePrefix(ta: HTMLTextAreaElement, prefix: string) {
  const { selectionStart: s, selectionEnd: e, value } = ta;
  const lineStart = value.lastIndexOf("\n", s - 1) + 1;
  const text = value.slice(0, lineStart) + prefix + value.slice(lineStart);
  return { text, selStart: s + prefix.length, selEnd: e + prefix.length };
}

const actions: Action[] = [
  { icon: <Bold className="w-3.5 h-3.5" />, label: "Bold", action: (ta) => wrap(ta, "**", "**") },
  { icon: <Italic className="w-3.5 h-3.5" />, label: "Italic", action: (ta) => wrap(ta, "*", "*") },
  { icon: <Strikethrough className="w-3.5 h-3.5" />, label: "Strikethrough", action: (ta) => wrap(ta, "~~", "~~") },
  { icon: <Code className="w-3.5 h-3.5" />, label: "Inline code", action: (ta) => wrap(ta, "`", "`") },
  { separator: true },
  { icon: <Heading1 className="w-3.5 h-3.5" />, label: "Heading 1", action: (ta) => linePrefix(ta, "# ") },
  { icon: <Heading2 className="w-3.5 h-3.5" />, label: "Heading 2", action: (ta) => linePrefix(ta, "## ") },
  { icon: <Heading3 className="w-3.5 h-3.5" />, label: "Heading 3", action: (ta) => linePrefix(ta, "### ") },
  { separator: true },
  { icon: <List className="w-3.5 h-3.5" />, label: "Bullet list", action: (ta) => linePrefix(ta, "- ") },
  { icon: <ListOrdered className="w-3.5 h-3.5" />, label: "Numbered list", action: (ta) => linePrefix(ta, "1. ") },
  { icon: <CheckSquare className="w-3.5 h-3.5" />, label: "Task list", action: (ta) => linePrefix(ta, "- [ ] ") },
  { separator: true },
  { icon: <Quote className="w-3.5 h-3.5" />, label: "Blockquote", action: (ta) => linePrefix(ta, "> ") },
  {
    icon: <CodeSquare className="w-3.5 h-3.5" />,
    label: "Code block",
    action: (ta) => wrap(ta, "```\n", "\n```"),
  },
  {
    icon: <Table className="w-3.5 h-3.5" />,
    label: "Table",
    action: (ta) => {
      const table = "\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n";
      const { selectionStart: s, value } = ta;
      return { text: value.slice(0, s) + table + value.slice(s), selStart: s + table.length, selEnd: s + table.length };
    },
  },
  { icon: <Minus className="w-3.5 h-3.5" />, label: "Divider", action: (ta) => {
    const { selectionStart: s, value } = ta;
    const hr = "\n---\n";
    return { text: value.slice(0, s) + hr + value.slice(s), selStart: s + hr.length, selEnd: s + hr.length };
  }},
  { separator: true },
  {
    icon: <Link className="w-3.5 h-3.5" />,
    label: "Link",
    action: (ta) => {
      const { selectionStart: s, selectionEnd: e, value } = ta;
      const selected = value.slice(s, e) || "text";
      const text = value.slice(0, s) + `[${selected}](url)` + value.slice(e);
      return { text, selStart: s + 1, selEnd: s + 1 + selected.length };
    },
  },
  {
    icon: <Image className="w-3.5 h-3.5" />,
    label: "Image",
    action: (ta) => {
      const { selectionStart: s, selectionEnd: e, value } = ta;
      const alt = value.slice(s, e) || "alt text";
      const text = value.slice(0, s) + `![${alt}](url)` + value.slice(e);
      return { text, selStart: s + 2, selEnd: s + 2 + alt.length };
    },
  },
];

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const historyRef = useRef<{ stack: string[]; idx: number }>({ stack: [value], idx: 0 });

  const pushHistory = useCallback((text: string) => {
    const h = historyRef.current;
    // Trim forward history
    h.stack = h.stack.slice(0, h.idx + 1);
    h.stack.push(text);
    if (h.stack.length > 100) h.stack.shift();
    h.idx = h.stack.length - 1;
  }, []);

  const handleAction = useCallback(
    (action: (ta: HTMLTextAreaElement) => { text: string; selStart: number; selEnd: number }) => {
      const ta = textareaRef.current;
      if (!ta) return;
      ta.focus();
      const result = action(ta);
      onChange(result.text);
      pushHistory(result.text);
      requestAnimationFrame(() => {
        ta.selectionStart = result.selStart;
        ta.selectionEnd = result.selEnd;
      });
    },
    [onChange, pushHistory]
  );

  const handleUndo = useCallback(() => {
    const h = historyRef.current;
    if (h.idx > 0) {
      h.idx--;
      onChange(h.stack[h.idx]);
    }
  }, [onChange]);

  const handleRedo = useCallback(() => {
    const h = historyRef.current;
    if (h.idx < h.stack.length - 1) {
      h.idx++;
      onChange(h.stack[h.idx]);
    }
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const ta = e.currentTarget;

      // Tab indentation
      if (e.key === "Tab") {
        e.preventDefault();
        const { selectionStart: s, selectionEnd: end } = ta;
        if (e.shiftKey) {
          // Unindent
          const lineStart = ta.value.lastIndexOf("\n", s - 1) + 1;
          if (ta.value.slice(lineStart, lineStart + 2) === "  ") {
            const text = ta.value.slice(0, lineStart) + ta.value.slice(lineStart + 2);
            onChange(text);
            pushHistory(text);
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s - 2; });
          }
        } else {
          const text = ta.value.slice(0, s) + "  " + ta.value.slice(end);
          onChange(text);
          pushHistory(text);
          requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; });
        }
        return;
      }

      // Ctrl/Cmd shortcuts
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "b") { e.preventDefault(); handleAction((t) => wrap(t, "**", "**")); }
        if (e.key === "i") { e.preventDefault(); handleAction((t) => wrap(t, "*", "*")); }
        if (e.key === "k") {
          e.preventDefault();
          const linkAction = actions.find((a): a is Exclude<Action, { separator: true }> => !("separator" in a && a.separator) && "label" in a && a.label === "Link");
          if (linkAction) handleAction(linkAction.action);
        }
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); handleUndo(); }
        if (e.key === "z" && e.shiftKey) { e.preventDefault(); handleRedo(); }
      }

      // Auto-continue lists on Enter
      if (e.key === "Enter") {
        const { selectionStart: s } = ta;
        const lineStart = ta.value.lastIndexOf("\n", s - 1) + 1;
        const currentLine = ta.value.slice(lineStart, s);

        // Match list patterns
        const bulletMatch = currentLine.match(/^(\s*)([-*+])\s/);
        const orderedMatch = currentLine.match(/^(\s*)(\d+)\.\s/);
        const taskMatch = currentLine.match(/^(\s*)- \[([ x])\]\s/);

        let continuation = "";
        if (taskMatch) {
          // If line is empty task item, remove it
          if (currentLine.trim() === "- [ ]" || currentLine.trim() === "- [x]") {
            e.preventDefault();
            const text = ta.value.slice(0, lineStart) + "\n" + ta.value.slice(s);
            onChange(text);
            pushHistory(text);
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = lineStart + 1; });
            return;
          }
          continuation = `${taskMatch[1]}- [ ] `;
        } else if (bulletMatch) {
          if (currentLine.trim() === "-" || currentLine.trim() === "*" || currentLine.trim() === "+") {
            e.preventDefault();
            const text = ta.value.slice(0, lineStart) + "\n" + ta.value.slice(s);
            onChange(text);
            pushHistory(text);
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = lineStart + 1; });
            return;
          }
          continuation = `${bulletMatch[1]}${bulletMatch[2]} `;
        } else if (orderedMatch) {
          if (currentLine.trim().match(/^\d+\.$/)) {
            e.preventDefault();
            const text = ta.value.slice(0, lineStart) + "\n" + ta.value.slice(s);
            onChange(text);
            pushHistory(text);
            requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = lineStart + 1; });
            return;
          }
          continuation = `${orderedMatch[1]}${parseInt(orderedMatch[2]) + 1}. `;
        }

        if (continuation) {
          e.preventDefault();
          const text = ta.value.slice(0, s) + "\n" + continuation + ta.value.slice(s);
          onChange(text);
          pushHistory(text);
          const newPos = s + 1 + continuation.length;
          requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = newPos; });
        }
      }
    },
    [onChange, pushHistory, handleAction, handleUndo, handleRedo]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
      pushHistory(e.target.value);
    },
    [onChange, pushHistory]
  );

  const wordCount = value.split(/\s+/).filter(Boolean).length;
  const charCount = value.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-0 px-1.5 sm:px-2 py-1 sm:py-1.5 border-b border-border bg-muted/30 overflow-x-auto scrollbar-thin shrink-0">
        <div className="flex items-center gap-0 shrink-0">
          {actions.map((item, i) => {
            if ("separator" in item && item.separator) {
              return <div key={i} className="w-px h-4 bg-border mx-0.5 sm:mx-1 shrink-0" />;
            }
            const a = item as Exclude<Action, { separator: true }>;
            return (
              <button
                key={i}
                onClick={() => handleAction(a.action)}
                title={a.label}
                className="p-1 sm:p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              >
                {a.icon}
              </button>
            );
          })}
          <div className="w-px h-4 bg-border mx-0.5 sm:mx-1 shrink-0" />
          <button onClick={handleUndo} title="Undo (Ctrl+Z)" className="p-1 sm:p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleRedo} title="Redo (Ctrl+Shift+Z)" className="p-1 sm:p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-3 pr-1 shrink-0">
          <span className="text-[10px] text-muted-foreground/50 font-mono hidden sm:inline">
            {wordCount} words · {readTime} min read
          </span>
          <span className="text-[11px] text-muted-foreground/50 font-mono hidden lg:inline">
            ⌘B bold · ⌘I italic · ⌘K link
          </span>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="flex-1 w-full p-3 sm:p-5 text-[13px] leading-relaxed bg-background text-foreground outline-none resize-none font-mono scrollbar-thin min-h-[200px]"
        spellCheck={false}
        placeholder="Start writing markdown..."
      />
    </div>
  );
}
