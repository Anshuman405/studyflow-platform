export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "completed";

export interface Task {
  id: number;
  title: string;
  description?: string;
  subject?: string;
  startDate?: Date;
  dueDate?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  subject?: string;
  startDate?: Date;
  dueDate?: Date;
  priority: TaskPriority;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  subject?: string;
  startDate?: Date;
  dueDate?: Date;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface ListTasksResponse {
  tasks: Task[];
}
