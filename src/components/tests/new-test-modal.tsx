// src/components/tests/new-test-modal.tsx
'use client';

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreateTestForm } from './create-test-form';
import { Plus } from 'lucide-react';
import { useNewTestModalStore } from '@/store/new-test-modal';

type BlockWithTopics = {
  id: string;
  name: string;
  topics: { id: string; name: string }[];
};

interface NewTestModalProps {
  blocksWithTopics: BlockWithTopics[];
  oppositionId: string;
  exams: { id: string; name: string }[];
}

export function NewTestModal({ blocksWithTopics, oppositionId, exams }: NewTestModalProps) {
  const { isOpen, openModal, closeModal } = useNewTestModalStore();

  const handleOpenChange = (open: boolean) => {
    if (open) {
      openModal();
    } else {
      closeModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="mb-6">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Test
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0">
        <DialogTitle className="hidden"></DialogTitle>
        <CreateTestForm
          blocksWithTopics={blocksWithTopics}
          oppositionId={oppositionId}
          setIsOpen={closeModal}
          exams={exams}
        />
      </DialogContent>
    </Dialog>
  );
}
