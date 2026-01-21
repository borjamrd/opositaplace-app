import { PageContainer } from '@/components/page-container';
import { SelectiveProcessClient } from '@/components/selective-process/selective-process-client';
import { getSessionData } from '@/lib/supabase/queries/get-session-data';

export default async function SelectiveProcessPage() {
  const sessionData = await getSessionData();
  const { activeOpposition } = sessionData;

  const infoContent = (
    <div>
      <p>En esta sección puedes ver el proceso selectivo activo para la oposición seleccionada.</p>
    </div>
  );

  return (
    <PageContainer title="Proceso selectivo" infoContent={infoContent}>
      <SelectiveProcessClient oppositionId={activeOpposition?.id} />
    </PageContainer>
  );
}
