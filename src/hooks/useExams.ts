import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Exam {
  id: string;
  user_id: string;
  exam_title: string;
  exam_type: 'quiz' | 'midterm' | 'final' | 'speaking';
  exam_date: string;
  grade: number | null;
  notes: string | null;
  created_at: string;
}

export type NewExam = Omit<Exam, 'id' | 'user_id' | 'created_at'>;

export function useExams() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['exams', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('user_id', user.id)
        .order('exam_date', { ascending: false });
      
      if (error) throw error;
      return data as Exam[];
    },
    enabled: !!user,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (exam: NewExam) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('exams')
        .insert({ ...exam, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: 'Exam added successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error adding exam', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Exam> & { id: string }) => {
      const { data, error } = await supabase
        .from('exams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: 'Exam updated successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error updating exam', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteExam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('exams').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast({ title: 'Exam deleted successfully!' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting exam', description: error.message, variant: 'destructive' });
    },
  });
}
