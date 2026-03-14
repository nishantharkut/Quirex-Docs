import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { unlockGate } from "@/lib/authGate";

interface AuthGateProps {
  onUnlock: () => void;
}

export function AuthGate({ onUnlock }: AuthGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockGate(password)) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-center py-20 px-4">
      <div className="max-w-sm w-full text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
        <h2 className="text-[1.125rem] font-semibold text-foreground mb-1">Protected Content</h2>
        <p className="text-[13px] text-muted-foreground mb-6">
          This document requires a password to view.
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className={`w-full px-3 py-2 text-[13px] rounded-md border bg-background text-foreground outline-none focus:ring-1 focus:ring-ring pr-8 ${
                error ? "border-destructive" : "border-border"
              }`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-[13px] rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium shrink-0"
          >
            Unlock
          </button>
        </form>
        {error && (
          <p className="text-[12px] text-destructive mt-2">Incorrect password. Please try again.</p>
        )}
      </div>
    </div>
  );
}
