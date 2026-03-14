import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Pause, Play, SkipForward } from "lucide-react";

export function TextToSpeech({ content }: { content: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported] = useState(() => "speechSynthesis" in window);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Strip markdown syntax for clean reading
  const cleanText = content
    .replace(/```[\s\S]*?```/g, " code block ")
    .replace(/`[^`]+`/g, (m) => m.slice(1, -1))
    .replace(/[#*_~>\[\]()!|]/g, "")
    .replace(/---+/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  useEffect(() => {
    return () => {
      if (speaking) window.speechSynthesis.cancel();
    };
  }, [speaking]);

  const handleSpeak = () => {
    if (!supported) return;

    if (speaking && !paused) {
      window.speechSynthesis.pause();
      setPaused(true);
      return;
    }

    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      return;
    }

    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.rate = 1;
    utter.pitch = 1;
    utter.onend = () => { setSpeaking(false); setPaused(false); };
    utter.onerror = () => { setSpeaking(false); setPaused(false); };
    utterRef.current = utter;
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
    setPaused(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  if (!supported) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleSpeak}
        className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-md transition-colors ${
          speaking
            ? "text-primary bg-primary/[0.06]"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        title={speaking ? (paused ? "Resume" : "Pause") : "Read aloud"}
      >
        {speaking ? (
          paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />
        ) : (
          <Volume2 className="w-3 h-3" />
        )}
        {speaking ? (paused ? "Resume" : "Pause") : "Listen"}
      </button>
      {speaking && (
        <button
          onClick={handleStop}
          className="flex items-center gap-1 px-2 py-1 text-[11px] rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/[0.06] transition-colors"
          title="Stop"
        >
          <VolumeX className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
