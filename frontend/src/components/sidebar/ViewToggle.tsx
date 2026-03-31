import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ViewMode = "pins" | "heatmap";

type Props = {
  onChange: (mode: ViewMode) => void;
};

export function ViewToggle({ onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <ToggleGroup
        type="single"
        defaultValue="pins"
        variant="outline"
        size="lg"
        spacing={2}
        onValueChange={(value) => onChange(value as ViewMode)}
      >
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
