import { useQuery } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { useOptimizedQuery } from "../hooks/useOptimizedQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Calendar, FileText, TrendingUp, Clock, Target, Zap, ArrowRight, Plus, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBoundary from "../components/ErrorBoundary";
import AiInsightsPanel from "../components/AiInsightsPanel";
import TomatoTimer from "../components/TomatoTimer";

export default function Dashboard() {
  const backend = useBackend();

  const { data: tasks, isLoading: tasksLoading } = useOptimizedQuery({
    queryKey: ["tasks"],
    queryFn: () => backend.tasks.list(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const { data: events, isLoading: eventsLoading } = useOptimizedQuery({
    queryKey: ["events"],
    queryFn: () => backend.events.list(),
    staleTime: 2 * 60 * 1000,
  });

  const { data: stats, isLoading: statsLoading } = useOptimizedQuery({
    queryKey: ["reflections", "stats"],
    queryFn: () => backend.reflections.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: notes, isLoading: notesLoading } = useOptimizedQuery({
    queryKey: ["notes"],
    queryFn: () => backend.notes.list(),
    staleTime: 5 * 60 * 1000,
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

  const isLoading = tasksLoading || eventsLoading || statsLoading || notesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
            Welcome back! 👋
          </h1>
          <p className="text-xl text-slate-600">Here's your academic overview for today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/5"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <CardTitle className="text-sm font-semibold text-slate-700">Study Streak</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-slate-800 mb-1">{stats?.studyStreak || 0}</div>
              <p className="text-sm text-slate-600 font-medium">days strong! 🔥</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-emerald-600/5"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <CardTitle className="text-sm font-semibold text-slate-700">Today's Progress</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckSquare className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-slate-800 mb-1">{completedTasksToday}</div>
              <p className="text-sm text-slate-600 font-medium">tasks completed ✨</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-violet-600/5"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <CardTitle className="text-sm font-semibold text-slate-700">Upcoming Events</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-slate-800 mb-1">{upcomingEvents.length}</div>
              <p className="text-sm text-slate-600 font-medium">this week 📅</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200/50">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/5 to-orange-600/5"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative">
              <CardTitle className="text-sm font-semibold text-slate-700">Knowledge Base</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-slate-800 mb-1">{notes?.notes.length || 0}</div>
              <p className="text-sm text-slate-600 font-medium">notes created 📝</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights and Timer Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AiInsightsPanel type="weekly" />
          <TomatoTimer />
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-slate-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Zap className="w-5 h-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/tasks">
                <Button variant="outline" className="w-full h-16 flex flex-col gap-2 border-2 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200">
                  <Plus className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Add Task</span>
                </Button>
              </Link>
              <Link to="/calendar">
                <Button variant="outline" className="w-full h-16 flex flex-col gap-2 border-2 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Schedule Event</span>
                </Button>
              </Link>
              <Link to="/notes">
                <Button variant="outline" className="w-full h-16 flex flex-col gap-2 border-2 hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200">
                  <FileText className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium">Take Notes</span>
                </Button>
              </Link>
              <Link to="/reflections">
                <Button variant="outline" className="w-full h-16 flex flex-col gap-2 border-2 hover:border-pink-300 hover:bg-pink-50 transition-all duration-200">
                  <Target className="w-5 h-5 text-pink-600" />
                  <span className="text-sm font-medium">Reflect</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Tasks */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <CheckSquare className="w-5 h-5 text-green-600" />
                Upcoming Tasks
              </CardTitle>
              <Link to="/tasks">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                  View all <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-slate-500 mb-4 font-medium">No upcoming tasks</p>
                  <Link to="/tasks">
                    <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                      Create your first task
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="group p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/60 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-slate-900 transition-colors">
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                            <Clock className="w-4 h-4" />
                            <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
                          </div>
                          {task.subject && (
                            <Badge variant="secondary" className="text-xs">
                              {task.subject}
                            </Badge>
                          )}
                        </div>
                        <Badge 
                          variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}
                          className="ml-4"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Calendar className="w-5 h-5 text-purple-600" />
                Upcoming Events
              </CardTitle>
              <Link to="/calendar">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800">
                  View all <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-slate-500 mb-4 font-medium">No upcoming events</p>
                  <Link to="/calendar">
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
                      Schedule an event
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="group p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/60 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-slate-900 transition-colors">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {event.location && (
                            <p className="text-sm text-slate-500">📍 {event.location}</p>
                          )}
                        </div>
                        <Badge 
                          variant="outline"
                          className={
                            event.category === "exam" ? "border-red-200 text-red-700 bg-red-50" :
                            event.category === "assignment" ? "border-blue-200 text-blue-700 bg-blue-50" :
                            event.category === "study_session" ? "border-green-200 text-green-700 bg-green-50" :
                            "border-slate-200 text-slate-700 bg-slate-50"
                          }
                        >
                          {event.category.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}
