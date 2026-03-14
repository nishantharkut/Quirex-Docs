import { SUPPORTED_LANGUAGES, useI18n, LangCode } from "@/lib/i18n";
import { Globe, ChevronDown } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === language);

  return (
    <div className="relative inline-flex">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as LangCode)}
        className="appearance-none bg-muted text-foreground text-[11px] font-medium pl-6 pr-6 py-0.5 rounded border border-border cursor-pointer hover:bg-accent transition-colors outline-none focus:ring-1 focus:ring-ring"
      >
        {SUPPORTED_LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.name}
          </option>
        ))}
      </select>
      <Globe className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
    </div>
  );
}
