import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useI18n, t } from "@/lib/i18n";

const FEEDBACK_KEY = "quirex_feedback";

interface FeedbackData {
  [slug: string]: { helpful: boolean; timestamp: string };
}

function getFeedback(): FeedbackData {
  try {
    return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveFeedback(slug: string, helpful: boolean) {
  const data = getFeedback();
  data[slug] = { helpful, timestamp: new Date().toISOString() };
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(data));
}

export function FeedbackWidget({ slug }: { slug: string }) {
  const existing = getFeedback()[slug];
  const [submitted, setSubmitted] = useState<boolean | null>(existing?.helpful ?? null);
  const { language } = useI18n();

  const handleFeedback = (helpful: boolean) => {
    saveFeedback(slug, helpful);
    setSubmitted(helpful);
  };

  return (
    <div className="mt-10 pt-6 border-t border-border">
      <div className="flex items-center gap-4">
        <span className="text-[13px] text-muted-foreground">{t("wasHelpful", language)}</span>
        {submitted !== null ? (
          <span className="text-[13px] text-primary font-medium">{t("thanksFeedback", language)}</span>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleFeedback(true)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/[0.06] transition-colors"
              title="Yes, helpful"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/[0.06] transition-colors"
              title="Not helpful"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
