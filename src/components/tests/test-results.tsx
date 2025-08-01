'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, HelpCircle, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { QuestionWithAnswers } from '@/app/dashboard/tests/[id]/page';

interface TestResultsProps {
    questions: QuestionWithAnswers[];
    userAnswers: Record<string, string>;
}

export function TestResults({ questions, userAnswers }: TestResultsProps) {
    const { correctCount, incorrectCount, unansweredCount } = React.useMemo(() => {
        let correct = 0;
        let incorrect = 0;
        let unanswered = 0;

        questions.forEach((question) => {
            const userAnswerId = userAnswers[question.id];

            if (!userAnswerId) {
                unanswered++;
            } else {
                const correctAnswer = question.answers.find((a) => a.is_correct);
                if (userAnswerId === correctAnswer?.id) {
                    correct++;
                } else {
                    incorrect++;
                }
            }
        });

        console.log(
            `Test Results - Correct: ${correct}, Incorrect: ${incorrect}, Unanswered: ${unanswered}`
        );
        return {
            correctCount: correct,
            incorrectCount: incorrect,
            unansweredCount: unanswered,
        };
    }, [questions, userAnswers]);

    const totalQuestions = questions.length;
    const netPoints = totalQuestions - incorrectCount

    const finalScore = totalQuestions > 0 ? (netPoints / totalQuestions) * 10 : 0;

    return (
        <Card className="w-full max-w-3xl mx-auto mt-8 border-none shadow-none">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Resumen del Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <CheckCircle className="w-8 h-8 mx-auto text-green-600" />
                        <p className="mt-2 text-lg font-semibold">Correctas</p>
                        <p className="text-3xl font-bold text-green-700 dark:text-green-500">
                            {correctCount}
                        </p>
                    </div>
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <XCircle className="w-8 h-8 mx-auto text-red-600" />
                        <p className="mt-2 text-lg font-semibold">Incorrectas</p>
                        <p className="text-3xl font-bold text-red-700 dark:text-red-500">
                            {incorrectCount}
                        </p>
                    </div>
                    <div className="p-4 bg-gray-100 dark:bg-gray-800/30 rounded-lg">
                        <HelpCircle className="w-8 h-8 mx-auto text-gray-600" />
                        <p className="mt-2 text-lg font-semibold">En Blanco</p>
                        <p className="text-3xl font-bold text-gray-700 dark:text-gray-400">
                            {unansweredCount}
                        </p>
                    </div>
                </div>

                <div className="text-center pt-4">
                    <p className="text-lg">Calificación Final (sobre 10)</p>
                    <p
                        className={`text-5xl font-bold ${
                            finalScore >= 5 ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        {finalScore.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Puntuación neta: {netPoints.toFixed(2)} puntos sobre {totalQuestions}{' '}
                        preguntas
                    </p>
                </div>

                <div className="flex justify-center pt-6">
                    <Button asChild>
                        <Link href="/dashboard/tests">Volver a Tests</Link>
                    </Button>
                </div>

                <Separator className="my-8" />

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-center">Revisión de Preguntas</h3>
                    <Accordion type="multiple" className="w-full">
                        {questions.map((question, index) => {
                            const userAnswerId = userAnswers[question.id];
                            const correctAnswer = question.answers.find((a) => a.is_correct);
                            const isUserCorrect = userAnswerId === correctAnswer?.id;

                            return (
                                <AccordionItem value={`item-${index}`} key={question.id}>
                                    <AccordionTrigger className="text-left hover:no-underline">
                                        <div className="flex items-center gap-4">
                                            {userAnswerId ? (
                                                isUserCorrect ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                                )
                                            ) : (
                                                <HelpCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                            )}
                                            <span>
                                                {index + 1}. {question.text}
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <ul className="space-y-3 pl-4 pt-2">
                                            {question.answers.map((answer) => {
                                                const isCorrect = answer.is_correct;
                                                const isSelected = answer.id === userAnswerId;

                                                return (
                                                    <li
                                                        key={answer.id}
                                                        className={cn(
                                                            'flex items-center gap-3 p-3 rounded-md text-sm',
                                                            isCorrect &&
                                                                'bg-green-100/80 dark:bg-green-900/30 text-green-800 dark:text-green-400 font-semibold',
                                                            isSelected &&
                                                                !isCorrect &&
                                                                'bg-red-100/80 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                                        )}
                                                    >
                                                        {isCorrect ? (
                                                            <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                                                        ) : isSelected && !isCorrect ? (
                                                            <X className="h-5 w-5 text-red-600 flex-shrink-0" />
                                                        ) : (
                                                            <div className="h-5 w-5 flex-shrink-0" />
                                                        )}
                                                        <span>{answer.text}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </div>
            </CardContent>
        </Card>
    );
}
