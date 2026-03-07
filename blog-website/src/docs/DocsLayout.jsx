import React from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { contentIndex } from '../content/contentIndex.generated';

function groupByCategory(items) {
  const map = new Map();
  for (const item of items) {
    const cat = item.category || 'General';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat).push(item);
  }
  return Array.from(map.entries()).sort((a, b) => {
    if (a[0] === 'General') return -1;
    if (b[0] === 'General') return 1;
    return a[0].localeCompare(b[0]);
  });
}

function useDarkMode() {
  const [dark, setDark] = React.useState(
    () => document.documentElement.classList.contains('dark')
  );
  const toggle = React.useCallback(() => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDark(true);
    }
  }, []);
  return [dark, toggle];
}

function SidebarNav({ grouped }) {
  return (
    <nav className="py-6 space-y-5">
      {grouped.map(([cat, items]) => (
        <div key={cat}>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {cat}
          </p>
          <div className="space-y-0.5">
            {items.map((item) => (
              <NavLink
                key={item.slug}
                to={`/docs/${item.slug}`}
                className={({ isActive }) =>
                  [
                    'block rounded-md px-3 py-1.5 text-sm transition-colors duration-100',
                    isActive
                      ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-200',
                  ].join(' ')
                }
              >
                {item.title}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function DocsLayout() {
  const grouped = React.useMemo(() => groupByCategory(contentIndex), []);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [dark, toggleDark] = useDarkMode();

  // Close mobile sidebar whenever the route changes
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">

      {/* ── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
        <div className="mx-auto flex h-14 max-w-screen-xl items-center gap-3 px-4 sm:px-6">

          {/* Mobile hamburger */}
          <button
            className="lg:hidden -ml-1 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link
            to="/docs/home"
            className="flex items-center gap-2 text-gray-900 dark:text-gray-100"
          >
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">GSoC</span>
            <span className="text-sm font-medium tracking-tight text-gray-600 dark:text-gray-400">Journey</span>
          </Link>

          <div className="flex-1" />

          {/* GitHub */}
          <a
            href="https://github.com/nishantharkut/GSOC-Journey"
            target="_blank"
            rel="noreferrer"
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="View on GitHub"
          >
            <svg viewBox="0 0 16 16" className="h-5 w-5 fill-current" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>

          {/* Theme toggle */}
          <button
            onClick={toggleDark}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile sidebar overlay ──────────────────────── */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-white shadow-2xl dark:bg-gray-900 lg:hidden">
            <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Navigation</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-3">
              <SidebarNav grouped={grouped} />
            </div>
          </div>
        </>
      )}

      {/* ── Page body ───────────────────────────────────── */}
      <div className="mx-auto flex max-w-screen-xl">

        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0 border-r border-gray-200 dark:border-gray-800">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto px-3 scrollbar-thin">
            <SidebarNav grouped={grouped} />
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-5 pb-20 pt-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="prose prose-slate max-w-3xl dark:prose-invert">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
