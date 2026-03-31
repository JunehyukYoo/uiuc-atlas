import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { EMOTION_META, EMOTIONS } from "../../../../shared/emotions";
import type { Emotion } from "../../../../shared/schemas/submission";

export type HeatmapConfig = {
  sizeMeters: number;
  opacity: number;
  // Controls falloff: lower = sharper edge, higher = more gradual fade
  alphaRange: number;
};

export const defaultHeatmapConfig: HeatmapConfig = {
  sizeMeters: 120,
  opacity: 0.8,
  alphaRange: 0.8,
};

type Props = {
  activeEmotions: Set<Emotion>;
  config: HeatmapConfig;
  onToggle: (emotion: Emotion) => void;
  onConfigChange: (config: HeatmapConfig) => void;
  onReset: () => void;
};

export function HeatmapControls({
  activeEmotions,
  config,
  onToggle,
  onConfigChange,
  onReset,
}: Props) {
  const isModified =
    activeEmotions.size < EMOTIONS.length ||
    config.sizeMeters !== defaultHeatmapConfig.sizeMeters ||
    config.opacity !== defaultHeatmapConfig.opacity ||
    config.alphaRange !== defaultHeatmapConfig.alphaRange;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-4 space-y-5">
      {isModified && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-muted-foreground -ml-2"
          onClick={onReset}
        >
          Reset all
        </Button>
      )}

      {/* Emotion toggles */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Layers</p>
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

      <Separator />

      {/* Size */}
      <div className="space-y-2">
        <p className="text-sm font-medium flex justify-between">
          <span>Radius</span>
          <span className="text-muted-foreground font-normal">
            {config.sizeMeters}px
          </span>
        </p>
        <Slider
          value={[config.sizeMeters]}
          min={20}
          max={230}
          step={10}
          onValueChange={([val]) =>
            onConfigChange({ ...config, sizeMeters: val })
          }
        />
      </div>

      {/* Opacity */}
      <div className="space-y-2">
        <p className="text-sm font-medium flex justify-between">
          <span>Opacity</span>
          <span className="text-muted-foreground font-normal">
            {Math.round(config.opacity * 100)}%
          </span>
        </p>
        <Slider
          value={[Math.round(config.opacity * 100)]}
          min={10}
          max={100}
          step={5}
          onValueChange={([val]) =>
            onConfigChange({ ...config, opacity: val / 100 })
          }
        />
      </div>

      {/* Alpha range (falloff) */}
      <div className="space-y-2">
        <p className="text-sm font-medium flex justify-between">
          <span>Falloff</span>
          <span className="text-muted-foreground font-normal">
            {Math.round(config.alphaRange * 100)}%
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Lower values produce sharper edges.
        </p>
        <Slider
          value={[Math.round(config.alphaRange * 100)]}
          min={10}
          max={100}
          step={5}
          onValueChange={([val]) =>
            onConfigChange({ ...config, alphaRange: val / 100 })
          }
        />
      </div>
    </div>
  );
}
