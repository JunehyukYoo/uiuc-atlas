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
import api from "../api";
import { AxiosError } from "axios";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CampusMap from "@/components/map/CampusMap";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Slider } from "@/components/ui/slider";

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
  const [viewMode, setViewMode] = useState<ViewMode>("pins");
  const [draftMarker, setDraftMarker] = useState<DraftMarker>(null);
  const [formState, setFormState] =
    useState<SubmissionFormState>(defaultFormState);
  const [emotionsOptions, setEmotionsOptions] = useState<Emotion[]>([]);
  const [tagOptions, setTagOptions] = useState<Tag[]>([]);

  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const center: LatLngTuple = [40.1075, -88.2272]; // Main Quad

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
              onMapClick={setDraftMarker}
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

          <Card className="flex-1 min-h-0">
            <CardHeader>
              <CardTitle>Add Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 overflow-y-auto">
              <div
                className="overflow-y-auto h-full"
                style={{ paddingRight: "18px", marginRight: "-18px" }} // shift scrollwheel
              >
                {submitError ? (
                  <p className="text-sm text-red-600">{submitError}</p>
                ) : null}
                {submitSuccess ? (
                  <p className="text-sm text-green-600">{submitSuccess}</p>
                ) : null}

                {!draftMarker ? (
                  <p className="text-sm text-muted-foreground">
                    Click anywhere on the map to place a draft marker.
                  </p>
                ) : (
                  <form
                    className="flex flex-col gap-6 justify-around"
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
                        className="mx-auto w-full max-w-xs"
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
                      <textarea
                        className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2"
                        maxLength={280}
                        placeholder="What are you feeling here?"
                        value={formState.reflection}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            reflection: event.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="block space-y-1 text-sm">
                      <span className="font-medium">Tags</span>
                      <Combobox
                        items={tagOptions}
                        multiple
                        onValueChange={(value) =>
                          setFormState((current) => ({
                            ...current,
                            tagSlugs: value as string[],
                          }))
                        }
                      >
                        <ComboboxInput
                          placeholder={
                            formState.tagSlugs.length > 0 ? "" : "Optional tags"
                          }
                        />
                        <ComboboxContent>
                          <ComboboxEmpty>No items found.</ComboboxEmpty>
                          <ComboboxList>
                            {(item) => (
                              <ComboboxItem key={item.slug} value={item.slug}>
                                {item.label}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      {formState.tagSlugs.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {formState.tagSlugs.map((slug) => {
                            const tag = tagOptions.find((t) => t.slug === slug);
                            return (
                              <span
                                key={slug}
                                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs"
                              >
                                {tag?.label ?? slug}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormState((current) => ({
                                      ...current,
                                      tagSlugs: current.tagSlugs.filter(
                                        (s) => s !== slug,
                                      ),
                                    }))
                                  }
                                >
                                  ✕
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </label>

                    <p className="text-xs text-muted-foreground">
                      Reflection is optional, but listing the exact location is
                      recommended. Use tags to characterize you submission.
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
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Emotion and tag filters can go here.
              </p>
            </CardContent>
          </Card> */}
        </div>
      </aside>
    </section>
  );
}

export default HomePage;
