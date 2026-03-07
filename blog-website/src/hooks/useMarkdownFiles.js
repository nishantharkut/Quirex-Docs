import { useState, useEffect } from 'react';

export const useMarkdownFiles = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const extractFrontMatter = (content) => {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);
    
    if (match) {
      const frontMatter = match[1];
      const markdown = match[2];
      
      const metadata = {};
      frontMatter.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          metadata[key] = value;
        }
      });
      
      return { metadata, content: markdown };
    }
    
    return { metadata: {}, content };
  };

  const extractTitle = (content, filename) => {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    
    const frontMatterResult = extractFrontMatter(content);
    if (frontMatterResult.metadata.title) {
      return frontMatterResult.metadata.title;
    }
    
    return filename.replace(/\.md$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const extractExcerpt = (content, maxLength = 150) => {
    const cleanContent = content.replace(/^#+\s+/gm, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    const plainText = cleanContent.replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    const excerpt = plainText.replace(/\n+/g, ' ').trim();
    
    if (excerpt.length <= maxLength) {
      return excerpt;
    }
    
    return excerpt.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  };

  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const cleanContent = content.replace(/^#+\s+/gm, '').replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    const words = cleanContent.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const processMarkdownFile = async (filename, content) => {
    const { metadata, content: markdownContent } = extractFrontMatter(content);
    const title = metadata.title || extractTitle(content, filename);
    const excerpt = metadata.excerpt || extractExcerpt(markdownContent);
    const readingTime = metadata.readingTime || calculateReadingTime(markdownContent);
    
    const pathParts = filename.split('/');
    let category = 'general';
    if (pathParts.length > 1) {
      category = pathParts[0];
    }

    return {
      id: filename,
      filename,
      title,
      excerpt,
      content: markdownContent,
      category,
      readingTime,
      date: metadata.date || new Date().toISOString().split('T')[0],
      author: metadata.author || 'Anonymous',
      tags: metadata.tags ? metadata.tags.split(',').map(tag => tag.trim()) : [],
      metadata
    };
  };

  const loadMarkdownFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const markdownFiles = [
        'Final Orgs GSOC/KIWIX/Guide.md',
        'Final Orgs GSOC/URAMAKI LAB/# RUXAILAB — GSoC 2026 Contribution.md',
        'Final Orgs GSOC/URAMAKI LAB/Guide.md',
        'Learning unlimited/GSOC/Important Points.md',
        'Learning unlimited/GSOC/Initial-Proposal-1.md',
        'Learning unlimited/GSOC/Key Findings from GSoC Discussions.md',
        'Learning unlimited/GSOC/Q&A.md',
        'Learning unlimited/Issues tracker/# ESP-Website Comprehensive Issue.md',
        'Learning unlimited/Issues tracker/# ESP-Website GSoC 2026 Aligned Iss.md',
        'Learning unlimited/Issues tracker/Phase 3 Issue Tickets.md',
        'Learning unlimited/Issues tracker/Phase 3 Issues.md',
        'README.md'
      ];

      const processedPosts = [];
      
      for (const filename of markdownFiles) {
        try {
          const response = await fetch(`/md-files/${filename}`);
          if (!response.ok) {
            console.warn(`Could not load ${filename}: ${response.statusText}`);
            continue;
          }
          
          const content = await response.text();
          const post = await processMarkdownFile(filename, content);
          processedPosts.push(post);
        } catch (fileError) {
          console.warn(`Error processing ${filename}:`, fileError);
        }
      }

      processedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      const uniqueCategories = ['all', ...new Set(processedPosts.map(post => post.category))];
      
      setPosts(processedPosts);
      setCategories(uniqueCategories);
    } catch (err) {
      setError('Failed to load markdown files');
      console.error('Error loading markdown files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarkdownFiles();
  }, []);

  return { posts, categories, loading, error, refreshPosts: loadMarkdownFiles };
};
