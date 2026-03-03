'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { EvaluationCriteria } from '@/lib/schemas/evaluation-criteria';
import { AlertTriangle, BookOpen, Brain, FileText, Scale, Tag } from 'lucide-react';

interface EvaluationCriteriaPanelProps {
  criteria: EvaluationCriteria;
}

export function EvaluationCriteriaPanel({ criteria }: EvaluationCriteriaPanelProps) {
  const hasContent =
    criteria.corrector_tips ||
    criteria.key_competencies?.length ||
    criteria.required_keywords?.length ||
    criteria.common_mistakes?.length ||
    criteria.legal_references?.length;

  if (!hasContent) return null;

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b bg-muted/30">
        <Scale className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Criterios de evaluación del tribunal de Opositaplace
        </h3>
      </div>

      <Accordion type="multiple" className="divide-y divide-border">
        {/* Corrector Tips */}
        {criteria.corrector_tips && (
          <AccordionItem value="tips" className="border-0">
            <AccordionTrigger className="px-5 py-3 text-sm font-medium hover:no-underline hover:bg-muted/30 transition-colors">
              <span className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-violet-500" />
                Criterios del corrector
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4">
              <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-violet-300 pl-3 italic">
                {criteria.corrector_tips}
              </p>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Key Competencies */}
        {criteria.key_competencies && criteria.key_competencies.length > 0 && (
          <AccordionItem value="competencies" className="border-0">
            <AccordionTrigger className="px-5 py-3 text-sm font-medium hover:no-underline hover:bg-muted/30 transition-colors">
              <span className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                Competencias clave evaluadas
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4">
              <div className="flex flex-wrap gap-2">
                {criteria.key_competencies.map((comp, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="text-xs font-normal bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  >
                    {comp}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Required Keywords */}
        {criteria.required_keywords && criteria.required_keywords.length > 0 && (
          <AccordionItem value="keywords" className="border-0">
            <AccordionTrigger className="px-5 py-3 text-sm font-medium hover:no-underline hover:bg-muted/30 transition-colors">
              <span className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                Términos jurídicos obligatorios
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4">
              <p className="text-xs text-muted-foreground mb-3">
                Estos términos o sus equivalentes jurídicos exactos deben aparecer en tu respuesta.
              </p>
              <div className="flex flex-wrap gap-2">
                {criteria.required_keywords.map((kw, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-xs font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                  >
                    {kw}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Common Mistakes */}
        {criteria.common_mistakes && criteria.common_mistakes.length > 0 && (
          <AccordionItem value="mistakes" className="border-0">
            <AccordionTrigger className="px-5 py-3 text-sm font-medium hover:no-underline hover:bg-muted/30 transition-colors">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Errores frecuentes a evitar
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4">
              <ul className="space-y-2">
                {criteria.common_mistakes.map((mistake, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    {mistake}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Legal References */}
        {criteria.legal_references && criteria.legal_references.length > 0 && (
          <AccordionItem value="legal" className="border-0">
            <AccordionTrigger className="px-5 py-3 text-sm font-medium hover:no-underline hover:bg-muted/30 transition-colors">
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                Normativa aplicable
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-4">
              <div className="space-y-3">
                {criteria.legal_references.map((ref, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/20 p-3">
                    <p className="text-xs font-semibold text-foreground leading-snug">
                      {ref.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{ref.article}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
}
