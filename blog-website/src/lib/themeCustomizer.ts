const THEME_CUSTOM_KEY = "quirex_theme_custom";
const CUSTOM_CSS_KEY = "quirex_custom_css";

export interface ThemeCustomization {
  primaryHue: number;
  primarySat: number;
  primaryLight: number;
  fontBody: string;
  fontMono: string;
  logoText: string;
  logoEmoji: string;
  borderRadius: number;
}

const defaults: ThemeCustomization = {
  primaryHue: 215,
  primarySat: 80,
  primaryLight: 48,
  fontBody: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontMono: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
  logoText: "quirex",
  logoEmoji: "",
  borderRadius: 0.375,
};

export function getThemeCustomization(): ThemeCustomization {
  try {
    const stored = localStorage.getItem(THEME_CUSTOM_KEY);
    return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
  } catch {
    return defaults;
  }
}

export function saveThemeCustomization(theme: ThemeCustomization) {
  localStorage.setItem(THEME_CUSTOM_KEY, JSON.stringify(theme));
  applyThemeCustomization(theme);
}

export function getCustomCSS(): string {
  return localStorage.getItem(CUSTOM_CSS_KEY) || "";
}

export function saveCustomCSS(css: string) {
  localStorage.setItem(CUSTOM_CSS_KEY, css);
  applyCustomCSS(css);
}

export function resetTheme() {
  localStorage.removeItem(THEME_CUSTOM_KEY);
  localStorage.removeItem(CUSTOM_CSS_KEY);
  applyThemeCustomization(defaults);
  applyCustomCSS("");
}

/**
 * Apply theme customization to CSS variables
 */
export function applyThemeCustomization(theme: ThemeCustomization) {
  const root = document.documentElement;
  
  // Primary color
  root.style.setProperty("--primary", `${theme.primaryHue} ${theme.primarySat}% ${theme.primaryLight}%`);
  root.style.setProperty("--ring", `${theme.primaryHue} ${theme.primarySat}% ${theme.primaryLight}%`);
  
  // Border radius
  root.style.setProperty("--radius", `${theme.borderRadius}rem`);
  
  // Fonts
  root.style.setProperty("--font-body", theme.fontBody);
  root.style.setProperty("--font-mono", theme.fontMono);
  document.body.style.fontFamily = theme.fontBody;
  
  // Update code font
  const codeEls = document.querySelectorAll("code, pre, kbd");
  codeEls.forEach((el) => {
    (el as HTMLElement).style.fontFamily = theme.fontMono;
  });
}

/**
 * Apply custom CSS by injecting/updating a style element
 */
export function applyCustomCSS(css: string) {
  let styleEl = document.getElementById("quirex-custom-css");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "quirex-custom-css";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
}

/**
 * Initialize theme on app load
 */
export function initThemeCustomization() {
  const theme = getThemeCustomization();
  const css = getCustomCSS();
  // Only apply if non-default
  const isCustom = localStorage.getItem(THEME_CUSTOM_KEY);
  if (isCustom) applyThemeCustomization(theme);
  if (css) applyCustomCSS(css);
}

export const FONT_OPTIONS = [
  { label: "Inter (Default)", value: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { label: "System UI", value: "system-ui, -apple-system, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Merriweather", value: "'Merriweather', Georgia, serif" },
  { label: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
  { label: "DM Sans", value: "'DM Sans', sans-serif" },
];

export const MONO_FONT_OPTIONS = [
  { label: "JetBrains Mono (Default)", value: "'JetBrains Mono', ui-monospace, monospace" },
  { label: "Fira Code", value: "'Fira Code', ui-monospace, monospace" },
  { label: "Source Code Pro", value: "'Source Code Pro', ui-monospace, monospace" },
  { label: "System Mono", value: "ui-monospace, SFMono-Regular, monospace" },
];
