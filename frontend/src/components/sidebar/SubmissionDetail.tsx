import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EMOTION_META } from "../../../../shared/emotions";
import type { SubmissionResponse } from "../../../../shared/schemas/submission";

type Props = {
  submission: SubmissionResponse;
  onBack: () => void;
};

export function SubmissionDetail({ submission, onBack }: Props) {
  return (
    <div className="flex-1 min-h-0 overflow-hidden px-6 pb-4">
      <div
        className="overflow-y-auto h-full space-y-3 text-sm"
        style={{ paddingRight: "18px", marginRight: "-18px" }}
      >
        <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
          ← Back
        </Button>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full inline-block shrink-0"
              style={{
                backgroundColor: EMOTION_META[submission.emotion].color,
              }}
            />
            <span className="font-medium">
              {EMOTION_META[submission.emotion].label}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Intensity</span>
            <span>{submission.intensity} / 5</span>
          </div>

          {submission.reflection && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-muted-foreground">Reflection</p>
                <p>{submission.reflection}</p>
              </div>
            </>
          )}

          {submission.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {submission.tags.map((tag) => (
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
            {submission.latitude.toFixed(6)}, {submission.longitude.toFixed(6)}
          </p>
      </div>
    </div>
  );
}
