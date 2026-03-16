import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { SearchDialog } from "./SearchDialog";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { ReadingHistoryPanel } from "./ReadingHistoryPanel";
import { Menu, X, Github, BookOpen, LogIn, LogOut, User, Shield, Users, PenLine, LayoutDashboard } from "lucide-react";
import { useI18n, t } from "@/lib/i18n";
import { useState } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, isEditor, signOut, loading } = useAuth();
  const { language } = useI18n();

  const handleSignOut = async () => {
    await signOut();
    setUserMenu(false);
    navigate("/");
  };

  // Filter nav links based on role — hide role-gated links while loading or when unauthenticated
  const roleGatedPaths = ["/admin", "/import/notion", "/analytics", "/users", "/setup", "/theme", "/doc-health"];
  const visibleNavLinks = siteConfig.navLinks.filter((link) => {
    if (!roleGatedPaths.some((p) => link.href === p)) return true;
    if (loading || !user) return false;
    if (link.href === "/admin" || link.href === "/import/notion" || link.href === "/doc-health") return true;
    return isAdmin;
  });

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-[90rem] mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="/favicon.svg" alt="Quirex" className="w-8 h-8 sm:w-6 sm:h-6" />
              <span className="hidden sm:inline text-[15px] font-semibold tracking-[-0.01em] text-foreground">
                {siteConfig.name}
              </span>
              {siteConfig.badge && (
                <span className="hidden sm:inline text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {siteConfig.badge}
                </span>
              )}
            </Link>

            <nav className="hidden md:flex items-center gap-0.5 text-[13px]">
              {visibleNavLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-2.5 py-1.5 rounded-md transition-colors ${
                    link.match(location.pathname)
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden sm:flex items-center gap-1.5">
              <LanguageSwitcher />
            </div>
            <SearchDialog />
            <button
              onClick={() => setHistoryOpen(true)}
              className="hidden sm:flex min-w-[44px] min-h-[44px] w-11 h-11 sm:w-9 sm:h-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title={t("bookmarksHistory", language)}
            >
              <BookOpen className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
            {siteConfig.externalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex min-w-[44px] min-h-[44px] w-11 h-11 sm:w-9 sm:h-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                title={link.label}
              >
                {link.icon === "github" && <Github className="w-5 h-5 sm:w-4 sm:h-4" />}
              </a>
            ))}
            <ThemeToggle />

            {/* Write button (logged in) */}
            {!loading && user && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <PenLine className="w-3.5 h-3.5" /> Write
              </Link>
            )}

            {/* User button */}
            {!loading && (
              user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenu(!userMenu)}
                    className="min-w-[44px] min-h-[44px] w-11 h-11 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-[13px] sm:text-[11px] font-semibold text-primary hover:ring-2 hover:ring-primary/30 transition-all"
                    title={profile?.display_name || user.email || "Account"}
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (profile?.display_name?.[0] || user.email?.[0] || "U").toUpperCase()
                    )}
                  </button>
                  {userMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-1 z-50 w-56 rounded-lg border border-border bg-popover shadow-lg py-1">
                        <div className="px-4 py-3 border-b border-border">
                          <div className="text-[14px] font-medium text-foreground truncate">{profile?.display_name || "User"}</div>
                          <div className="text-[12px] text-muted-foreground truncate">{user.email}</div>
                        </div>
                        <button
                          onClick={() => { navigate("/dashboard"); setUserMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[14px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </button>
                        <button
                          onClick={() => { navigate("/admin"); setUserMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[14px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <PenLine className="w-4 h-4" /> Write a post
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => { navigate("/users"); setUserMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-[14px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <Users className="w-4 h-4" /> {t("manageUsers", language)}
                          </button>
                        )}
                        <div className="border-t border-border" />
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-3 text-[14px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> {t("signOut", language)}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2.5 sm:px-3 sm:py-1.5 text-[14px] sm:text-[12px] font-medium rounded-lg sm:rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity min-h-[44px] sm:min-h-0"
                >
                  <LogIn className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> {t("signIn", language)}
                </Link>
              )
            )}

            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden border-t border-border bg-background px-3 py-2">
            {visibleNavLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenu(false)}
                className="flex items-center min-h-[48px] px-3 py-3 text-[15px] text-foreground rounded-lg hover:bg-muted active:bg-muted/80 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 px-3 py-3 min-h-[48px]">
              <LanguageSwitcher />
            </div>
            <button
              onClick={() => { setHistoryOpen(true); setMobileMenu(false); }}
              className="flex items-center w-full text-left min-h-[48px] px-3 py-3 text-[15px] text-muted-foreground rounded-lg hover:bg-muted active:bg-muted/80 transition-colors"
            >
              📚 {t("bookmarksHistory", language)}
            </button>
            {siteConfig.externalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center min-h-[48px] px-3 py-3 text-[15px] text-muted-foreground rounded-lg hover:bg-muted active:bg-muted/80 transition-colors"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        )}
      </header>
      <ReadingHistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
