import { cn } from "@/lib/utils";

// Quirex-branded logo pulse loader
export function QuirexLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative">
        <div className="w-10 h-10 rounded-lg bg-primary/20 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary animate-[bounce_1s_ease-in-out_infinite]">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Typing dots loader
export function DotsLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          style={{
            animation: "bounce 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </div>
  );
}

// Document page flip loader
export function PageFlipLoader({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-12 h-14", className)}>
      <div className="absolute inset-0 border-2 border-border rounded-sm bg-card" />
      <div
        className="absolute top-0 left-0 w-full h-full border-2 border-border rounded-sm bg-card origin-left"
        style={{ animation: "flip 1.2s ease-in-out infinite" }}
      />
      <div className="absolute top-3 left-2 right-2 space-y-1.5">
        <div className="h-1 bg-muted rounded-full w-3/4" />
        <div className="h-1 bg-muted rounded-full w-full" />
        <div className="h-1 bg-muted rounded-full w-2/3" />
      </div>
      <style>{`
        @keyframes flip {
          0%, 100% { transform: rotateY(0deg); }
          50% { transform: rotateY(-180deg); }
        }
      `}</style>
    </div>
  );
}

// Circular progress spinner
export function SpinnerLoader({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };
  
  return (
    <div
      className={cn(
        "rounded-full border-primary/30 border-t-primary animate-spin",
        sizeClasses[size],
        className
      )}
    />
  );
}

// Skeleton with shimmer effect
export function ShimmerLoader({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md bg-muted", className)}>
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-background/60 to-transparent"
        style={{ animation: "shimmer 1.5s infinite" }}
      />
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// Bar progress loader
export function BarLoader({ className }: { className?: string }) {
  return (
    <div className={cn("h-1 w-24 rounded-full bg-muted overflow-hidden", className)}>
      <div
        className="h-full w-1/3 rounded-full bg-primary"
        style={{ animation: "slide 1s ease-in-out infinite" }}
      />
      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}

// Full page loader with message
export function FullPageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 animate-pulse" />
        <SpinnerLoader size="lg" className="absolute inset-0 m-auto" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}

// Content skeleton with shimmer
export function ContentSkeletonShimmer() {
  return (
    <div className="space-y-4 py-6">
      <ShimmerLoader className="h-3 w-32" />
      <ShimmerLoader className="h-8 w-3/4" />
      <ShimmerLoader className="h-3 w-48" />
      <div className="space-y-2 mt-6">
        <ShimmerLoader className="h-4 w-full" />
        <ShimmerLoader className="h-4 w-5/6" />
        <ShimmerLoader className="h-4 w-4/5" />
      </div>
      <ShimmerLoader className="h-32 w-full mt-4" />
      <div className="space-y-2 mt-4">
        <ShimmerLoader className="h-4 w-full" />
        <ShimmerLoader className="h-4 w-3/4" />
        <ShimmerLoader className="h-4 w-5/6" />
      </div>
    </div>
  );
}
