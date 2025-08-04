'use client';

import { StudySessionsChart } from '../charts/study-sessions-chart';
import { UrlSubscriptionChanges } from '../scrapping/url-suscription-changes';
import { FailedQuestionFlashcard } from './failed-question-flashcard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { QuestionWithAnswers } from '@/app/dashboard/page';

interface DashboardContentProps {
    failedQuestions: QuestionWithAnswers[];
}

const DashboardContent = ({ failedQuestions }: DashboardContentProps) => {
    return (
        <div className="flex-1 grid container p-20 gap-4 md:grid-cols-2 lg:grid-cols-2">
            <div className="row-1 col-1">
                <StudySessionsChart />
            </div>
            <div className="row-span-2 col-1">
                <UrlSubscriptionChanges urlId="50687438-2fea-4111-bf04-8babdae0fc1f" />
            </div>

            <div className="row-span-1 col-1">
                {failedQuestions.length > 0 ? (
                    <FailedQuestionFlashcard questions={failedQuestions} />
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Preguntas que has fallado</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                                <p>¡Genial! Aún no tienes preguntas falladas para repasar.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export { DashboardContent };
