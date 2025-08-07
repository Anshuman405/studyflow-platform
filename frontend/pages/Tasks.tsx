import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter } from "lucide-react";
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
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => backend.tasks.update({ id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to update task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => backend.tasks.deleteTask({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to delete task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
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
    return <div className="flex items-center justify-center h-64">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage your academic tasks and assignments</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters & View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <Button
                variant={viewMode === "board" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("board")}
              >
                Board
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
            </div>
            
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">Priority:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
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
        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tasks found</p>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Badge variant={
                          task.priority === "high" ? "destructive" :
                          task.priority === "medium" ? "default" : "secondary"
                        }>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline">
                          {task.status.replace("_", " ")}
                        </Badge>
                        {task.subject && (
                          <Badge variant="outline">{task.subject}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTaskMutation.mutate({
                          id: task.id,
                          status: task.status === "completed" ? "todo" : "completed"
                        })}
                      >
                        {task.status === "completed" ? "Reopen" : "Complete"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteTaskMutation.mutate(task.id)}
                      >
                        Delete
                      </Button>
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
