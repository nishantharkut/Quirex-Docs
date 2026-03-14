import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="min-w-[44px] min-h-[44px] w-11 h-11 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg sm:rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon className="w-5 h-5 sm:w-4 sm:h-4" /> : <Sun className="w-5 h-5 sm:w-4 sm:h-4" />}
    </button>
  );
}
