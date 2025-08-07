import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  FileText, 
  BookOpen, 
  BarChart3, 
  GraduationCap,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-blue-600" },
  { name: "Tasks", href: "/tasks", icon: CheckSquare, color: "text-green-600" },
  { name: "Calendar", href: "/calendar", icon: Calendar, color: "text-purple-600" },
  { name: "Notes", href: "/notes", icon: FileText, color: "text-yellow-600" },
  { name: "Materials", href: "/materials", icon: BookOpen, color: "text-indigo-600" },
  { name: "Reflections", href: "/reflections", icon: BarChart3, color: "text-pink-600" },
  { name: "Colleges", href: "/colleges", icon: GraduationCap, color: "text-orange-600" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white/95 backdrop-blur-sm shadow-xl border-r border-slate-200/60 z-50">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                StudyFlow
              </h2>
              <p className="text-xs text-slate-500 font-medium">Academic Excellence</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md border border-blue-200/50"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-r-full"></div>
                )}
                <item.icon className={cn(
                  "mr-3 h-5 w-5 transition-colors duration-200",
                  isActive ? item.color : "text-slate-400 group-hover:text-slate-600"
                )} />
                <span className="font-semibold">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/60">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Pro Tip</span>
            </div>
            <p className="text-xs text-blue-700 leading-relaxed">
              Use keyboard shortcuts to navigate faster and boost your productivity!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
