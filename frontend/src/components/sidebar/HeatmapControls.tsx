import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EMOTION_META, EMOTIONS } from "../../../../shared/emotions";
import type { Emotion } from "../../../../shared/schemas/submission";

type Props = {
  activeEmotions: Set<Emotion>;
  onToggle: (emotion: Emotion) => void;
};

export function HeatmapControls({ activeEmotions, onToggle }: Props) {
  return (
    <Card className="flex-1 min-h-0">
      <CardHeader>
        <CardTitle>Emotions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <p className="w-full text-muted-foreground text-sm">
          Choose which emotion layers to display.
        </p>
        {(EMOTIONS as Emotion[]).map((emotion) => (
          <Button
            key={emotion}
            variant={activeEmotions.has(emotion) ? "default" : "outline"}
            style={{
              borderColor: EMOTION_META[emotion].color,
              ...(activeEmotions.has(emotion) && {
                backgroundColor: EMOTION_META[emotion].color,
              }),
            }}
            onClick={() => onToggle(emotion)}
          >
            {EMOTION_META[emotion].label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
