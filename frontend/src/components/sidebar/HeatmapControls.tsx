import { Button } from "@/components/ui/button";
import { EMOTION_META, EMOTIONS } from "../../../../shared/emotions";
import type { Emotion } from "../../../../shared/schemas/submission";

type Props = {
  activeEmotions: Set<Emotion>;
  onToggle: (emotion: Emotion) => void;
};

export function HeatmapControls({ activeEmotions, onToggle }: Props) {
  return (
    <div className="flex-1 min-h-0 overflow-hidden px-6 pb-4 flex-col gap-2">
      <p className="w-full text-muted-foreground text-sm pb-2">
        Choose which emotion layers to display.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {(EMOTIONS as Emotion[]).map((emotion) => (
          <Button
            key={emotion}
            size="sm"
            variant={activeEmotions.has(emotion) ? "default" : "outline"}
            className="h-7 text-xs"
            style={{
              borderColor: EMOTION_META[emotion].color,
              ...(activeEmotions.has(emotion) && {
                backgroundColor: EMOTION_META[emotion].color,
                color: "white",
              }),
            }}
            onClick={() => onToggle(emotion)}
          >
            {EMOTION_META[emotion].label}
          </Button>
        ))}
      </div>
    </div>
  );
}
