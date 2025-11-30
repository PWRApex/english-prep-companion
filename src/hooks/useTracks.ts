import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface VocabularyItem {
  word: string;
  meaning: string;
  learned: boolean;
}

export interface Track {
  id: string;
  user_id: string;
  unit_name: string;
  vocabulary: VocabularyItem[];
  grammar_topics: string[];
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export type NewTrack = Omit<Track, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export function useTracks() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['tracks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(track => ({
        ...track,
        vocabulary: (track.vocabulary as unknown as VocabularyItem[]) || [],
        grammar_topics: (track.grammar_topics as unknown as string[]) || [],
      })) as Track[];
    },
    enabled: !!user,
  });
}

export function useCreateTrack() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (track: NewTrack) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('tracks')
        .insert({ 
          ...track, 
          user_id: user.id,
          vocabulary: JSON.stringify(track.vocabulary),
          grammar_topics: JSON.stringify(track.grammar_topics),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      toast({ title: 'Track added successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error adding track', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateTrack() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Track> & { id: string }) => {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.vocabulary) {
        updateData.vocabulary = JSON.stringify(updates.vocabulary);
      }
      if (updates.grammar_topics) {
        updateData.grammar_topics = JSON.stringify(updates.grammar_topics);
      }
      
      const { data, error } = await supabase
        .from('tracks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      toast({ title: 'Track updated!' });
    },
    onError: (error) => {
      toast({ title: 'Error updating track', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteTrack() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tracks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      toast({ title: 'Track deleted!' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting track', description: error.message, variant: 'destructive' });
    },
  });
}
