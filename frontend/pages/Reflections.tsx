import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, Clock, Smile } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ReflectionForm from "../components/ReflectionForm";
import StudyChart from "../components/StudyChart";

export default function Reflections() {
  const [showForm, setShowForm] = useState(false);
  
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: reflectionsData, isLoading } = useQuery({
    queryKey: ["reflections"],
    queryFn: () => backend.reflections.list(),
  });

  const { data: stats } = useQuery({
    queryKey: ["reflections", "stats"],
    queryFn: () => backend.reflections.getStats(),
  });

  const createReflectionMutation = useMutation({
    mutationFn: backend.reflections.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reflections"] });
      queryClient.invalidateQueries({ queryKey: ["reflections", "stats"] });
      setShowForm(false);
      toast({
        title: "Success",
        description: "Reflection saved successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to create reflection:", error);
      toast({
        title: "Error",
        description: "Failed to save reflection",
        variant: "destructive",
      });
    },
  });

  const reflections = reflectionsData?.reflections || [];

  // Get today's reflection
  const today = new Date().toDateString();
  const todayReflection = reflections.find(r => 
    new Date(r.date).toDateString() === today
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading reflections...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reflections & Insights</h1>
          <p className="text-gray-600">Track your study progress and mood patterns</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {todayReflection ? "Update Today's Reflection" : "Add Today's Reflection"}
        </Button>
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
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats?.totalStudyTime || 0) / 60)} hrs
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
            <Smile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageMood ? stats.averageMood.toFixed(1) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Out of 10</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reflections</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reflections.length}</div>
            <p className="text-xs text-muted-foreground">Total entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Study Time Chart */}
      {stats && Object.keys(stats.studyTimeBySubject).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Study Time by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <StudyChart data={stats.studyTimeBySubject} />
          </CardContent>
        </Card>
      )}

      {/* Recent Reflections */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reflections</CardTitle>
        </CardHeader>
        <CardContent>
          {reflections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No reflections yet</p>
              <Button onClick={() => setShowForm(true)}>
                Add your first reflection
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reflections.slice(0, 7).map((reflection) => (
                <div key={reflection.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">
                      {new Date(reflection.date).toLocaleDateString()}
                    </h3>
                    {reflection.mood && (
                      <div className="flex items-center gap-2">
                        <Smile className="h-4 w-4" />
                        <span className="text-sm">{reflection.mood}/10</span>
                      </div>
                    )}
                  </div>
                  
                  {Object.keys(reflection.studyTimeBySubject).length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600 mb-1">Study Time:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(reflection.studyTimeBySubject).map(([subject, time]) => (
                          <span key={subject} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {subject}: {time}min
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {reflection.notes && (
                    <p className="text-sm text-gray-700">{reflection.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reflection Form Modal */}
      {showForm && (
        <ReflectionForm
          existingReflection={todayReflection}
          onSubmit={(data) => createReflectionMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
          isLoading={createReflectionMutation.isPending}
        />
      )}
    </div>
  );
}
