'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AICorrectionAnalysis } from '@/lib/supabase/types';
import { BookOpen, CheckCircle2, Lightbulb, XCircle } from 'lucide-react';

export function CorrectionFeedback({ analysis }: { analysis: AICorrectionAnalysis }) {
  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-emerald-600';
    if (score >= 5) return 'text-blue-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Tarjeta de Puntuación Principal */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg text-muted-foreground">Calificación Global</CardTitle>
              <h2 className={`text-4xl font-bold mt-1 ${getScoreColor(analysis.score)}`}>
                {analysis.score}/10
              </h2>
            </div>
            {/* Gráfico circular o barra simple */}
            <div className="w-32">
              <Progress value={analysis.score * 10} className="h-3" />
              <p className="text-xs text-right mt-1 text-muted-foreground">
                {analysis.score >= 5 ? 'Aprobado' : 'Suspenso'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium leading-relaxed text-foreground/80">
            "{analysis.summary}"
          </p>
        </CardContent>
      </Card>

      {/* 2. Lista de Cotejo (Key Points) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Criterios de Evaluación
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {analysis.key_points.map((point, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border">
              {point.present ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium">{point.concept}</p>
                {point.explanation && (
                  <p className="text-xs text-muted-foreground">{point.explanation}</p>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 3. Análisis Legal (Si existe) */}
      {analysis.legal_check && analysis.legal_check.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Citas Legales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.legal_check.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-sm border-b last:border-0 pb-2 last:pb-0"
              >
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                  {item.article}
                </span>
                <Badge
                  variant={
                    item.status === 'correct'
                      ? 'default'
                      : item.status === 'missing'
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {item.status === 'correct'
                    ? 'Correcto'
                    : item.status === 'missing'
                      ? 'Falta cita'
                      : 'Erróneo'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 4. Sugerencias de Mejora */}
      <Accordion type="single" collapsible>
        <AccordionItem value="suggestions" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-amber-600">
              <Lightbulb className="w-5 h-5" />
              <span>Sugerencias de mejora ({analysis.suggestions.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  className="text-sm text-muted-foreground pl-4 border-l-2 border-amber-200"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
