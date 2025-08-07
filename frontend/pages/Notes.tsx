import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import NoteForm from "../components/NoteForm";

export default function Notes() {
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notesData, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: () => backend.notes.list(),
  });

  const createNoteMutation = useMutation({
    mutationFn: backend.notes.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setShowForm(false);
      toast({
        title: "Success",
        description: "Note created successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to create note:", error);
      toast({
        title: "Error",
        description: "Failed to create note",
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => backend.notes.update({ id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setEditingNote(null);
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to update note:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: number) => backend.notes.deleteNote({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to delete note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    },
  });

  const notes = notesData?.notes || [];

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === "" || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag === "" || note.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading notes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-600">Organize your study notes and ideas</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-4 w-4" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search notes by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">Tag:</span>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No notes found</p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              Create your first note
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card 
              key={note.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              style={{ borderLeft: `4px solid ${note.color}` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingNote(note)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNoteMutation.mutate(note.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {note.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                  </p>
                  
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400">
                    Updated {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Note Form Modal */}
      {(showForm || editingNote) && (
        <NoteForm
          note={editingNote}
          onSubmit={(data) => {
            if (editingNote) {
              updateNoteMutation.mutate({ id: editingNote.id, ...data });
            } else {
              createNoteMutation.mutate(data);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingNote(null);
          }}
          isLoading={editingNote ? updateNoteMutation.isPending : createNoteMutation.isPending}
        />
      )}
    </div>
  );
}
