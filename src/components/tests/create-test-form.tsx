// app/dashboard/tests/_components/create-test-form.tsx
'use client';

import { createTestAttempt } from '@/actions/tests';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useStudySessionStore } from '@/store/study-session-store';
import { Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

type Topic = { id: string; name: string };
type BlockWithTopics = { id: string; name: string; topics: Topic[] };

interface IFormInput {
    mode: 'random' | 'errors' | 'topics';
    topicIds: string[];
    numQuestions: number;
    timerEnabled: boolean;
    includeNoTopic: boolean;
}

export function CreateTestForm({
    blocksWithTopics,
    oppositionId,
}: {
    blocksWithTopics: BlockWithTopics[];
    oppositionId: string;
}) {
    const { control, handleSubmit, watch, setValue } = useForm<IFormInput>({
        defaultValues: {
            mode: 'random',
            numQuestions: 25,
            timerEnabled: true,
            topicIds: [],
            includeNoTopic: true,
        },
    });
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [numQuestions, setNumQuestionsState] = useState(25);
    const activeStudyCycle = useStudySessionStore((state) => state.activeStudyCycle);
    const mode = watch('mode');
    const selectedTopics = watch('topicIds');

    const onSubmit = (data: IFormInput) => {
        if (!activeStudyCycle) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se ha encontrado un ciclo de estudio activo.',
            });
            return;
        }
        if (data.mode === 'topics' && data.topicIds.length === 0) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Debes seleccionar al menos un tema.',
            });
            return;
        }

        startTransition(async () => {
            const result = await createTestAttempt({
                ...data,
                numQuestions,
                oppositionId,
                studyCycleId: activeStudyCycle.id,
            });
            if (result?.error) {
                toast({
                    variant: 'destructive',
                    title: 'Error al crear el test',
                    description: result.error,
                });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card variant={'borderless'} className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Configura tu test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div>
                        <Label className="text-lg font-semibold">1. Elige un modo</Label>
                        <Controller
                            name="mode"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="mt-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="random" id="r1" />
                                        <Label htmlFor="r1">Test aleatorio</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="errors" id="r2" />
                                        <Label htmlFor="r2">Repaso de Errores</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="topics" id="r3" />
                                        <Label htmlFor="r3">Test por Temas</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    {mode === 'topics' && (
                        <div>
                            <Label className="text-lg font-semibold">2. Selecciona los temas</Label>
                            <div className="space-y-4 mt-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                                {blocksWithTopics.map((block) => (
                                    <div key={block.id}>
                                        <h4 className="font-medium mb-2">{block.name}</h4>
                                        <div className="space-y-1 pl-4">
                                            {block.topics.map((topic) => (
                                                <div
                                                    key={topic.id}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Checkbox
                                                        id={topic.id}
                                                        checked={
                                                            !!selectedTopics?.includes(topic.id)
                                                        }
                                                        onCheckedChange={(checked) => {
                                                            const isChecked = Boolean(checked);
                                                            const currentIds = selectedTopics || [];
                                                            const newIds = isChecked
                                                                ? [...currentIds, topic.id]
                                                                : currentIds.filter(
                                                                      (id) => id !== topic.id
                                                                  );
                                                            setValue('topicIds', newIds);
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor={topic.id}
                                                        className="font-normal"
                                                    >
                                                        {topic.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Número de Preguntas */}
                    <div>
                        <Label className="text-lg font-semibold">
                            3. Número de preguntas: <strong>{numQuestions}</strong>
                        </Label>
                        <Slider
                            defaultValue={[25]}
                            max={100}
                            min={10}
                            step={5}
                            className="mt-3"
                            onValueChange={(v) => setNumQuestionsState(v[0])}
                        />
                    </div>

                    {/* Opciones Adicionales */}
                    {/* <div>
                        <Label className="text-lg font-semibold">4. Opciones</Label>
                        <div className="flex items-center space-x-2 mt-2">
                            <Controller
                                name="timerEnabled"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        id="timer-switch"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                )}
                            />
                            <Label htmlFor="timer-switch">Activar temporizador</Label>
                        </div>
                    </div> */}
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Comenzar Test
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
