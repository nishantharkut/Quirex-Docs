import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { I18nContext, getSelectedLanguage, setSelectedLanguage, LangCode } from "@/lib/i18n";
import { initThemeCustomization } from "@/lib/themeCustomizer";
import { DocsChatbot } from "@/components/DocsChatbot";
import { SkipToContent } from "@/components/SkipToContent";
import { PageTransition } from "@/components/PageTransition";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import PostPage from "./pages/PostPage";
import AdminPage from "./pages/AdminPage";
import ChangelogPage from "./pages/ChangelogPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ApiReferencePage from "./pages/ApiReferencePage";
import DocHealthPage from "./pages/DocHealthPage";
import SetupGuidePage from "./pages/SetupGuidePage";
import ThemeEditorPage from "./pages/ThemeEditorPage";
import NotionImportPage from "./pages/NotionImportPage";
import TagsPage from "./pages/TagsPage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import UserManagementPage from "./pages/UserManagementPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import { isSupabaseConfigured, supabaseConfigError } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

function DeploymentConfigScreen() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
          Deployment setup required
        </div>
        <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-[-0.03em]">
          Supabase configuration is missing
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
          This deployment was built without the required Supabase environment variables, so authentication and content APIs cannot start.
        </p>

        <div className="mt-6 rounded-xl border border-border bg-background p-4">
          <p className="text-sm font-medium">Add these variables in your hosting provider and redeploy:</p>
          <div className="mt-3 space-y-2 font-mono text-xs sm:text-sm text-muted-foreground">
            <div>VITE_SUPABASE_URL</div>
            <div>VITE_SUPABASE_PUBLISHABLE_KEY</div>
            <div>VITE_SUPABASE_PROJECT_ID (optional)</div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground leading-relaxed">
          <p>Recommended Netlify settings:</p>
          <p className="mt-2">Base directory: blog-website</p>
          <p>Build command: npm run build</p>
          <p>Publish directory: dist</p>
          <p className="mt-3 text-destructive">{supabaseConfigError}</p>
        </div>
      </div>
    </div>
  );
}

const App = () => {
  const [language, setLanguageState] = useState<LangCode>(getSelectedLanguage());

  useEffect(() => { initThemeCustomization(); }, []);

  const handleSetLanguage = (l: LangCode) => { setLanguageState(l); setSelectedLanguage(l); };

  if (!isSupabaseConfigured) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <DeploymentConfigScreen />
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
              <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <SkipToContent />
                  <PageTransition>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/blog" element={<BlogPage />} />
                      <Route path="/blog/:slug" element={<BlogPostPage />} />
                      <Route path="/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/docs/:slug" element={<PostPage />} />
                      <Route path="/changelog" element={<ChangelogPage />} />
                      <Route path="/api-reference" element={<ApiReferencePage />} />
                      <Route path="/tags" element={<TagsPage />} />
                      <Route path="/admin" element={
                        <ProtectedRoute>
                          <AdminPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/analytics" element={
                        <ProtectedRoute requiredRole="admin">
                          <AnalyticsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/doc-health" element={
                        <ProtectedRoute>
                          <DocHealthPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/users" element={
                        <ProtectedRoute requiredRole="admin">
                          <UserManagementPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/setup" element={
                        <ProtectedRoute requiredRole="admin">
                          <SetupGuidePage />
                        </ProtectedRoute>
                      } />
                      <Route path="/theme" element={
                        <ProtectedRoute requiredRole="admin">
                          <ThemeEditorPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/import/notion" element={
                        <ProtectedRoute>
                          <NotionImportPage />
                        </ProtectedRoute>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </PageTransition>
                  <DocsChatbot />
                </TooltipProvider>
              </I18nContext.Provider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
