import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useProfile } from '@/hooks/useProfile';
import { useExams } from '@/hooks/useExams';
import { useAssignments } from '@/hooks/useAssignments';
import { useAttendance } from '@/hooks/useAttendance';
import { useTracks } from '@/hooks/useTracks';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, BookOpen, Clock, ChevronRight, Plus, AlertCircle } from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';

export default function Home() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: exams = [] } = useExams();
  const { data: assignments = [] } = useAssignments();
  const { data: attendance = [] } = useAttendance();
  const { data: tracks = [] } = useTracks();

  const upcomingExams = exams
    .filter(e => isAfter(parseISO(e.exam_date), new Date()))
    .slice(0, 3);

  const pendingAssignments = assignments
    .filter(a => a.status !== 'completed')
    .slice(0, 3);

  const totalAbsences = attendance
    .filter(a => a.status === 'absent')
    .reduce((sum, a) => sum + a.hours, 0);

  const totalTracks = tracks.length;
  const completedTracks = tracks.filter(t => t.completion_percentage === 100).length;
  const courseProgress = totalTracks > 0 
    ? Math.round(tracks.reduce((sum, t) => sum + t.completion_percentage, 0) / totalTracks)
    : 0;

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={profile?.profile_photo_url || undefined} />
              <AvatarFallback className="gradient-hero text-primary-foreground font-semibold">
                {getInitials(profile?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <h1 className="text-xl font-bold text-foreground">{profile?.name || 'Student'}</h1>
            </div>
          </div>
          <Badge variant="outline" className="font-semibold">
            Level {profile?.english_level || 'A1'}
          </Badge>
        </div>

        {/* Progress Card */}
        <Card className="animate-slide-up overflow-hidden">
          <div className="gradient-hero p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-primary-foreground/80 text-sm">Course Progress</p>
                <p className="text-3xl font-bold text-primary-foreground">{courseProgress}%</p>
              </div>
              <div className="text-right text-primary-foreground/80 text-sm">
                <p>{completedTracks} / {totalTracks}</p>
                <p>Units Complete</p>
              </div>
            </div>
            <Progress value={courseProgress} className="h-2 bg-primary-foreground/20" />
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <StatCard
            icon={<Calendar className="w-5 h-5" />}
            label="Upcoming Exams"
            value={upcomingExams.length}
            variant="primary"
          />
          <StatCard
            icon={<FileText className="w-5 h-5" />}
            label="Pending Tasks"
            value={pendingAssignments.length}
            variant="accent"
          />
          <StatCard
            icon={<BookOpen className="w-5 h-5" />}
            label="Active Tracks"
            value={totalTracks}
          />
          <StatCard
            icon={<AlertCircle className="w-5 h-5" />}
            label="Total Absences"
            value={`${totalAbsences}h`}
            variant={totalAbsences > 20 ? 'destructive' : 'default'}
          />
        </div>

        {/* Quick Links */}
        <div className="flex gap-2 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <Button 
            onClick={() => navigate('/tracks')} 
            variant="outline" 
            className="flex-1"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Tracks
          </Button>
          <Button 
            onClick={() => navigate('/exams')} 
            variant="outline" 
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            Exams
          </Button>
          <Button 
            onClick={() => navigate('/add')} 
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Upcoming Exams */}
        {upcomingExams.length > 0 && (
          <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Exams
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingExams.map(exam => (
                <div
                  key={exam.id}
                  onClick={() => navigate('/exams')}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-foreground">{exam.exam_title}</p>
                    <p className="text-sm text-muted-foreground capitalize">{exam.exam_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {format(parseISO(exam.exam_date), 'MMM d')}
                    </p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Latest Assignments */}
        {pendingAssignments.length > 0 && (
          <Card className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Pending Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingAssignments.map(assignment => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div>
                    <p className="font-medium text-foreground">{assignment.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Due {format(parseISO(assignment.due_date), 'MMM d')}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={assignment.status === 'in_progress' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {assignment.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {upcomingExams.length === 0 && pendingAssignments.length === 0 && (
          <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Get Started</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Add your first exam, assignment, or track to begin tracking your progress!
              </p>
              <Button onClick={() => navigate('/add')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Data
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
