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

const queryClient = new QueryClient();

const App = () => {
  const [language, setLanguageState] = useState<LangCode>(getSelectedLanguage());

  useEffect(() => { initThemeCustomization(); }, []);

  const handleSetLanguage = (l: LangCode) => { setLanguageState(l); setSelectedLanguage(l); };

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
                        <ProtectedRoute requiredRole="editor">
                          <AdminPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/analytics" element={
                        <ProtectedRoute requiredRole="admin">
                          <AnalyticsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/doc-health" element={
                        <ProtectedRoute requiredRole="editor">
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
                        <ProtectedRoute requiredRole="editor">
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
