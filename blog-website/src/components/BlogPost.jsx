import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Calendar, Clock, User, Tag, ArrowLeft, Share2 } from 'lucide-react';

const BlogPost = ({ post, onBackToList }) => {
  const [isDarkMode, setIsDarkMode] = React.useState(
    document.documentElement.classList.contains('dark')
  );

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBackToList}
        className="mb-6 flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to blog</span>
      </button>

      {/* Article Header */}
      <header className="mb-8 pb-8 border-b">
        {/* Category */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
            {post.category}
          </span>
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-3 py-1 rounded-lg text-sm hover:bg-muted transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(post.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{post.readingTime} min read</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Article Content */}
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSlug, rehypeHighlight]}
          components={{
            // Code blocks with syntax highlighting
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              
              if (!inline && language) {
                return (
                  <div className="relative group">
                    <SyntaxHighlighter
                      style={isDarkMode ? oneDark : oneLight}
                      language={language}
                      PreTag="div"
                      className="rounded-lg"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => copyCode(String(children).replace(/\n$/, ''))}
                      className="absolute top-2 right-2 p-2 bg-muted/80 hover:bg-muted text-muted-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy code"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                );
              }
              
              return (
                <code className={`${className} px-1.5 py-0.5 bg-muted rounded text-sm font-mono`} {...props}>
                  {children}
                </code>
              );
            },
            
            // Headings with anchor links
            h1({ children, ...props }) {
              return (
                <h1 className="text-3xl font-bold mt-8 mb-4 first:mt-0" {...props}>
                  {children}
                </h1>
              );
            },
            
            h2({ children, ...props }) {
              return (
                <h2 className="text-2xl font-semibold mt-8 mb-4" {...props}>
                  {children}
                </h2>
              );
            },
            
            h3({ children, ...props }) {
              return (
                <h3 className="text-xl font-semibold mt-6 mb-3" {...props}>
                  {children}
                </h3>
              );
            },
            
            // Tables
            table({ children, ...props }) {
              return (
                <div className="overflow-x-auto my-6">
                  <table className="min-w-full border-collapse border border-border" {...props}>
                    {children}
                  </table>
                </div>
              );
            },
            
            th({ children, ...props }) {
              return (
                <th className="border border-border bg-muted px-4 py-2 text-left font-semibold" {...props}>
                  {children}
                </th>
              );
            },
            
            td({ children, ...props }) {
              return (
                <td className="border border-border px-4 py-2" {...props}>
                  {children}
                </td>
              );
            },
            
            // Blockquotes
            blockquote({ children, ...props }) {
              return (
                <blockquote className="border-l-4 border-primary pl-4 py-2 my-6 bg-muted/50" {...props}>
                  {children}
                </blockquote>
              );
            },
            
            // Links
            a({ children, href, ...props }) {
              return (
                <a 
                  href={href} 
                  className="text-primary hover:underline font-medium" 
                  target={href?.startsWith('http') ? '_blank' : '_self'}
                  rel={href?.startsWith('http') ? 'noopener noreferrer' : ''}
                  {...props}
                >
                  {children}
                </a>
              );
            },
            
            // Lists
            ul({ children, ...props }) {
              return (
                <ul className="list-disc list-inside my-4 space-y-2" {...props}>
                  {children}
                </ul>
              );
            },
            
            ol({ children, ...props }) {
              return (
                <ol className="list-decimal list-inside my-4 space-y-2" {...props}>
                  {children}
                </ol>
              );
            },
            
            // Images
            img({ src, alt, ...props }) {
              return (
                <img 
                  src={src} 
                  alt={alt} 
                  className="rounded-lg my-6 max-w-full h-auto"
                  loading="lazy"
                  {...props} 
                />
              );
            },
            
            // Horizontal rule
            hr({ ...props }) {
              return (
                <hr className="my-8 border-border" {...props} />
              );
            }
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Article Footer */}
      <footer className="mt-12 pt-8 border-t">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Last updated: {new Date(post.date).toLocaleDateString()}
          </div>
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share this post</span>
          </button>
        </div>
      </footer>
    </article>
  );
};

export default BlogPost;
