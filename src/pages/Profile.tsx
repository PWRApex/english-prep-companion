import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useExams } from '@/hooks/useExams';
import { useAttendance } from '@/hooks/useAttendance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Mail, LogOut, Edit, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useMemo } from 'react';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { data: exams = [] } = useExams();
  const { data: attendance = [] } = useAttendance();
  const [showEdit, setShowEdit] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const totalAbsences = useMemo(() => {
    return attendance
      .filter(a => a.status === 'absent')
      .reduce((sum, a) => sum + a.hours, 0);
  }, [attendance]);

  const examAverages = useMemo(() => {
    const types = ['quiz', 'midterm', 'final', 'speaking'] as const;
    return types.map(type => {
      const typeExams = exams.filter(e => e.exam_type === type && e.grade !== null);
      if (typeExams.length === 0) return { type, avg: null };
      const sum = typeExams.reduce((acc, e) => acc + (e.grade || 0), 0);
      return { type, avg: (sum / typeExams.length).toFixed(1) };
    });
  }, [exams]);

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        {/* Profile Header */}
        <Card className="animate-fade-in overflow-hidden">
          <div className="gradient-hero p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-primary-foreground/20">
                <AvatarImage src={profile?.profile_photo_url || undefined} />
                <AvatarFallback className="text-2xl font-bold bg-primary-foreground/20 text-primary-foreground">
                  {getInitials(profile?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="text-primary-foreground">
                <h1 className="text-2xl font-bold">{profile?.name || 'Student'}</h1>
                <p className="opacity-80">{profile?.email}</p>
                <p className="text-sm opacity-60 mt-1">Level: {profile?.english_level || 'A1'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up">
          <Card>
            <CardContent className="p-4 text-center">
              <AlertCircle className={`w-6 h-6 mx-auto mb-2 ${totalAbsences > 20 ? 'text-destructive' : 'text-warning'}`} />
              <p className="text-2xl font-bold text-foreground">{totalAbsences}h</p>
              <p className="text-sm text-muted-foreground">Total Absences</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold text-foreground">{exams.length}</p>
              <p className="text-sm text-muted-foreground">Total Exams</p>
            </CardContent>
          </Card>
        </div>

        {/* Exam Averages */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Exam Averages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {examAverages.map(({ type, avg }) => (
                <div key={type} className="p-3 rounded-lg bg-secondary/50 text-center">
                  <p className="text-xs text-muted-foreground capitalize mb-1">{type}</p>
                  <p className={`text-xl font-bold ${avg ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {avg || '-'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowEdit(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <EditProfileDialog
          profile={profile}
          open={showEdit}
          onClose={() => setShowEdit(false)}
        />
      </div>
    </AppLayout>
  );
}

function EditProfileDialog({ 
  profile, 
  open, 
  onClose 
}: { 
  profile: ReturnType<typeof useProfile>['data']; 
  open: boolean; 
  onClose: () => void;
}) {
  const [name, setName] = useState(profile?.name || '');
  const [englishLevel, setEnglishLevel] = useState(profile?.english_level || 'A1');
  const updateProfile = useUpdateProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }
    
    await updateProfile.mutateAsync({
      name: name.trim(),
      english_level: englishLevel,
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-level">English Level</Label>
            <Select value={englishLevel} onValueChange={setEnglishLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A1">A1 - Beginner</SelectItem>
                <SelectItem value="A2">A2 - Elementary</SelectItem>
                <SelectItem value="B1">B1 - Intermediate</SelectItem>
                <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                <SelectItem value="C1">C1 - Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={updateProfile.isPending}>
              {updateProfile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
