import { useState } from "react";
import { Star } from "lucide-react";
import { getRating, setRating } from "@/lib/ratings";

export function StarRating({ slug }: { slug: string }) {
  const [rating, setRatingState] = useState<number>(() => getRating(slug) || 0);
  const [hovered, setHovered] = useState(0);

  const handleRate = (value: number) => {
    setRating(slug, value);
    setRatingState(value);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-muted-foreground">Rate this page:</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                star <= (hovered || rating)
                  ? "fill-[hsl(38,92%,50%)] text-[hsl(38,92%,50%)]"
                  : "text-border"
              }`}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <span className="text-[11px] text-muted-foreground font-mono">{rating}/5</span>
      )}
    </div>
  );
}
