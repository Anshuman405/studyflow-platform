import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { clerkPublishableKey } from "./config";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Notes from "./pages/Notes";
import Materials from "./pages/Materials";
import Reflections from "./pages/Reflections";
import Colleges from "./pages/Colleges";
import StudyGroups from "./pages/StudyGroups";
import DataExport from "./pages/DataExport";
import Sidebar from "./components/Sidebar";
import NotificationCenter from "./components/NotificationCenter";
import { GraduationCap, BookOpen, Sparkles } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Retry on network errors but not on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

function AppInner() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <SignedOut>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                StudyFlow
              </h1>
              <p className="text-xl text-slate-600 mb-2 font-medium">
                Your AI-powered academic companion
              </p>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Organize your studies, track progress, and achieve your academic goals with intelligent insights and beautiful design.
              </p>
              <SignInButton mode="modal">
                <button className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Start Your Journey
                  </span>
                  <div className="absolute inset-0 rounded-xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>
        
        <SignedIn>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 transition-all duration-300">
              <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-8 py-6 sticky top-0 z-40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      StudyFlow
                    </h1>
                  </div>
                  <div className="flex items-center gap-4">
                    <NotificationCenter />
                    <UserButton 
                      afterSignOutUrl="/" 
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
                        }
                      }}
                    />
                  </div>
                </div>
              </header>
              
              <div className="p-8">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/materials" element={<Materials />} />
                  <Route path="/reflections" element={<Reflections />} />
                  <Route path="/colleges" element={<Colleges />} />
                  <Route path="/study-groups" element={<StudyGroups />} />
                  <Route path="/data-export" element={<DataExport />} />
                </Routes>
              </div>
            </main>
          </div>
        </SignedIn>
        
        <Toaster />
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
