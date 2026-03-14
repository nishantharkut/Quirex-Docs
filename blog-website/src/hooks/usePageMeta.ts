import { useEffect } from "react";
import { siteConfig } from "@/lib/siteConfig";

interface PageMeta {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

/**
 * Sets <head> meta tags for OG/Twitter social sharing.
 * Cleans up on unmount.
 */
export function usePageMeta({ title, description, image, url, type = "article" }: PageMeta) {
  useEffect(() => {
    const fullTitle = `${title} — ${siteConfig.name}`;
    const ogImage = image || "/og-image.png";
    const pageUrl = url || window.location.href;

    document.title = fullTitle;

    const metas: Record<string, string> = {
      "og:title": fullTitle,
      "og:description": description,
      "og:image": ogImage.startsWith("http") ? ogImage : `${window.location.origin}${ogImage}`,
      "og:url": pageUrl,
      "og:type": type,
      "twitter:card": "summary_large_image",
      "twitter:title": fullTitle,
      "twitter:description": description,
      "twitter:image": ogImage.startsWith("http") ? ogImage : `${window.location.origin}${ogImage}`,
      "description": description,
    };

    const createdTags: HTMLMetaElement[] = [];

    Object.entries(metas).forEach(([key, value]) => {
      const isOg = key.startsWith("og:");
      const isTwitter = key.startsWith("twitter:");
      const attr = isOg ? "property" : "name";
      
      // Find existing tag
      let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      
      if (el) {
        el.setAttribute("content", value);
      } else {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        el.setAttribute("content", value);
        document.head.appendChild(el);
        createdTags.push(el);
      }
    });

    return () => {
      document.title = siteConfig.metaTitle;
      // Remove only tags we created (not pre-existing ones)
      createdTags.forEach((tag) => tag.remove());
    };
  }, [title, description, image, url, type]);
}
