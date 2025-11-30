import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTracks, useUpdateTrack, useDeleteTrack, Track, VocabularyItem } from '@/hooks/useTracks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Tracks() {
  const { data: tracks = [], isLoading } = useTracks();
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  return (
    <AppLayout>
      <div className="p-4">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Learning Tracks</h1>
          <p className="text-muted-foreground">Your English language units</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : tracks.length === 0 ? (
          <Card className="animate-slide-up">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">No tracks yet</h3>
              <p className="text-muted-foreground text-sm">
                Add your first learning track to start tracking vocabulary and grammar!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tracks.map((track, index) => (
              <Card
                key={track.id}
                className="animate-slide-up cursor-pointer hover:shadow-card transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setSelectedTrack(track)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{track.unit_name}</h3>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-4 mb-3 text-sm text-muted-foreground">
                    <span>{track.vocabulary.length} words</span>
                    <span>{track.grammar_topics.length} topics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={track.completion_percentage} className="flex-1 h-2" />
                    <span className="text-sm font-medium text-primary">
                      {track.completion_percentage}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <TrackDetailDialog
          track={selectedTrack}
          onClose={() => setSelectedTrack(null)}
        />
      </div>
    </AppLayout>
  );
}

function TrackDetailDialog({ track, onClose }: { track: Track | null; onClose: () => void }) {
  const updateTrack = useUpdateTrack();
  const deleteTrack = useDeleteTrack();

  if (!track) return null;

  const toggleVocabulary = async (index: number) => {
    const newVocabulary = [...track.vocabulary];
    newVocabulary[index] = { ...newVocabulary[index], learned: !newVocabulary[index].learned };
    
    const learnedCount = newVocabulary.filter(v => v.learned).length;
    const totalItems = newVocabulary.length + track.grammar_topics.length;
    const newCompletion = totalItems > 0 ? Math.round((learnedCount / totalItems) * 100) : 0;
    
    await updateTrack.mutateAsync({
      id: track.id,
      vocabulary: newVocabulary,
      completion_percentage: newCompletion,
    });
  };

  const handleDelete = async () => {
    await deleteTrack.mutateAsync(track.id);
    onClose();
  };

  return (
    <Dialog open={!!track} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {track.unit_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm font-medium text-primary">{track.completion_percentage}%</span>
            </div>
            <Progress value={track.completion_percentage} className="h-2" />
          </div>

          {/* Vocabulary */}
          {track.vocabulary.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Vocabulary ({track.vocabulary.length})</h4>
              <div className="space-y-2">
                {track.vocabulary.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      item.learned ? "bg-success/10" : "bg-secondary/50"
                    )}
                  >
                    <Checkbox
                      checked={item.learned}
                      onCheckedChange={() => toggleVocabulary(index)}
                      disabled={updateTrack.isPending}
                    />
                    <div className="flex-1">
                      <p className={cn(
                        "font-medium",
                        item.learned && "line-through text-muted-foreground"
                      )}>
                        {item.word}
                      </p>
                      <p className="text-sm text-muted-foreground">{item.meaning}</p>
                    </div>
                    {item.learned && (
                      <Badge variant="outline" className="text-success border-success">
                        Learned
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grammar Topics */}
          {track.grammar_topics.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Grammar Topics ({track.grammar_topics.length})</h4>
              <div className="flex flex-wrap gap-2">
                {track.grammar_topics.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Delete Button */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
            disabled={deleteTrack.isPending}
          >
            {deleteTrack.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete Track
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
