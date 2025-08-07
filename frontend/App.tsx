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
import Sidebar from "./components/Sidebar";

const queryClient = new QueryClient();

function AppInner() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <SignedOut>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">StudyFlow</h1>
              <p className="text-gray-600 mb-8">Your AI-powered academic life management platform</p>
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Sign In to Get Started
                </button>
              </SignInButton>
            </div>
          </div>
        </SignedOut>
        
        <SignedIn>
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64">
              <header className="bg-white shadow-sm border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold text-gray-900">StudyFlow</h1>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </header>
              
              <div className="p-6">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/materials" element={<Materials />} />
                  <Route path="/reflections" element={<Reflections />} />
                  <Route path="/colleges" element={<Colleges />} />
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
