import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import type { Emotion, Tag } from "../../../../shared/schemas/submission";

type DraftMarker = { lat: number; lng: number } | null;

type FormState = {
  emotion: Emotion;
  intensity: number;
  reflection: string;
  tagSlugs: string[];
};

type Props = {
  draftMarker: DraftMarker;
  formState: FormState;
  emotionOptions: Emotion[];
  tagOptions: Tag[];
  submitError: string | null;
  submitSuccess: string | null;
  isSubmitting: boolean;
  onFormChange: (updates: Partial<FormState>) => void;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  onClearDraft: () => void;
};

export function SubmissionForm({
  draftMarker,
  formState,
  emotionOptions,
  tagOptions,
  submitError,
  submitSuccess,
  isSubmitting,
  onFormChange,
  onSubmit,
  onClearDraft,
}: Props) {
  const comboboxAnchor = useComboboxAnchor();

  return (
    <div className="flex-1 min-h-0 overflow-hidden px-6 pb-4">
      <div
        className="overflow-y-auto h-full"
        style={{ paddingRight: "18px", marginRight: "-18px" }}
      >
          {submitError && (
            <p className="text-sm text-red-600 mb-3">{submitError}</p>
          )}
          {submitSuccess && (
            <p className="text-sm text-green-600 mb-3">{submitSuccess}</p>
          )}

          {!draftMarker ? (
            <p className="text-sm text-muted-foreground">
              Click anywhere on the map to place a draft marker. Click on an
              existing marker to view its submission details. A circular marker
              with a number indicates a cluster of submissions. Click on the
              marker to zoom in and reveal individual submissions.
            </p>
          ) : (
            <form className="flex flex-col gap-6 m-1" onSubmit={onSubmit}>
              <div className="text-sm">
                <p>
                  <span className="font-medium">Latitude:</span>{" "}
                  {draftMarker.lat.toFixed(6)}
                </p>
                <p>
                  <span className="font-medium">Longitude:</span>{" "}
                  {draftMarker.lng.toFixed(6)}
                </p>
              </div>

              <label className="block space-y-1 text-sm">
                <span className="font-medium">Emotion</span>
                <Combobox
                  items={emotionOptions}
                  defaultValue={emotionOptions[0]}
                  onValueChange={(value) =>
                    onFormChange({ emotion: value as Emotion })
                  }
                >
                  <ComboboxInput placeholder="Select an emotion" required />
                  <ComboboxContent>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </label>

              <label className="block space-y-1 text-sm">
                <span className="font-medium flex justify-between items-center">
                  Intensity
                  <span className="text-muted-foreground">
                    On a scale of 1 - 5
                  </span>
                </span>
                <Slider
                  defaultValue={[3]}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                  onValueChange={(value) =>
                    onFormChange({ intensity: value[0] })
                  }
                />
              </label>

              <label className="block space-y-1 text-sm grow">
                <span className="font-medium">Reflection</span>
                <Textarea
                  maxLength={280}
                  placeholder="What are you feeling here? (optional)"
                  value={formState.reflection}
                  onChange={(e) => onFormChange({ reflection: e.target.value })}
                  className="mt-1 min-h-20 resize-y"
                />
              </label>

              <label className="block space-y-1 text-sm">
                <span className="font-medium">Tags</span>
                <Combobox
                  multiple
                  autoHighlight
                  items={tagOptions.map((t) => t.label)}
                  onValueChange={(values) => {
                    const slugs = (values as string[])
                      .map(
                        (label) =>
                          tagOptions.find((t) => t.label === label)?.slug ?? "",
                      )
                      .filter(Boolean);
                    onFormChange({ tagSlugs: slugs });
                  }}
                >
                  <ComboboxChips ref={comboboxAnchor} className="w-full mt-1">
                    <ComboboxValue>
                      {(values) => (
                        <React.Fragment>
                          {values.map((value: string) => (
                            <ComboboxChip key={value}>{value}</ComboboxChip>
                          ))}
                          <ComboboxChipsInput />
                        </React.Fragment>
                      )}
                    </ComboboxValue>
                  </ComboboxChips>
                  <ComboboxContent anchor={comboboxAnchor}>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </label>

              <p className="text-xs text-muted-foreground">
                Reflection is optional, but listing the exact location is
                recommended.
              </p>

              <div className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={onClearDraft}
                >
                  Clear Draft Marker
                </Button>
              </div>
            </form>
          )}
      </div>
    </div>
  );
}
