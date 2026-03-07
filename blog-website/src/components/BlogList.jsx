import React from 'react';
import { Calendar, Clock, User, FileText, Search } from 'lucide-react';

const BlogList = ({ posts, loading, error, onPostSelect, searchTerm, selectedCategory }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <FileText className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Posts</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No posts found</h2>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or category filter' 
              : 'No markdown files available yet'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {selectedCategory === 'all' ? 'All Posts' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
        </h1>
        <span className="text-gray-500">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </span>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => onPostSelect(post)}
          >
            {/* Post Header */}
            <div className="p-6">
              {/* Category Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {post.category}
                </span>
                <span className="text-xs text-gray-500">
                  {post.readingTime} min read
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {post.excerpt}
              </p>

              {/* Meta Information */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTime}m</span>
                </div>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    >
                      #{tag}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      +{post.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Hover Indicator */}
            <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></div>
          </article>
        ))}
      </div>

      {/* Load More Indicator (for future pagination) */}
      {posts.length > 9 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            Showing {posts.length} of {posts.length} posts
          </p>
        </div>
      )}
    </div>
  );
};

export default BlogList;
