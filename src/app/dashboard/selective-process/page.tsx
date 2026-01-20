import { PageContainer } from '@/components/page-container';
import { SelectiveProcessClient } from '@/components/selective-process/selective-process-client';
import { getSessionData } from '@/lib/supabase/queries/get-session-data';

export default async function SelectiveProcessPage() {
  const sessionData = await getSessionData();
  const { activeOpposition } = sessionData;

  return (
    <PageContainer title="Procesos Selectivos">
      <SelectiveProcessClient oppositionId={activeOpposition?.id} />
    </PageContainer>
  );
}
