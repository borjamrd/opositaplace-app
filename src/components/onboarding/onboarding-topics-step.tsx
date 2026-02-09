'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getOppositionSyllabus, SyllabusData } from '@/lib/supabase/queries/getOppositionSyllabus';
import { Block, Topic } from '@/lib/supabase/types';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OnboardingTopicsStepProps {
  oppositionId: string;
  selectedTopics: string[];
  onSelectTopics: (topics: string[]) => void;
}

export default function OnboardingTopicsStep({
  oppositionId,
  selectedTopics,
  onSelectTopics,
}: OnboardingTopicsStepProps) {
  const [syllabus, setSyllabus] = useState<SyllabusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSyllabus() {
      if (!oppositionId) return;
      setIsLoading(true);
      try {
        const data = await getOppositionSyllabus(oppositionId);
        setSyllabus(data);
      } catch (error) {
        console.error('Failed to load syllabus', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSyllabus();
  }, [oppositionId]);

  const handleToggleTopic = (topicId: string) => {
    const newSelected = selectedTopics.includes(topicId)
      ? selectedTopics.filter((id) => id !== topicId)
      : [...selectedTopics, topicId];
    onSelectTopics(newSelected);
  };

  const handleToggleBlock = (blockId: string, blockTopicIds: string[]) => {
    const allSelected = blockTopicIds.every((id) => selectedTopics.includes(id));
    let newSelected;
    if (allSelected) {
      newSelected = selectedTopics.filter((id) => !blockTopicIds.includes(id));
    } else {
      const toAdd = blockTopicIds.filter((id) => !selectedTopics.includes(id));
      newSelected = [...selectedTopics, ...toAdd];
    }
    onSelectTopics(newSelected);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando temario...</span>
      </div>
    );
  }

  if (!syllabus || syllabus.blocks.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No se ha encontrado temario para esta oposición.</p>
      </div>
    );
  }

  // Helper to group topics by block
  const topicsByBlock = (syllabus.topics || []).reduce(
    (acc, topic) => {
      if (topic.block_id) {
        if (!acc[topic.block_id]) acc[topic.block_id] = [];
        acc[topic.block_id].push(topic);
      }
      return acc;
    },
    {} as Record<string, Topic[]>
  );

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted-foreground">
          Selecciona los temas que ya has estudiado o estás estudiando actualmente. Esto nos ayudará
          a personalizar tu roadmap.
        </p>
      </div>

      <div className="flex justify-end mb-2">
        <span className="text-sm text-muted-foreground">
          {selectedTopics.length} temas seleccionados
        </span>
      </div>

      <ScrollArea className="h-[400px] border rounded-md p-4 bg-background/50">
        <Accordion type="multiple" className="w-full space-y-2">
          {syllabus.blocks.map((block) => {
            const blockTopics = topicsByBlock[block.id] || [];
            const blockTopicIds = blockTopics.map((t) => t.id);
            const allSelected =
              blockTopics.length > 0 && blockTopics.every((t) => selectedTopics.includes(t.id));
            const someSelected = blockTopics.some((t) => selectedTopics.includes(t.id));

            return (
              <AccordionItem key={block.id} value={block.id} className="border-b-0">
                <div className="flex items-center space-x-2 bg-muted/40 p-2 rounded-lg hover:bg-muted/60 transition-colors">
                  <Checkbox
                    checked={allSelected || (someSelected ? 'indeterminate' : false)}
                    onCheckedChange={() => handleToggleBlock(block.id, blockTopicIds)}
                    id={`block-${block.id}`}
                    className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <AccordionTrigger className="hover:no-underline py-0 flex-1">
                    <div className="flex flex-col items-start text-left ml-2">
                      <span className="text-sm font-semibold">{block.name}</span>
                      {block.description && (
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {block.description}
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                </div>
                <AccordionContent className="pl-9 pt-2 pb-4">
                  <div className="grid grid-cols-1 gap-2">
                    {blockTopics.map((topic) => (
                      <div
                        key={topic.id}
                        className="flex items-start space-x-3 p-2 rounded hover:bg-muted/20"
                      >
                        <Checkbox
                          id={`topic-${topic.id}`}
                          checked={selectedTopics.includes(topic.id)}
                          onCheckedChange={() => handleToggleTopic(topic.id)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={`topic-${topic.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {topic.name}
                          </label>
                        </div>
                      </div>
                    ))}
                    {blockTopics.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        No hay temas en este bloque
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </ScrollArea>
    </div>
  );
}
