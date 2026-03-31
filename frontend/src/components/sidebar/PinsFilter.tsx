import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { EMOTION_META, EMOTIONS } from "../../../../shared/emotions";
import type { Emotion, Tag } from "../../../../shared/schemas/submission";

export type PinsFilterState = {
  emotions: Set<Emotion>;
  intensityMin: number;
  intensityMax: number;
  tagSlugs: Set<string>;
};

export const defaultPinsFilter: PinsFilterState = {
  emotions: new Set(EMOTIONS as Emotion[]),
  intensityMin: 1,
  intensityMax: 5,
  tagSlugs: new Set(),
};

type Props = {
  filter: PinsFilterState;
  tagOptions: Tag[];
  onChange: (filter: PinsFilterState) => void;
};

export function PinsFilter({ filter, tagOptions, onChange }: Props) {
  function toggleEmotion(emotion: Emotion) {
    const next = new Set(filter.emotions);
    if (next.has(emotion)) next.delete(emotion);
    else next.add(emotion);
    onChange({ ...filter, emotions: next });
  }

  function toggleTag(slug: string) {
    const next = new Set(filter.tagSlugs);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    onChange({ ...filter, tagSlugs: next });
  }

  const isFiltered =
    filter.emotions.size < EMOTIONS.length ||
    filter.intensityMin > 1 ||
    filter.intensityMax < 5 ||
    filter.tagSlugs.size > 0;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-4 space-y-4">
      {isFiltered && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-muted-foreground -ml-2"
          onClick={() => onChange(defaultPinsFilter)}
        >
          Reset filters
        </Button>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">Emotion</p>
        <div className="flex flex-wrap gap-1.5">
          {(EMOTIONS as Emotion[]).map((emotion) => (
            <Button
              key={emotion}
              size="sm"
              variant={filter.emotions.has(emotion) ? "default" : "outline"}
              className="h-7 text-xs"
              style={{
                borderColor: EMOTION_META[emotion].color,
                ...(filter.emotions.has(emotion) && {
                  backgroundColor: EMOTION_META[emotion].color,
                  color: "white",
                }),
              }}
              onClick={() => toggleEmotion(emotion)}
            >
              {EMOTION_META[emotion].label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium flex justify-between">
          <span>Intensity</span>
          <span className="text-muted-foreground font-normal">
            {filter.intensityMin === filter.intensityMax
              ? filter.intensityMin
              : `${filter.intensityMin} – ${filter.intensityMax}`}
          </span>
        </p>
        <Slider
          value={[filter.intensityMin, filter.intensityMax]}
          min={1}
          max={5}
          step={1}
          onValueChange={([min, max]) =>
            onChange({ ...filter, intensityMin: min, intensityMax: max })
          }
        />
      </div>

      {tagOptions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Tags{" "}
            <span className="text-muted-foreground font-normal text-xs">
              (any match)
            </span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tagOptions.map((tag) => (
              <Badge
                key={tag.slug}
                variant={
                  filter.tagSlugs.has(tag.slug) ? "default" : "outline"
                }
                className="cursor-pointer select-none"
                onClick={() => toggleTag(tag.slug)}
              >
                {tag.label}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
