import { useState, useEffect } from "react";
import type { LatLngTuple } from "leaflet";
import {
  type Emotion,
  type SubmissionResponse,
  type Tag,
  emotionSchema,
  submissionResponseSchema,
  submissionsResponseSchema,
} from "../../../shared/schemas/submission";
import { EMOTION_META, EMOTIONS } from "../../../shared/emotions";
import api from "../api";
import { AxiosError } from "axios";
import React from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CampusMap from "@/components/map/CampusMap";
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
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

type ViewMode = "pins" | "heatmap";

type DraftMarker = {
  lat: number;
  lng: number;
} | null;

type SubmissionFormState = {
  emotion: Emotion;
  intensity: number;
  reflection: string;
  tagSlugs: string[];
};

const defaultFormState: SubmissionFormState = {
  emotion: emotionSchema.options[0],
  intensity: 3,
  reflection: "",
  tagSlugs: [],
};

function HomePage() {
  // MAP AND VIEWING STATES
  const [viewMode, setViewMode] = useState<ViewMode>("pins");
  const [activeHeatmapEmotions, setActiveHeatmapEmotions] = useState<
    Set<Emotion>
  >(new Set(EMOTIONS as Emotion[])); // Which emotions to show on heatmap
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionResponse | null>(null);

  // FORM STATES
  const [draftMarker, setDraftMarker] = useState<DraftMarker>(null);
  const [formState, setFormState] =
    useState<SubmissionFormState>(defaultFormState);
  const [emotionsOptions, setEmotionsOptions] = useState<Emotion[]>([]); // FORM: for the emotion dropdown
  const [tagOptions, setTagOptions] = useState<Tag[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // LOADING STATES
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]); // the pins
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const center: LatLngTuple = [40.1075, -88.2272]; // Main Quad

  const comboboxAnchor = useComboboxAnchor();

  useEffect(() => {
    async function loadSubmissions() {
      try {
        setIsLoading(true);
        const res = await api.get("/api/submissions");
        if (res.data.length === 0) {
          setSubmissions([]);
          setError(null);
          return;
        }
        console.log(res.data);
        const parsed = submissionsResponseSchema.safeParse(res.data);

        if (!parsed.success) {
          console.error(parsed.error);
          throw new Error("Invalid API response: zod parse failed.");
        }
        setSubmissions(parsed.data);
        setError(null);
      } catch (e: unknown) {
        console.error(e);
        if (e instanceof AxiosError) {
          const status = e.response?.status;
          if (status === 500) {
            setError("No valid sumbmissions.");
            return;
          }
          setError(e.message);
          return;
        }
        setError("Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    }

    async function loadEmotions() {
      try {
        const res = await api.get("/api/emotions");
        setEmotionsOptions(res.data);
      } catch (e) {
        console.error("Failed to load emotions:", e);
      }
    }

    async function loadTags() {
      try {
        const res = await api.get("/api/tags");
        setTagOptions(res.data);
      } catch (e) {
        console.error("Failed to load tags:", e);
      }
    }

    loadSubmissions();
    loadEmotions();
    loadTags();
  }, []);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draftMarker) {
      setSubmitError("Pick a location on the map before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      const res = await api.post("/api/submissions", {
        latitude: draftMarker.lat,
        longitude: draftMarker.lng,
        emotion: formState.emotion,
        intensity: formState.intensity,
        reflection: formState.reflection.trim() || null,
        tagSlugs: formState.tagSlugs,
      });

      console.log(res);

      const parsed = submissionResponseSchema.safeParse(res.data);
      if (!parsed.success) {
        throw new Error("Invalid API response: zod parse failed.");
      }

      setSubmissions((current) => [parsed.data, ...current]);
      setDraftMarker(null);
      setFormState(defaultFormState);
      setSubmitSuccess("Submission added.");
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof AxiosError) {
        setSubmitError(
          e.response?.data?.error ??
            e.message ??
            "Failed to create submission.",
        );
        return;
      }
      setSubmitError("Failed to create submission.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="h-full flex flex-col sm:flex-row">
      <div className="h-[calc(100vh-4rem)] min-w-3/5 p-8">
        <div className="h-full w-full rounded-2xl overflow-hidden">
          {isLoading ? (
            "Loading"
          ) : (
            <CampusMap
              center={center}
              draftMarker={draftMarker}
              submissions={submissions}
              viewMode={viewMode}
              activeEmotions={activeHeatmapEmotions}
              onMapClick={(latlng) => {
                setDraftMarker({ lat: latlng[0], lng: latlng[1] });
                setSelectedSubmission(null);
              }}
              onSubmissionClick={(submission) => {
                setSelectedSubmission(submission);
                setDraftMarker(null);
              }}
            />
          )}
        </div>
      </div>
      <div>{error ? error : ""}</div>

      <aside className="w-full p-8 h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex flex-col gap-4 h-full overflow-hidden">
          <Card>
            <CardHeader>
              <CardTitle>View</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button
                variant={viewMode === "pins" ? "default" : "outline"}
                onClick={() => setViewMode("pins")}
              >
                Pins
              </Button>
              <Button
                variant={viewMode === "heatmap" ? "default" : "outline"}
                onClick={() => setViewMode("heatmap")}
              >
                Heatmap
              </Button>
            </CardContent>
          </Card>

          {viewMode === "heatmap" ? (
            <Card className="flex-1 min-h-0">
              <CardHeader>
                <CardTitle>Emotions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <p className="text-muted-foreground">
                  Choose which emotion layers to display.
                </p>
                {(EMOTIONS as Emotion[]).map((emotion) => (
                  <Button
                    key={emotion}
                    variant={
                      activeHeatmapEmotions.has(emotion) ? "default" : "outline"
                    }
                    style={{
                      borderColor: EMOTION_META[emotion].color,
                      ...(activeHeatmapEmotions.has(emotion) && {
                        backgroundColor: EMOTION_META[emotion].color,
                      }),
                    }}
                    onClick={() => {
                      setActiveHeatmapEmotions((prev) => {
                        const next = new Set(prev);
                        if (next.has(emotion)) {
                          next.delete(emotion);
                        } else {
                          next.add(emotion);
                        }
                        return next;
                      });
                    }}
                  >
                    {EMOTION_META[emotion].label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="flex-1 min-h-0">
              {selectedSubmission ? (
                <>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Submission</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSubmission(null)}
                      >
                        ← Back
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full inline-block"
                        style={{
                          backgroundColor:
                            EMOTION_META[selectedSubmission.emotion].color,
                        }}
                      />
                      <span className="font-medium">
                        {EMOTION_META[selectedSubmission.emotion].label}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Intensity</span>
                      <span>{selectedSubmission.intensity} / 5</span>
                    </div>

                    {selectedSubmission.reflection && (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Reflection</p>
                          <p>{selectedSubmission.reflection}</p>
                        </div>
                      </>
                    )}

                    {selectedSubmission.tags.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <p className="text-muted-foreground">Tags</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedSubmission.tags.map((tag) => (
                              <Badge key={tag.id} variant="outline">
                                {tag.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    <p className="text-xs text-muted-foreground">
                      {selectedSubmission.latitude.toFixed(6)},{" "}
                      {selectedSubmission.longitude.toFixed(6)}
                    </p>
                  </CardContent>
                </>
              ) : (
                <>
                  <CardHeader>
                    <CardTitle>Add Submission</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-col gap-3 overflow-y-auto">
                    <div
                      className="overflow-y-auto h-full"
                      style={{ paddingRight: "18px", marginRight: "-18px" }} // shift scrollwheel
                    >
                      {submitError ? (
                        <p className="text-sm text-red-600">{submitError}</p>
                      ) : null}
                      {submitSuccess ? (
                        <p className="text-sm text-green-600">
                          {submitSuccess}
                        </p>
                      ) : null}

                      {!draftMarker ? (
                        <p className="text-sm text-muted-foreground">
                          Click anywhere on the map to place a draft marker.
                        </p>
                      ) : (
                        <form
                          className="flex flex-col gap-6 justify-around m-1"
                          onSubmit={handleSubmit}
                        >
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
                              items={emotionsOptions}
                              defaultValue={emotionsOptions[0]}
                              onValueChange={(value) =>
                                setFormState((current) => ({
                                  ...current,
                                  emotion: value as Emotion,
                                }))
                              }
                            >
                              <ComboboxInput
                                placeholder="Select an emotion"
                                required={true}
                              />
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
                              <span className="text-sm text-muted-foreground text-right">
                                On a scale of {1} - {5}
                              </span>
                            </span>
                            <Slider
                              defaultValue={[3]}
                              max={5}
                              min={1}
                              step={1}
                              className="mx-auto w-full"
                              onValueChange={(value) =>
                                setFormState((current) => ({
                                  ...current,
                                  intensity: value[0],
                                }))
                              }
                            />
                          </label>

                          <label className="block space-y-1 text-sm">
                            <span className="font-medium">Reflection</span>
                            <Textarea
                              maxLength={280}
                              placeholder="What are you feeling here? What about this space is making you feel this way? (optional)"
                              value={formState.reflection}
                              onChange={(event) =>
                                setFormState((current) => ({
                                  ...current,
                                  reflection: event.target.value,
                                }))
                              }
                              className="mt-1 resize-y"
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
                                      tagOptions.find((t) => t.label === label)
                                        ?.slug ?? "",
                                  )
                                  .filter(Boolean);
                                setFormState((current) => ({
                                  ...current,
                                  tagSlugs: slugs,
                                }));
                              }}
                            >
                              <ComboboxChips
                                ref={comboboxAnchor}
                                className="w-full mt-1"
                              >
                                <ComboboxValue>
                                  {(values) => (
                                    <React.Fragment>
                                      {values.map((value: string) => (
                                        <ComboboxChip key={value}>
                                          {value}
                                        </ComboboxChip>
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
                            Reflection is optional, but listing the exact
                            location is recommended. Use tags to characterize
                            you submission.
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
                              onClick={() => {
                                setDraftMarker(null);
                                setSubmitError(null);
                                setSubmitSuccess(null);
                              }}
                            >
                              Clear Draft Marker
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          )}
        </div>
      </aside>
    </section>
  );
}

export default HomePage;
