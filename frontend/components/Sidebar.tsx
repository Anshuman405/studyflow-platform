import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  FileText, 
  BookOpen, 
  BarChart3, 
  GraduationCap 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Notes", href: "/notes", icon: FileText },
  { name: "Materials", href: "/materials", icon: BookOpen },
  { name: "Reflections", href: "/reflections", icon: BarChart3 },
  { name: "Colleges", href: "/colleges", icon: GraduationCap },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900">StudyFlow</h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
