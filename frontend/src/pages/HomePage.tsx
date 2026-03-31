import { useState, useEffect, useMemo } from "react";
import React from "react";
import {
  type Emotion,
  type SubmissionResponse,
  type Tag,
  emotionSchema,
  submissionResponseSchema,
  submissionsResponseSchema,
} from "../../../shared/schemas/submission";
import { EMOTIONS } from "../../../shared/emotions";

import api from "../api";
import { AxiosError } from "axios";
import { toast } from "sonner";

import type { LatLngTuple } from "leaflet";

import CampusMap from "@/components/map/CampusMap";
import { SubmissionDetail } from "@/components/sidebar/SubmissionDetail";
import { SubmissionForm } from "@/components/sidebar/SubmissionForm";

import { ViewToggle } from "@/components/sidebar/ViewToggle";
import { HeatmapControls } from "@/components/sidebar/HeatmapControls";
import {
  PinsFilter,
  defaultPinsFilter,
  type PinsFilterState,
} from "@/components/sidebar/PinsFilter";
import { SidebarDrawer } from "@/components/sidebar/SidebarDrawer";

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

  // FILTER STATE (pins mode)
  const [pinsFilter, setPinsFilter] =
    useState<PinsFilterState>(defaultPinsFilter);

  // LOADING STATES
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]); // the pins
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const center: LatLngTuple = [40.1075, -88.2272]; // Main Quad

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(
      (s) =>
        pinsFilter.emotions.has(s.emotion as Emotion) &&
        s.intensity >= pinsFilter.intensityMin &&
        s.intensity <= pinsFilter.intensityMax &&
        (pinsFilter.tagSlugs.size === 0 ||
          s.tags.some((t) => pinsFilter.tagSlugs.has(t.slug))),
    );
  }, [submissions, pinsFilter]);

  // Load submissions, emotions, and tags on mount
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

  // Show toasts for submission result or loading errors
  useEffect(() => {
    if (submitError) {
      toast.error(submitError);
    } else if (submitSuccess) {
      toast.success(submitSuccess);
    } else if (error) {
      toast.error(error);
    }
  }, [submitError, submitSuccess, error]);

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
              submissions={
                viewMode === "pins" ? filteredSubmissions : submissions
              }
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

      <aside className="w-full p-8 h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex flex-col gap-4 h-full overflow-hidden">
          <ViewToggle onChange={setViewMode} />

          {viewMode === "heatmap" ? (
            <SidebarDrawer title="Heatmap Controls" defaultOpen={true}>
              <HeatmapControls
                activeEmotions={activeHeatmapEmotions}
                onToggle={(emotion) =>
                  setActiveHeatmapEmotions((prev) => {
                    const next = new Set(prev);
                    if (next.has(emotion)) {
                      next.delete(emotion);
                    } else {
                      next.add(emotion);
                    }
                    return next;
                  })
                }
              />
            </SidebarDrawer>
          ) : (
            <>
              <SidebarDrawer title="Filter Pins" defaultOpen={false}>
                <PinsFilter
                  filter={pinsFilter}
                  tagOptions={tagOptions}
                  onChange={setPinsFilter}
                />
              </SidebarDrawer>
              <SidebarDrawer
                title={selectedSubmission ? "Submission" : "Add Submission"}
              >
                {selectedSubmission ? (
                  <SubmissionDetail
                    submission={selectedSubmission}
                    onBack={() => setSelectedSubmission(null)}
                  />
                ) : (
                  <SubmissionForm
                    draftMarker={draftMarker}
                    formState={formState}
                    emotionOptions={emotionsOptions}
                    tagOptions={tagOptions}
                    submitError={submitError}
                    submitSuccess={submitSuccess}
                    isSubmitting={isSubmitting}
                    onFormChange={(updates) =>
                      setFormState((cur) => ({ ...cur, ...updates }))
                    }
                    onSubmit={handleSubmit}
                    onClearDraft={() => {
                      setDraftMarker(null);
                      setSubmitError(null);
                      setSubmitSuccess(null);
                    }}
                  />
                )}
              </SidebarDrawer>
            </>
          )}
        </div>
      </aside>
    </section>
  );
}

export default HomePage;
