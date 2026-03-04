// src/lib/schemas/evaluation-criteria.ts

export interface LegalReference {
  title: string;
  article: string;
}

export interface ScoringRubricItem {
  criterion: string;
  max_points: number;
  description?: string;
}

export interface EvaluationCriteria {
  corrector_tips?: string;
  scoring_rubric?: ScoringRubricItem[];
  common_mistakes?: string[];
  key_competencies?: string[];
  legal_references?: LegalReference[];
  required_keywords?: string[];
}
