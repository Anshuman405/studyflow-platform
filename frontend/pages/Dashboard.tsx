import { useQuery } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Calendar, FileText, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const backend = useBackend();

  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => backend.tasks.list(),
  });

  const { data: events } = useQuery({
    queryKey: ["events"],
    queryFn: () => backend.events.list(),
  });

  const { data: stats } = useQuery({
    queryKey: ["reflections", "stats"],
    queryFn: () => backend.reflections.getStats(),
  });

  const { data: notes } = useQuery({
    queryKey: ["notes"],
    queryFn: () => backend.notes.list(),
  });

  // Calculate upcoming tasks and events
  const upcomingTasks = tasks?.tasks.filter(task => 
    task.status !== "completed" && 
    task.dueDate && 
    new Date(task.dueDate) > new Date()
  ).slice(0, 5) || [];

  const upcomingEvents = events?.events.filter(event => 
    new Date(event.date) > new Date()
  ).slice(0, 5) || [];

  const completedTasksToday = tasks?.tasks.filter(task => 
    task.status === "completed" && 
    task.updatedAt && 
    new Date(task.updatedAt).toDateString() === new Date().toDateString()
  ).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your academic overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.studyStreak || 0} days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed Today</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasksToday}</div>
            <p className="text-xs text-muted-foreground">Great progress!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes?.notes.length || 0}</div>
            <p className="text-xs text-muted-foreground">Knowledge base</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-500">No upcoming tasks</p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-gray-600">
                        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === "high" ? "bg-red-100 text-red-800" :
                      task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.category === "exam" ? "bg-red-100 text-red-800" :
                      event.category === "assignment" ? "bg-blue-100 text-blue-800" :
                      event.category === "study_session" ? "bg-green-100 text-green-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {event.category.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
