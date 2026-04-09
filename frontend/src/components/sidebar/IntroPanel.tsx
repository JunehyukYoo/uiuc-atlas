import {
  MapPin,
  Layers,
  Building2,
  MousePointerClick,
  Lock,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

type FeatureProps = {
  icon: React.ElementType;
  title: string;
  description: string;
};

function Feature({ icon: Icon, title, description }: FeatureProps) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export function IntroPanel() {
  return (
    <div
      className="flex-1 min-h-0 rounded-xl border bg-card text-card-foreground shadow-sm overflow-y-auto"
      style={{ scrollbarGutter: "stable" }}
    >
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-base font-bold tracking-tight">UIUC Atlas</h2>
          <p className="text-xs text-muted-foreground">
            An emotional map of campus
          </p>
        </div>

        <Separator />

        {/* Intro */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          UIUC Atlas invites students to record how they feel in specific places
          on campus and to see, in aggregate, how those feelings pattern across
          the spaces we all share.
        </p>

        <Separator />

        {/* Map features */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Map Views
          </p>
          <div className="space-y-4">
            <Feature
              icon={MapPin}
              title="Pins"
              description="Individual submissions appear as colored markers. Filter by emotion, intensity, or tags to explore specific subsets of the data."
            />
            <Feature
              icon={Layers}
              title="Heatmap"
              description="Submissions are aggregated into color-coded density layers — one per emotion — revealing where feelings cluster across campus."
            />
            <Feature
              icon={Building2}
              title="Building Overlays"
              description="Toggle building overlays to see detailed emotional data for each structure (button located top right on the map). Hover over any highlighted building to see a breakdown of emotions and average intensity recorded in that area."
            />
          </div>
        </div>

        <Separator />

        {/* How to submit */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Adding a Submission
          </p>
          <ol className="space-y-2.5">
            {[
              "Switch to Pins view, then click anywhere on the map to drop a draft marker.",
              "Select an emotion and rate its intensity on a scale of 1 – 5.",
              "Optionally add a short reflection (up to 280 characters) and any relevant tags.",
              "Hit Submit. Your pin will appear on the map immediately.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <Separator />

        {/* Privacy note */}
        <div className="flex gap-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
          </span>
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Anonymous by design</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No personally identifiable information is collected. Users are
              limited to one submission per minute.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <MousePointerClick className="h-3.5 w-3.5" />
          </span>
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Ready to explore?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Switch to{" "}
              <span className="text-foreground font-medium">Pins</span> or{" "}
              <span className="text-foreground font-medium">Heatmap</span> above
              to get started.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
