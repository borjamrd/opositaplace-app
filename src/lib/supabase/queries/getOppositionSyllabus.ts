import { createClient } from '@/lib/supabase/client';
import { Block, Topic } from '@/lib/supabase/types';

export type SyllabusData = {
  blocks: Block[];
  topics: Topic[];
};

export async function getOppositionSyllabus(oppositionId: string): Promise<SyllabusData> {
  const supabase = createClient();

  // 1. Fetch Blocks
  const { data: blocks, error: blocksError } = await supabase
    .from('blocks')
    .select('*')
    .eq('opposition_id', oppositionId)
    .order('position', { ascending: true });

  if (blocksError) {
    console.error('Error fetching blocks:', blocksError);
    throw new Error('Failed to load blocks');
  }

  if (!blocks || blocks.length === 0) {
    return { blocks: [], topics: [] };
  }

  const blockIds = blocks.map((b: Block) => b.id);

  // 2. Fetch Topics
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('*')
    .in('block_id', blockIds)
    .order('position', { ascending: true });

  if (topicsError) {
    console.error('Error fetching topics:', topicsError);
    throw new Error('Failed to load topics');
  }

  return {
    blocks: blocks,
    topics: topics || [],
  };
}
