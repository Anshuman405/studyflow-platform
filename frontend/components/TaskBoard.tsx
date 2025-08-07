import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Clock, User } from "lucide-react";
import type { Task, TaskStatus } from "~backend/tasks/types";

interface TaskBoardProps {
  tasks: Task[];
  onUpdateTask: (id: number, data: Partial<Task>) => void;
  onDeleteTask: (id: number) => void;
}

const columns: { status: TaskStatus; title: string; color: string; bgColor: string; icon: string }[] = [
  { status: "todo", title: "To Do", color: "text-slate-700", bgColor: "bg-gradient-to-br from-slate-50 to-slate-100", icon: "📋" },
  { status: "in_progress", title: "In Progress", color: "text-blue-700", bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50", icon: "⚡" },
  { status: "completed", title: "Completed", color: "text-green-700", bgColor: "bg-gradient-to-br from-green-50 to-emerald-50", icon: "✅" },
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
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white";
      case "medium":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
      case "low":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
      default:
        return "bg-gradient-to-r from-slate-500 to-slate-600 text-white";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {columns.map((column) => (
        <div key={column.status} className="space-y-4">
          <Card className={`border-0 shadow-lg ${column.bgColor} border border-slate-200/60`}>
            <CardHeader className="pb-4">
              <CardTitle className={`flex items-center justify-between ${column.color}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{column.icon}</span>
                  <span className="font-bold">{column.title}</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className="bg-white/80 text-slate-700 font-semibold shadow-sm"
                >
                  {getTasksByStatus(column.status).length}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>

          <div
            className="min-h-96 space-y-4"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            {getTasksByStatus(column.status).map((task) => (
              <Card
                key={task.id}
                className="group cursor-move hover:shadow-xl transition-all duration-300 bg-white border-0 shadow-md hover:-translate-y-1"
                draggable
                onDragStart={() => handleDragStart(task)}
              >
                <CardContent className="p-5">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-slate-800 text-base leading-tight group-hover:text-slate-900 transition-colors">
                        {task.title}
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`${getPriorityColor(task.priority)} text-xs font-semibold px-2 py-1`}>
                        {task.priority.toUpperCase()}
                      </Badge>
                      {task.subject && (
                        <Badge variant="outline" className="text-xs border-slate-300 text-slate-600 bg-slate-50">
                          {task.subject}
                        </Badge>
                      )}
                    </div>
                    
                    {task.dueDate && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-8 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200"
                        onClick={() => onUpdateTask(task.id, { 
                          status: task.status === "completed" ? "todo" : "completed" 
                        })}
                      >
                        {task.status === "completed" ? "Reopen" : "Complete"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 px-3 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200"
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
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl opacity-50">{column.icon}</span>
                </div>
                <p className="text-slate-400 font-medium">No tasks here</p>
                <p className="text-xs text-slate-400 mt-1">Drag tasks here to update their status</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
