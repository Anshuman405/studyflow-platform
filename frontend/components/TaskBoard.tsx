import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import type { Task, TaskStatus } from "~backend/tasks/types";

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (id: number, data: Partial<Task>) => void;
  onDeleteTask: (id: number) => void;
}

const columns: { status: TaskStatus; title: string; color: string }[] = [
  { status: "todo", title: "To Do", color: "bg-gray-100" },
  { status: "in_progress", title: "In Progress", color: "bg-blue-100" },
  { status: "completed", title: "Completed", color: "bg-green-100" },
];

export default function TaskBoard({ tasks, onUpdateTask, onDeleteTask }: TaskBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      onUpdateTask(draggedTask.id, { status });
    }
    setDraggedTask(null);
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <Card key={column.status} className={column.color}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {column.title}
              <Badge variant="secondary">
                {getTasksByStatus(column.status).length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent
            className="min-h-96 space-y-3"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            {getTasksByStatus(column.status).map((task) => (
              <Card
                key={task.id}
                className="cursor-move hover:shadow-md transition-shadow bg-white"
                draggable
                onDragStart={() => handleDragStart(task)}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-sm">{task.title}</h3>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      <Badge className={getPriorityColor(task.priority)} variant="secondary">
                        {task.priority}
                      </Badge>
                      {task.subject && (
                        <Badge variant="outline" className="text-xs">
                          {task.subject}
                        </Badge>
                      )}
                    </div>
                    
                    {task.dueDate && (
                      <p className="text-xs text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    
                    <div className="flex gap-1 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-6"
                        onClick={() => onUpdateTask(task.id, { 
                          status: task.status === "completed" ? "todo" : "completed" 
                        })}
                      >
                        {task.status === "completed" ? "Reopen" : "Complete"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs h-6"
                        onClick={() => onDeleteTask(task.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {getTasksByStatus(column.status).length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No tasks</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
