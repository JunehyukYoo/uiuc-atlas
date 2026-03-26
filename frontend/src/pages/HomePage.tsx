import { useState, useEffect } from "react";
import type { LatLngTuple } from "leaflet";
import {
  type SubmissionResponse,
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

function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>("pins");
  const [draftMarker, setDraftMarker] = useState<DraftMarker>(null);

  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const center: LatLngTuple = [40.1075, -88.2272]; // Main Quad

  useEffect(() => {
    async function loadSubmissions() {
      try {
        setIsLoading(true);
        const res = await api.get("/api/submissions");
        if (res.data.length === 0) {
          return;
        }
        const parsed = submissionsResponseSchema.safeParse(res.data);

        if (!parsed.success) {
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
              {!draftMarker ? (
                <p className="text-sm text-muted-foreground">
                  Click anywhere on the map to place a draft marker.
                </p>
              ) : (
                <>
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

                  <Button className="w-full">Open Submission Form</Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setDraftMarker(null)}
                  >
                    Clear Draft Marker
                  </Button>
                </>
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
