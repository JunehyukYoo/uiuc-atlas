import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ViewMode = "guide" | "pins" | "heatmap";

type Props = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export function ViewToggle({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <ToggleGroup
        type="single"
        value={value}
        variant="outline"
        size="lg"
        spacing={2}
        onValueChange={(v) => {
          if (v) onChange(v as ViewMode);
        }}
      >
        <ToggleGroupItem value="guide" aria-label="Toggle guide">
          Guide
        </ToggleGroupItem>
        <ToggleGroupItem value="pins" aria-label="Toggle pins">
          Pins
        </ToggleGroupItem>
        <ToggleGroupItem value="heatmap" aria-label="Toggle heatmap">
          Heatmap
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
