// src/lib/supabase/queries/getActiveOppositions.ts
import { createClient } from '@/lib/supabase/client';
import { Opposition } from '../types';
import { OppositionMetadataSchema } from '@/lib/schemas/opposition-metadata';

export async function getActiveOppositions(): Promise<Opposition[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('oppositions')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching oppositions:', error);
    return [];
  }

  if (!data) return [];

  const typedOppositions: Opposition[] = data.map((opp) => {
    const parsedMetadata = OppositionMetadataSchema.safeParse(opp.metadata);

    let metadataData;

    if (parsedMetadata.success) {
      metadataData = parsedMetadata.data;
    } else {
      console.warn(
        `Metadata inválida para oposición ${opp.id}, usando defaults`,
        parsedMetadata.error
      );
      metadataData = OppositionMetadataSchema.parse({});
    }

    return {
      ...opp,
      metadata: metadataData,
    } as Opposition;
  });

  return typedOppositions;
}
