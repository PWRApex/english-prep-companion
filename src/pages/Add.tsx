import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateExam } from '@/hooks/useExams';
import { useCreateAssignment } from '@/hooks/useAssignments';
import { useCreateAttendance } from '@/hooks/useAttendance';
import { useCreateTrack } from '@/hooks/useTracks';
import { Calendar, FileText, Clock, BookOpen, Loader2, Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Add() {
  const [activeTab, setActiveTab] = useState('exam');
  
  return (
    <AppLayout>
      <div className="p-4">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Add Data</h1>
          <p className="text-muted-foreground">Record your academic progress</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="exam" className="text-xs px-2">
              <Calendar className="w-4 h-4 mr-1 hidden sm:block" />
              Exam
            </TabsTrigger>
            <TabsTrigger value="assignment" className="text-xs px-2">
              <FileText className="w-4 h-4 mr-1 hidden sm:block" />
              Task
            </TabsTrigger>
            <TabsTrigger value="attendance" className="text-xs px-2">
              <Clock className="w-4 h-4 mr-1 hidden sm:block" />
              Attend
            </TabsTrigger>
            <TabsTrigger value="track" className="text-xs px-2">
              <BookOpen className="w-4 h-4 mr-1 hidden sm:block" />
              Track
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exam">
            <ExamForm />
          </TabsContent>
          <TabsContent value="assignment">
            <AssignmentForm />
          </TabsContent>
          <TabsContent value="attendance">
            <AttendanceForm />
          </TabsContent>
          <TabsContent value="track">
            <TrackForm />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function ExamForm() {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'quiz' | 'midterm' | 'final' | 'speaking'>('quiz');
  const [date, setDate] = useState('');
  const [grade, setGrade] = useState('');
  const [notes, setNotes] = useState('');
  const createExam = useCreateExam();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    
    await createExam.mutateAsync({
      exam_title: title.trim(),
      exam_type: type,
      exam_date: date,
      grade: grade ? parseFloat(grade) : null,
      notes: notes.trim() || null,
    });
    
    setTitle('');
    setDate('');
    setGrade('');
    setNotes('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Add Exam
        </CardTitle>
        <CardDescription>Record a quiz, midterm, final, or speaking exam</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exam-title">Exam Title *</Label>
            <Input
              id="exam-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Unit 3 Quiz"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam-type">Type *</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="midterm">Midterm</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                  <SelectItem value="speaking">Speaking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-date">Date *</Label>
              <Input
                id="exam-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-grade">Grade (0-100)</Label>
            <Input
              id="exam-grade"
              type="number"
              min="0"
              max="100"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Leave empty if not graded yet"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-notes">Notes</Label>
            <Textarea
              id="exam-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={createExam.isPending}>
            {createExam.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add Exam
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AssignmentForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const createAssignment = useCreateAssignment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    
    await createAssignment.mutateAsync({
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate,
      status,
    });
    
    setTitle('');
    setDescription('');
    setDueDate('');
    setStatus('pending');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent" />
          Add Assignment
        </CardTitle>
        <CardDescription>Track homework and tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assignment-title">Title *</Label>
            <Input
              id="assignment-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Essay on Climate Change"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignment-desc">Description</Label>
            <Textarea
              id="assignment-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about the assignment..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignment-date">Due Date *</Label>
              <Input
                id="assignment-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignment-status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={createAssignment.isPending}>
            {createAssignment.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add Assignment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AttendanceForm() {
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('1');
  const [status, setStatus] = useState<'present' | 'absent'>('present');
  const createAttendance = useCreateAttendance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !hours) {
      toast({ title: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    
    await createAttendance.mutateAsync({
      date,
      hours: parseInt(hours),
      status,
    });
    
    setDate('');
    setHours('1');
    setStatus('present');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-warning" />
          Add Attendance
        </CardTitle>
        <CardDescription>Record your class attendance</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="attendance-date">Date *</Label>
            <Input
              id="attendance-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="attendance-hours">Hours *</Label>
              <Input
                id="attendance-hours"
                type="number"
                min="1"
                max="12"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance-status">Status *</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={createAttendance.isPending}>
            {createAttendance.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Record Attendance
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function TrackForm() {
  const [unitName, setUnitName] = useState('');
  const [vocabulary, setVocabulary] = useState<{ word: string; meaning: string }[]>([]);
  const [grammarTopics, setGrammarTopics] = useState<string[]>([]);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newGrammar, setNewGrammar] = useState('');
  const createTrack = useCreateTrack();

  const addVocabulary = () => {
    if (newWord.trim() && newMeaning.trim()) {
      setVocabulary([...vocabulary, { word: newWord.trim(), meaning: newMeaning.trim() }]);
      setNewWord('');
      setNewMeaning('');
    }
  };

  const addGrammar = () => {
    if (newGrammar.trim()) {
      setGrammarTopics([...grammarTopics, newGrammar.trim()]);
      setNewGrammar('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) {
      toast({ title: 'Please enter a unit name', variant: 'destructive' });
      return;
    }
    
    await createTrack.mutateAsync({
      unit_name: unitName.trim(),
      vocabulary: vocabulary.map(v => ({ ...v, learned: false })),
      grammar_topics: grammarTopics,
      completion_percentage: 0,
    });
    
    setUnitName('');
    setVocabulary([]);
    setGrammarTopics([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-success" />
          Add Track
        </CardTitle>
        <CardDescription>Create a new learning unit</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="track-name">Unit Name *</Label>
            <Input
              id="track-name"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              placeholder="e.g., Unit 5 - Past Tense"
              required
            />
          </div>
          
          {/* Vocabulary Section */}
          <div className="space-y-2">
            <Label>Vocabulary</Label>
            <div className="flex gap-2">
              <Input
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                placeholder="Word"
                className="flex-1"
              />
              <Input
                value={newMeaning}
                onChange={(e) => setNewMeaning(e.target.value)}
                placeholder="Meaning"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={addVocabulary}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {vocabulary.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {vocabulary.map((v, i) => (
                  <div key={i} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm">
                    <span className="font-medium">{v.word}</span>
                    <span className="text-muted-foreground">- {v.meaning}</span>
                    <button
                      type="button"
                      onClick={() => setVocabulary(vocabulary.filter((_, idx) => idx !== i))}
                      className="ml-1 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grammar Section */}
          <div className="space-y-2">
            <Label>Grammar Topics</Label>
            <div className="flex gap-2">
              <Input
                value={newGrammar}
                onChange={(e) => setNewGrammar(e.target.value)}
                placeholder="e.g., Past Simple"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={addGrammar}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {grammarTopics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {grammarTopics.map((topic, i) => (
                  <div key={i} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm">
                    {topic}
                    <button
                      type="button"
                      onClick={() => setGrammarTopics(grammarTopics.filter((_, idx) => idx !== i))}
                      className="ml-1 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={createTrack.isPending}>
            {createTrack.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add Track
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
