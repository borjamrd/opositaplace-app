import { PageContainer } from '@/components/page-container';
import { SelectiveProcessClient } from '@/components/selective-process/selective-process-client';

export default function SelectiveProcessPage() {
  return (
    <PageContainer title="Procesos Selectivos">
      <SelectiveProcessClient />
    </PageContainer>
  );
}
