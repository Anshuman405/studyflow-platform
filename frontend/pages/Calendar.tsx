import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import EventForm from "../components/EventForm";
import CalendarView from "../components/CalendarView";

export default function Calendar() {
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => backend.events.list(),
  });

  const { data: tasksData } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => backend.tasks.list(),
  });

  const createEventMutation = useMutation({
    mutationFn: backend.events.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setShowForm(false);
      setSelectedDate(null);
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to create event:", error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => backend.events.update({ id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to update event:", error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: number) => backend.events.deleteEvent({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to delete event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const events = eventsData?.events || [];
  const tasks = tasksData?.tasks || [];

  // Combine events and tasks for calendar display
  const calendarItems = [
    ...events.map(event => ({
      id: `event-${event.id}`,
      title: event.title,
      date: new Date(event.date),
      type: "event" as const,
      category: event.category,
      data: event,
    })),
    ...tasks
      .filter(task => task.dueDate)
      .map(task => ({
        id: `task-${task.id}`,
        title: task.title,
        date: new Date(task.dueDate!),
        type: "task" as const,
        priority: task.priority,
        status: task.status,
        data: task,
      })),
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading calendar...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">View and manage your academic schedule</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      {/* Calendar Component */}
      <CalendarView
        items={calendarItems}
        onDateSelect={setSelectedDate}
        onEventUpdate={(id, data) => {
          if (id.startsWith("event-")) {
            const eventId = parseInt(id.replace("event-", ""));
            updateEventMutation.mutate({ id: eventId, ...data });
          }
        }}
        onEventDelete={(id) => {
          if (id.startsWith("event-")) {
            const eventId = parseInt(id.replace("event-", ""));
            deleteEventMutation.mutate(eventId);
          }
        }}
      />

      {/* Upcoming Events Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.filter(event => new Date(event.date) > new Date()).slice(0, 5).length === 0 ? (
            <p className="text-gray-500">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {events
                .filter(event => new Date(event.date) > new Date())
                .slice(0, 5)
                .map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}
                      </p>
                      {event.location && (
                        <p className="text-sm text-gray-500">📍 {event.location}</p>
                      )}
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

      {/* Event Form Modal */}
      {showForm && (
        <EventForm
          initialDate={selectedDate}
          onSubmit={(data) => createEventMutation.mutate(data)}
          onCancel={() => {
            setShowForm(false);
            setSelectedDate(null);
          }}
          isLoading={createEventMutation.isPending}
        />
      )}
    </div>
  );
}
