import { z } from 'zod';
import { Emotion } from '../../generated/prisma/client';

export const createSubmissionSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  emotion: z.enum(Emotion),
  intensity: z.int().min(1).max(5),
  reflection: z.string().trim().max(280).nullable().optional(),
  tagSlug: z.string().trim().min(1).optional(),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;