import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Calendar, Flag } from "lucide-react";
import type { CreateTaskRequest, TaskPriority } from "~backend/tasks/types";

interface TaskFormProps {
  onSubmit: (data: CreateTaskRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function TaskForm({ onSubmit, onCancel, isLoading }: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: "",
    description: "",
    subject: "",
    startDate: undefined,
    dueDate: undefined,
    priority: "medium",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const priorityOptions = [
    { value: "low", label: "Low Priority", color: "text-green-600", icon: "🟢" },
    { value: "medium", label: "Medium Priority", color: "text-yellow-600", icon: "🟡" },
    { value: "high", label: "High Priority", color: "text-red-600", icon: "🔴" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-slate-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-800">Create New Task</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel} className="hover:bg-slate-200/60">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-slate-700">
                Task Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a descriptive task title..."
                className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add more details about this task..."
                rows={4}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-semibold text-slate-700">
                  Subject/Course
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Mathematics, History..."
                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Priority Level
                </Label>
                <Select value={formData.priority} onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          <span className={option.color}>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate ? new Date(formData.startDate.getTime() - formData.startDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    startDate: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate ? new Date(formData.dueDate.getTime() - formData.dueDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    dueDate: e.target.value ? new Date(e.target.value) : undefined 
                  })}
                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-200/60">
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Task
                  </div>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="px-8 h-12 border-slate-300 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
