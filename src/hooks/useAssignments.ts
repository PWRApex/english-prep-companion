import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Assignment {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
}

export type NewAssignment = Omit<Assignment, 'id' | 'user_id' | 'created_at'>;

export function useAssignments() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['assignments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data as Assignment[];
    },
    enabled: !!user,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (assignment: NewAssignment) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('assignments')
        .insert({ ...assignment, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast({ title: 'Assignment added successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error adding assignment', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Assignment> & { id: string }) => {
      const { data, error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast({ title: 'Assignment updated!' });
    },
    onError: (error) => {
      toast({ title: 'Error updating assignment', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast({ title: 'Assignment deleted!' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting assignment', description: error.message, variant: 'destructive' });
    },
  });
}
