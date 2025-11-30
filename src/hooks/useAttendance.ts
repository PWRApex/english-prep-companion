import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Attendance {
  id: string;
  user_id: string;
  date: string;
  hours: number;
  status: 'present' | 'absent';
  created_at: string;
}

export type NewAttendance = Omit<Attendance, 'id' | 'user_id' | 'created_at'>;

export function useAttendance() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['attendance', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Attendance[];
    },
    enabled: !!user,
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (attendance: NewAttendance) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('attendance')
        .insert({ ...attendance, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({ title: 'Attendance recorded!' });
    },
    onError: (error) => {
      toast({ title: 'Error recording attendance', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('attendance').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({ title: 'Attendance record deleted!' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting attendance', description: error.message, variant: 'destructive' });
    },
  });
}
