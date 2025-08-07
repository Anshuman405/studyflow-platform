import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Minus } from "lucide-react";
import type { CreateReflectionRequest, Reflection } from "~backend/reflections/types";

interface ReflectionFormProps {
  existingReflection?: Reflection;
  onSubmit: (data: CreateReflectionRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function ReflectionForm({ existingReflection, onSubmit, onCancel, isLoading }: ReflectionFormProps) {
  const [formData, setFormData] = useState<CreateReflectionRequest>({
    date: existingReflection?.date || new Date(),
    studyTimeBySubject: existingReflection?.studyTimeBySubject || {},
    mood: existingReflection?.mood,
    notes: existingReflection?.notes || "",
  });

  const [newSubject, setNewSubject] = useState("");
  const [newTime, setNewTime] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addSubjectTime = () => {
    if (newSubject.trim() && newTime) {
      setFormData({
        ...formData,
        studyTimeBySubject: {
          ...formData.studyTimeBySubject,
          [newSubject.trim()]: parseInt(newTime)
        }
      });
      setNewSubject("");
      setNewTime("");
    }
  };

  const removeSubject = (subject: string) => {
    const updated = { ...formData.studyTimeBySubject };
    delete updated[subject];
    setFormData({
      ...formData,
      studyTimeBySubject: updated
    });
  };

  const updateSubjectTime = (subject: string, time: number) => {
    setFormData({
      ...formData,
      studyTimeBySubject: {
        ...formData.studyTimeBySubject,
        [subject]: time
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {existingReflection ? "Update Reflection" : "Add Daily Reflection"}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date.toISOString().split('T')[0]}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  date: new Date(e.target.value) 
                })}
                required
              />
            </div>

            <div>
              <Label>Study Time by Subject (minutes)</Label>
              <div className="space-y-2">
                {Object.entries(formData.studyTimeBySubject || {}).map(([subject, time]) => (
                  <div key={subject} className="flex items-center gap-2">
                    <Input
                      value={subject}
                      readOnly
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={time}
                      onChange={(e) => updateSubjectTime(subject, parseInt(e.target.value) || 0)}
                      className="w-24"
                      min="0"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSubject(subject)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Subject name"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Minutes"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-24"
                    min="0"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSubjectTime}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="mood">Mood (1-10 scale)</Label>
              <Input
                id="mood"
                type="number"
                min="1"
                max="10"
                value={formData.mood || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  mood: e.target.value ? parseInt(e.target.value) : undefined 
                })}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                placeholder="How did your study session go? Any insights or challenges?"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : "Save Reflection"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
