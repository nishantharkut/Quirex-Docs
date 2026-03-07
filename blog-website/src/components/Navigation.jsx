import React from 'react';
import { Search, Menu, X, ArrowLeft, FileText, Settings, Home } from 'lucide-react';

const Navigation = ({ 
  currentView, 
  setCurrentView, 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory, 
  categories, 
  onBackToList, 
  selectedPost 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleNavClick = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            {currentView === 'post' && selectedPost && (
              <button
                onClick={onBackToList}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Back to blog"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold">GSoC Journey</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => handleNavClick('blog')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                currentView === 'blog' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Blog</span>
            </button>
            
            <button
              onClick={() => handleNavClick('admin')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                currentView === 'admin' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search and Category Filters - Only show on blog view */}
        {currentView === 'blog' && (
          <div className="pb-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {category === 'all' ? 'All Posts' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <button
                onClick={() => handleNavClick('blog')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'blog' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Blog</span>
              </button>
              
              <button
                onClick={() => handleNavClick('admin')}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentView === 'admin' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
