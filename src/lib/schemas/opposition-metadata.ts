// src/lib/schemas/opposition-metadata.ts
import { z } from 'zod';

export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['test', 'practical', 'oral', 'physical', 'language', 'psychotechnical']),
  duration_minutes: z.number().optional(),
  question_count: z.number().optional(),
});

export const OppositionMetadataSchema = z.object({
  features: z
    .object({
      has_oral_exam: z.boolean().default(false),
      has_practical_case: z.boolean().default(false),
      has_physical_tests: z.boolean().default(false),
      has_language_test: z.boolean().default(false),
      has_psychotechnical_test: z.boolean().default(false),
    })
    .default({}),

  recommendations: z
    .object({
      recommended_daily_hours: z.number().min(0).max(24).optional(),
      average_preparation_years: z.number().optional(),
      difficulty_level: z.enum(['Baja', 'Media', 'Alta', 'Muy Alta']).optional(),
    })
    .default({}),

  exercises: z.array(ExerciseSchema).default([]),
});

export type OppositionMetadata = z.infer<typeof OppositionMetadataSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
