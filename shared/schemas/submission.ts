import { z } from "zod";

export const emotionSchema = z.enum([
  "CALM",
  "STRESSED",
  "INSPIRED",
  "LONELY",
  "FRUSTRATED",
  "ENERGIZED",
]);

export const submissionStatusSchema = z.enum(["VISIBLE", "HIDDEN", "FLAGGED"]);

export const tagSchema = z.object({
  id: z.string(),
  slug: z.string(),
  label: z.string(),
});

export const submissionResponseSchema = z.object({
  id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  emotion: emotionSchema,
  intensity: z.number().int().min(1).max(5),
  reflection: z.string().nullable(),
  createdAt: z.string(),
  tag: tagSchema.nullable(),
});

export const submissionsResponseSchema = z.array(submissionResponseSchema);

export type SubmissionResponse = z.infer<typeof submissionResponseSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type Emotion = z.infer<typeof emotionSchema>;
export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;
