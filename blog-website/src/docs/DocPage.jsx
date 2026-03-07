import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { contentIndex } from '../content/contentIndex.generated';

function getDocBySlug(slug) {
  return contentIndex.find((d) => d.slug === slug);
}

export default function DocPage() {
  const { slug } = useParams();
  const doc = React.useMemo(() => getDocBySlug(slug), [slug]);

  const [md, setMd] = React.useState('');
  const [status, setStatus] = React.useState('loading');

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!doc) {
        setStatus('notfound');
        return;
      }

      try {
        setStatus('loading');
        // Encode each path segment individually so '#', '&', spaces etc. are safe in URLs
        const encodedPath = doc.filePath.split('/').map(encodeURIComponent).join('/');
        const res = await fetch(`./md-files/${encodedPath}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const text = await res.text();
        if (!cancelled) {
          setMd(text);
          setStatus('ready');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [doc]);

  if (!slug) return <Navigate to="/docs/home" replace />;

  if (status === 'notfound') {
    return (
      <div className="rounded-md border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Page not found</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">No document with slug &ldquo;{slug}&rdquo; exists in the index.</p>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Loading…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
        Couldn’t load this page.
      </div>
    );
  }

  // Copy-to-clipboard for code blocks
  function CodeBlock({ className = '', children, ...props }) {
    const codeRef = React.useRef(null);
    const [copied, setCopied] = React.useState(false);
    // Extract language from className (e.g. language-js)
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1] : '';

    const handleCopy = () => {
      if (codeRef.current) {
        navigator.clipboard.writeText(codeRef.current.innerText);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }
    };

    return (
      <div className="codeblock-ui relative my-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 text-xs font-mono text-gray-600 dark:text-gray-300">
          <span>{lang ? lang.toUpperCase() : 'CODE'}</span>
          <button
            onClick={handleCopy}
            className="copy-btn px-2 py-1 rounded text-xs font-semibold bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Copy code"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="scrollbar-thin overflow-x-auto m-0 p-0 bg-transparent">
          <code ref={codeRef} className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug, rehypeHighlight]}
      components={{
        a({ href, children, ...props }) {
          const isExternal = href?.startsWith('http');
          return (
            <a
              href={href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noreferrer' : undefined}
              {...props}
            >
              {children}
            </a>
          );
        },
        code({ node, inline, className, children, ...props }) {
          if (inline) {
            return (
              <code className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[0.97em] font-mono text-pink-700 dark:text-pink-300" {...props}>
                {children}
              </code>
            );
          }
          return <CodeBlock className={className}>{children}</CodeBlock>;
        },
        table({ children, ...props }) {
          return (
            <div className="my-6 w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
              <table
                {...props}
                className="table-auto min-w-[700px] w-full border-collapse text-sm"
              >
                {children}
              </table>
            </div>
          );
        },
        th({ children, ...props }) {
          return (
            <th
              {...props}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 font-semibold text-gray-700 dark:text-gray-200 text-left align-top whitespace-pre-line min-w-[80px]"
            >
              {children}
            </th>
          );
        },
        td({ children, ...props }) {
          return (
            <td
              {...props}
              className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 align-top whitespace-pre-line break-words max-w-[260px] overflow-hidden text-ellipsis"
            >
              {children}
            </td>
          );
        },
      }}
    >
      {md}
    </ReactMarkdown>
  );
}
