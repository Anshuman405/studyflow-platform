import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter, LayoutGrid, List, CheckSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import TaskForm from "../components/TaskForm";
import TaskBoard from "../components/TaskBoard";

export default function Tasks() {
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => backend.tasks.list(),
  });

  const createTaskMutation = useMutation({
    mutationFn: backend.tasks.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setShowForm(false);
      toast({
        title: "Success! 🎉",
        description: "Your task has been created successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => backend.tasks.update({ id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Updated! ✨",
        description: "Task has been updated successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to update task:", error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => backend.tasks.deleteTask({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Deleted! 🗑️",
        description: "Task has been removed successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to delete task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const tasks = tasksData?.tasks || [];

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 font-medium">Loading your tasks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
            Task Management
          </h1>
          <p className="text-xl text-slate-600">Organize and track your academic assignments</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 h-12 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add Task
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-slate-100/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Filter className="mr-2 h-5 w-5 text-blue-600" />
            Filters & View Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex gap-2">
              <Button
                variant={viewMode === "board" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("board")}
                className={viewMode === "board" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" : "border-slate-300 hover:bg-slate-50"}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Board
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" : "border-slate-300 hover:bg-slate-50"}
              >
                <List className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="flex gap-2 items-center">
                <span className="text-sm font-semibold text-slate-700">Priority:</span>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-32 border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">🔴 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 items-center">
                <span className="text-sm font-semibold text-slate-700">Status:</span>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36 border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="todo">📋 To Do</SelectItem>
                    <SelectItem value="in_progress">⚡ In Progress</SelectItem>
                    <SelectItem value="completed">✅ Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Display */}
      {viewMode === "board" ? (
        <TaskBoard
          tasks={filteredTasks}
          onUpdateTask={(id, data) => updateTaskMutation.mutate({ id, ...data })}
          onDeleteTask={(id) => deleteTaskMutation.mutate(id)}
        />
      ) : (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              All Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckSquare className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No tasks found</h3>
                <p className="text-slate-500 mb-6">Create your first task to get started with organizing your work</p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="group p-6 border border-slate-200/60 rounded-xl hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-slate-50/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-slate-600 mb-3 leading-relaxed">{task.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge 
                            variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}
                            className="font-semibold"
                          >
                            {task.priority === "high" ? "🔴" : task.priority === "medium" ? "🟡" : "🟢"} {task.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="border-slate-300 text-slate-600">
                            {task.status === "todo" ? "📋" : task.status === "in_progress" ? "⚡" : "✅"} {task.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          {task.subject && (
                            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                              📚 {task.subject}
                            </Badge>
                          )}
                        </div>
                        {task.dueDate && (
                          <p className="text-sm text-slate-500">
                            📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-6">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTaskMutation.mutate({
                            id: task.id,
                            status: task.status === "completed" ? "todo" : "completed"
                          })}
                          className="border-slate-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                        >
                          {task.status === "completed" ? "Reopen" : "Complete"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                          className="border-slate-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          onSubmit={(data) => createTaskMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
          isLoading={createTaskMutation.isPending}
        />
      )}
    </div>
  );
}
