import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";

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
        case "exam": return "bg-gradient-to-r from-red-500 to-pink-500 text-white";
        case "assignment": return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white";
        case "study_session": return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
        case "lab": return "bg-gradient-to-r from-purple-500 to-violet-500 text-white";
        default: return "bg-gradient-to-r from-slate-500 to-slate-600 text-white";
      }
    } else {
      switch (item.priority) {
        case "high": return "bg-gradient-to-r from-red-500 to-pink-500 text-white";
        case "medium": return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
        case "low": return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
        default: return "bg-gradient-to-r from-slate-500 to-slate-600 text-white";
      }
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">
                {monthNames[month]} {year}
              </h3>
              <p className="text-sm text-slate-600 font-medium">Academic Calendar</p>
            </div>
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <Button
                variant={view === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("month")}
                className={view === "month" ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md" : "border-slate-300 hover:bg-slate-50"}
              >
                Month
              </Button>
              <Button
                variant={view === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("week")}
                className={view === "week" ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md" : "border-slate-300 hover:bg-slate-50"}
              >
                Week
              </Button>
              <Button
                variant={view === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("day")}
                className={view === "day" ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md" : "border-slate-300 hover:bg-slate-50"}
              >
                Day
              </Button>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth("prev")}
                className="border-slate-300 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateMonth("next")}
                className="border-slate-300 hover:bg-slate-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {view === "month" && (
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
              <div key={day} className="p-4 text-center font-semibold text-slate-600 text-sm bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg mb-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((date, index) => (
              <div
                key={index}
                className={`min-h-32 p-2 border border-slate-200/60 rounded-lg cursor-pointer hover:bg-slate-50 transition-all duration-200 ${
                  date && isToday(date) ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md" : "bg-white hover:shadow-sm"
                }`}
                onClick={() => date && onDateSelect(date)}
              >
                {date && (
                  <>
                    <div className={`text-sm font-semibold mb-2 ${
                      isToday(date) ? "text-blue-700" : "text-slate-700"
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {getItemsForDate(date).slice(0, 2).map(item => (
                        <div
                          key={item.id}
                          className={`text-xs p-1.5 rounded-md truncate font-medium shadow-sm ${getItemColor(item)}`}
                          title={item.title}
                        >
                          <div className="flex items-center gap-1">
                            {item.type === "event" ? (
                              <CalendarIcon className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            <span className="truncate">{item.title}</span>
                          </div>
                        </div>
                      ))}
                      {getItemsForDate(date).length > 2 && (
                        <div className="text-xs text-slate-500 font-medium bg-slate-100 rounded-md p-1 text-center">
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
