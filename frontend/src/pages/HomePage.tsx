import { useState, useEffect } from "react";
import type { LatLngTuple } from "leaflet";
import {
  type Emotion,
  type SubmissionResponse,
  emotionSchema,
  submissionResponseSchema,
  submissionsResponseSchema,
} from "../../../shared/schemas/submission";
import api from "../api";
import { AxiosError } from "axios";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CampusMap from "@/components/map/CampusMap";

type ViewMode = "pins" | "heatmap";

type DraftMarker = {
  lat: number;
  lng: number;
} | null;

type SubmissionFormState = {
  emotion: Emotion;
  intensity: number;
  reflection: string;
  tagSlug: string;
};

const defaultFormState: SubmissionFormState = {
  emotion: emotionSchema.options[0],
  intensity: 3,
  reflection: "",
  tagSlug: "",
};

function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("pins");
  const [draftMarker, setDraftMarker] = useState<DraftMarker>(null);
  const [formState, setFormState] =
    useState<SubmissionFormState>(defaultFormState);

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
    loadSubmissions();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
        tagSlug: formState.tagSlug.trim() || undefined,
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
              onMapClick={setDraftMarker}
            />
          )}
        </div>
      </div>
      <div>{error ? error : ""}</div>

      <aside className="w-full p-8">
        <div className="h-full overflow-y-auto space-y-4">
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

          <Card>
            <CardHeader>
              <CardTitle>Add Submission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
                <form className="space-y-4" onSubmit={handleSubmit}>
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
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={formState.emotion}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          emotion: event.target.value as Emotion,
                        }))
                      }
                    >
                      {emotionSchema.options.map((emotion) => (
                        <option key={emotion} value={emotion}>
                          {emotion.charAt(0) + emotion.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-1 text-sm">
                    <span className="font-medium">Intensity</span>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={formState.intensity}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          intensity: Number(event.target.value),
                        }))
                      }
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
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
                    <span className="font-medium">Tag Slug</span>
                    <input
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      placeholder="optional-tag"
                      value={formState.tagSlug}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          tagSlug: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <p className="text-xs text-muted-foreground">
                    Reflection is optional. Tag slug must already exist in the
                    backend if you use one.
                  </p>

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
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Emotion and tag filters can go here.
              </p>
            </CardContent>
          </Card>
        </div>
      </aside>
    </section>
  );
}

export default HomePage;
