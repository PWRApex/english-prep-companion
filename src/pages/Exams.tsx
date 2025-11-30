import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useExams, useDeleteExam, Exam } from '@/hooks/useExams';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Trash2, Loader2, TrendingUp, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const examTypeColors = {
  quiz: 'bg-primary/10 text-primary border-primary/20',
  midterm: 'bg-accent/10 text-accent border-accent/20',
  final: 'bg-destructive/10 text-destructive border-destructive/20',
  speaking: 'bg-warning/10 text-warning border-warning/20',
};

export default function Exams() {
  const { data: exams = [], isLoading } = useExams();
  const [filter, setFilter] = useState<string>('all');
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const filteredExams = useMemo(() => {
    if (filter === 'all') return exams;
    return exams.filter(e => e.exam_type === filter);
  }, [exams, filter]);

  const averageScore = useMemo(() => {
    const gradedExams = exams.filter(e => e.grade !== null);
    if (gradedExams.length === 0) return null;
    const sum = gradedExams.reduce((acc, e) => acc + (e.grade || 0), 0);
    return (sum / gradedExams.length).toFixed(1);
  }, [exams]);

  const averageByType = useMemo(() => {
    const types = ['quiz', 'midterm', 'final', 'speaking'] as const;
    return types.map(type => {
      const typeExams = exams.filter(e => e.exam_type === type && e.grade !== null);
      if (typeExams.length === 0) return { type, avg: null, count: 0 };
      const sum = typeExams.reduce((acc, e) => acc + (e.grade || 0), 0);
      return { type, avg: (sum / typeExams.length).toFixed(1), count: typeExams.length };
    });
  }, [exams]);

  return (
    <AppLayout>
      <div className="p-4">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Exams</h1>
          <p className="text-muted-foreground">Your exam results and averages</p>
        </div>

        {/* Average Score Card */}
        {averageScore && (
          <Card className="mb-4 animate-slide-up overflow-hidden">
            <div className="gradient-hero p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-foreground/80 text-sm">Average Score</p>
                  <p className="text-4xl font-bold text-primary-foreground">{averageScore}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-primary-foreground/30" />
              </div>
            </div>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {averageByType.map(({ type, avg, count }) => (
                  <div key={type} className="text-center p-2 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground capitalize">{type}</p>
                    <p className="font-bold text-foreground">{avg || '-'}</p>
                    <p className="text-xs text-muted-foreground">{count} exams</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2 mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="quiz">Quiz</SelectItem>
              <SelectItem value="midterm">Midterm</SelectItem>
              <SelectItem value="final">Final</SelectItem>
              <SelectItem value="speaking">Speaking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredExams.length === 0 ? (
          <Card className="animate-slide-up">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No exams yet</h3>
              <p className="text-muted-foreground text-sm">
                Add your first exam to start tracking your grades!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredExams.map((exam, index) => (
              <Card
                key={exam.id}
                className="animate-slide-up cursor-pointer hover:shadow-card transition-all"
                style={{ animationDelay: `${(index + 2) * 0.05}s` }}
                onClick={() => setSelectedExam(exam)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{exam.exam_title}</h3>
                        <Badge variant="outline" className={cn('capitalize', examTypeColors[exam.exam_type])}>
                          {exam.exam_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(exam.exam_date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      {exam.grade !== null ? (
                        <p className={cn(
                          "text-2xl font-bold",
                          exam.grade >= 70 ? "text-success" : exam.grade >= 50 ? "text-warning" : "text-destructive"
                        )}>
                          {exam.grade}
                        </p>
                      ) : (
                        <Badge variant="secondary">Not graded</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <ExamDetailDialog
          exam={selectedExam}
          onClose={() => setSelectedExam(null)}
        />
      </div>
    </AppLayout>
  );
}

function ExamDetailDialog({ exam, onClose }: { exam: Exam | null; onClose: () => void }) {
  const deleteExam = useDeleteExam();

  if (!exam) return null;

  const handleDelete = async () => {
    await deleteExam.mutateAsync(exam.id);
    onClose();
  };

  return (
    <Dialog open={!!exam} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Exam Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">{exam.exam_title}</h3>
            <Badge variant="outline" className={cn('capitalize mt-2', examTypeColors[exam.exam_type])}>
              {exam.exam_type}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium text-foreground">
                {format(parseISO(exam.exam_date), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">Grade</p>
              <p className={cn(
                "font-bold text-xl",
                exam.grade !== null
                  ? exam.grade >= 70 ? "text-success" : exam.grade >= 50 ? "text-warning" : "text-destructive"
                  : "text-muted-foreground"
              )}>
                {exam.grade !== null ? exam.grade : 'N/A'}
              </p>
            </div>
          </div>

          {exam.notes && (
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-foreground">{exam.notes}</p>
            </div>
          )}

          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
            disabled={deleteExam.isPending}
          >
            {deleteExam.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete Exam
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
