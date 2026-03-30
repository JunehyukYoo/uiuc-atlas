import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ViewMode = "pins" | "heatmap";

type Props = {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export function ViewToggle({ viewMode, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>View</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button
          variant={viewMode === "pins" ? "default" : "outline"}
          onClick={() => onChange("pins")}
        >
          Pins
        </Button>
        <Button
          variant={viewMode === "heatmap" ? "default" : "outline"}
          onClick={() => onChange("heatmap")}
        >
          Heatmap
        </Button>
      </CardContent>
    </Card>
  );
}
