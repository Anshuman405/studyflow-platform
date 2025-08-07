import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarItem {
  id: string;
  title: string;
  date: Date;
  type: "event" | "task";
  category?: string;
  priority?: string;
  status?: string;
  data: any;
}

interface CalendarViewProps {
  items: CalendarItem[];
  onDateSelect: (date: Date) => void;
  onEventUpdate: (id: string, data: any) => void;
  onEventDelete: (id: string) => void;
}

export default function CalendarView({ items, onDateSelect, onEventUpdate, onEventDelete }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const getItemsForDate = (date: Date) => {
    return items.filter(item => 
      item.date.toDateString() === date.toDateString()
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const getItemColor = (item: CalendarItem) => {
    if (item.type === "event") {
      switch (item.category) {
        case "exam": return "bg-red-100 text-red-800";
        case "assignment": return "bg-blue-100 text-blue-800";
        case "study_session": return "bg-green-100 text-green-800";
        case "lab": return "bg-purple-100 text-purple-800";
        default: return "bg-gray-100 text-gray-800";
      }
    } else {
      switch (item.priority) {
        case "high": return "bg-red-100 text-red-800";
        case "medium": return "bg-yellow-100 text-yellow-800";
        case "low": return "bg-green-100 text-green-800";
        default: return "bg-gray-100 text-gray-800";
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <Button
                variant={view === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("month")}
              >
                Month
              </Button>
              <Button
                variant={view === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("week")}
              >
                Week
              </Button>
              <Button
                variant={view === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("day")}
              >
                Day
              </Button>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === "month" && (
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((date, index) => (
              <div
                key={index}
                className={`min-h-24 p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  date && isToday(date) ? "bg-blue-50 border-blue-200" : ""
                }`}
                onClick={() => date && onDateSelect(date)}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isToday(date) ? "text-blue-600" : "text-gray-900"
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {getItemsForDate(date).slice(0, 2).map(item => (
                        <div
                          key={item.id}
                          className={`text-xs p-1 rounded truncate ${getItemColor(item)}`}
                          title={item.title}
                        >
                          {item.title}
                        </div>
                      ))}
                      {getItemsForDate(date).length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{getItemsForDate(date).length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
