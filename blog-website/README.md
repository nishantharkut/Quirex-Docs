# GSoC Journey Blog

A minimal, responsive blog website built with React to display and manage markdown files. Perfect for documenting your GSoC journey or any markdown-based content.

## ✨ Features

### 🎨 **Design & User Experience**
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Light/Dark Mode**: Automatic system preference detection with manual toggle
- **Modern UI**: Clean, minimal design using TailwindCSS
- **Smooth Transitions**: Beautiful hover effects and micro-interactions

### 📝 **Blog Features**
- **Markdown Rendering**: Full GitHub-flavored markdown support
- **Syntax Highlighting**: Code blocks with syntax highlighting
- **Search Functionality**: Search across all post titles and content
- **Category Filtering**: Filter posts by folder/category
- **Reading Time**: Automatic reading time estimation
- **Meta Information**: Author, date, tags, and categories
- **Share Functionality**: Native share API with clipboard fallback

### ⚙️ **Admin Panel**
- **File Upload**: Drag-and-drop markdown file upload
- **File Management**: Edit, delete, and create new markdown files
- **Live Preview**: See changes immediately after saving
- **Status Feedback**: Real-time upload and save status

### 🚀 **Performance**
- **Fast Loading**: Optimized bundle size and loading
- **SEO Friendly**: Proper meta tags and semantic HTML
- **Accessibility**: WCAG compliant with proper ARIA labels

## 🛠️ Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: TailwindCSS with custom dark mode
- **Markdown**: react-markdown with remark/rehype plugins
- **Syntax Highlighting**: react-syntax-highlighter
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blog-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add your markdown files**
   - Place your `.md` files in `public/md-files/`
   - Organize them in subfolders for categories
   - Add frontmatter for metadata (optional but recommended)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Your blog is now running! 🎉

## 📁 Project Structure

```
blog-website/
├── public/
│   └── md-files/              # Your markdown files go here
│       ├── README.md
│       ├── category1/
│       │   └── post1.md
│       └── category2/
│           └── post2.md
├── src/
│   ├── components/
│   │   ├── BlogList.jsx       # Post listing component
│   │   ├── BlogPost.jsx       # Individual post view
│   │   ├── Navigation.jsx     # Navigation and search
│   │   ├── AdminPanel.jsx     # File management interface
│   │   └── ThemeToggle.jsx    # Dark mode toggle
│   ├── hooks/
│   │   └── useMarkdownFiles.js # Custom hook for file loading
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # App entry point
│   └── index.css              # Global styles
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 📝 Markdown Frontmatter

Add frontmatter to your markdown files for better metadata:

```markdown
---
title: Your Post Title
date: 2026-03-07
author: Your Name
category: general
tags: tag1, tag2, tag3
excerpt: Brief description of your post
readingTime: 5
---

# Your post content here...
```

### Supported Frontmatter Fields
- `title`: Post title (auto-extracted from H1 if not provided)
- `date`: Publication date (auto-generated if not provided)
- `author`: Author name (defaults to "Anonymous")
- `category`: Post category (extracted from folder path)
- `tags`: Comma-separated list of tags
- `excerpt`: Post excerpt (auto-generated if not provided)
- `readingTime`: Reading time in minutes (auto-calculated)

## 🎨 Customization

### Colors & Theme
The theme uses CSS custom properties. Modify `src/index.css` to change colors:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... more colors */
}
```

### Typography
TailwindCSS typography plugin is configured for clean markdown rendering. Modify `tailwind.config.js` to customize typography styles.

### Layout
Adjust the container max-width in `src/App.jsx`:
```jsx
<main className="container mx-auto px-4 py-8 max-w-4xl">
```

## 🚀 Deployment

### Static Hosting (Recommended)
The app builds to static files and can be deployed anywhere:

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Deploy to your favorite platform**
   - **Netlify**: Drag and drop the `dist` folder
   - **Vercel**: Connect your repository
   - **GitHub Pages**: Use GitHub Actions
   - **Firebase Hosting**: `firebase deploy`

### Environment Variables
No environment variables required for basic functionality. For advanced features, you can add:
- `VITE_ADMIN_PASSWORD`: Simple password protection for admin panel
- `VITE_SITE_URL`: Your site URL for better SEO

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features
The codebase is organized for easy extension:
- Components are self-contained and reusable
- Custom hooks separate logic from UI
- Styles use utility-first TailwindCSS classes

### Admin Panel Features
The admin panel includes:
- File upload with drag-and-drop
- In-place markdown editing
- File deletion with confirmation
- Real-time status updates
- Create new files from templates

## 📱 Responsive Design

The blog is fully responsive with:
- **Mobile** (< 768px): Single column, collapsible navigation
- **Tablet** (768px - 1024px): Two-column post grid
- **Desktop** (> 1024px): Three-column post grid

## 🌙 Dark Mode

Dark mode features:
- **System Preference**: Automatically detects user's preferred theme
- **Manual Toggle**: Users can switch between themes
- **Persistent**: Theme preference saved to localStorage
- **Smooth Transitions**: Animated theme switching

## 🐛 Troubleshooting

### Common Issues

1. **Markdown files not loading**
   - Check file paths in `src/hooks/useMarkdownFiles.js`
   - Ensure files are in `public/md-files/` folder
   - Verify file names match exactly

2. **Build errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version: `node --version` (should be 18+)

3. **Styling issues**
   - Ensure TailwindCSS is properly configured
   - Check that `src/index.css` is imported in `main.jsx`

### Getting Help
- Check the browser console for errors
- Verify all dependencies are installed
- Ensure file paths are correct for your setup

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📞 Support

If you have any questions or need help setting up the blog, please create an issue in the repository.

---

**Happy Blogging! 📝✨**
