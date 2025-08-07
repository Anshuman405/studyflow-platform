import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { useOptimizedQuery } from "../hooks/useOptimizedQuery";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calculator, TrendingUp, GraduationCap, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import CollegeForm from "../components/CollegeForm";
import AdmissionCalculator from "../components/AdmissionCalculator";
import ErrorBoundary from "../components/ErrorBoundary";
import EmptyState from "../components/EmptyState";

export default function Colleges() {
  const [showForm, setShowForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: searchResults, isLoading: isSearching } = useOptimizedQuery({
    queryKey: ["colleges", "search", searchQuery],
    queryFn: () => backend.colleges.search({ query: searchQuery, limit: 20 }),
    enabled: searchQuery.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes cache for search results
  });

  const createCollegeMutation = useMutation({
    mutationFn: backend.colleges.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      setShowForm(false);
      toast({
        title: "Success! 🎓",
        description: "College added successfully to the database",
      });
    },
    onError: (error) => {
      console.error("Failed to create college:", error);
      toast({
        title: "Error",
        description: "Failed to add college. Please try again.",
        variant: "destructive",
      });
    },
  });

  const colleges = searchResults?.colleges || [];

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
              College Application Assistant
            </h1>
            <p className="text-xl text-slate-600">Research colleges and calculate your admission chances</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowCalculator(true)}
              className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold"
            >
              <Calculator className="mr-2 h-4 w-4" />
              Admission Calculator
            </Button>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add College
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-slate-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Search className="mr-2 h-4 w-4 text-blue-600" />
              Search Colleges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search for colleges by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchQuery && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Search Results</span>
                {searchResults?.pagination && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {searchResults.pagination.total} colleges found
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isSearching ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="border border-slate-200">
                      <CardHeader className="pb-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Skeleton className="h-4 w-full mb-1" />
                              <Skeleton className="h-5 w-2/3" />
                            </div>
                            <div>
                              <Skeleton className="h-4 w-full mb-1" />
                              <Skeleton className="h-5 w-2/3" />
                            </div>
                          </div>
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : colleges.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <GraduationCap className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">No colleges found</h3>
                  <p className="text-slate-500 mb-6">No colleges found for "{searchQuery}"</p>
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add "{searchQuery}" to database
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {colleges.map((college) => (
                    <Card key={college.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg group-hover:text-blue-700 transition-colors">
                          {college.name}
                        </CardTitle>
                        {college.location && (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <MapPin className="w-4 h-4" />
                            {college.location}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {college.acceptanceRate && (
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <p className="text-blue-600 font-medium text-xs">Acceptance Rate</p>
                                <p className="font-semibold text-blue-800">{college.acceptanceRate}%</p>
                              </div>
                            )}
                            {college.avgGpa && (
                              <div className="p-2 bg-green-50 rounded-lg">
                                <p className="text-green-600 font-medium text-xs">Avg GPA</p>
                                <p className="font-semibold text-green-800">{college.avgGpa}</p>
                              </div>
                            )}
                            {college.avgSat && (
                              <div className="p-2 bg-purple-50 rounded-lg">
                                <p className="text-purple-600 font-medium text-xs">Avg SAT</p>
                                <p className="font-semibold text-purple-800">{college.avgSat}</p>
                              </div>
                            )}
                            {college.avgAct && (
                              <div className="p-2 bg-orange-50 rounded-lg">
                                <p className="text-orange-600 font-medium text-xs">Avg ACT</p>
                                <p className="font-semibold text-orange-800">{college.avgAct}</p>
                              </div>
                            )}
                          </div>
                          
                          <Button 
                            size="sm" 
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
                            onClick={() => setShowCalculator(true)}
                          >
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Calculate Admission Chance
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Getting Started */}
        {!searchQuery && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-slate-800">Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <Search className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-3 text-blue-900">Search Colleges</h3>
                  <p className="text-sm text-blue-700 mb-4 leading-relaxed">
                    Use the search bar above to find colleges and universities. 
                    View their admission statistics and requirements.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.querySelector('input')?.focus()}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    Start Searching
                  </Button>
                </div>
                
                <div className="p-6 border-2 border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-3 text-green-900">Admission Calculator</h3>
                  <p className="text-sm text-green-700 mb-4 leading-relaxed">
                    Calculate your admission chances based on your GPA, test scores, 
                    and extracurricular activities.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCalculator(true)}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    Try Calculator
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* College Form Modal */}
        {showForm && (
          <CollegeForm
            initialName={searchQuery}
            onSubmit={(data) => createCollegeMutation.mutate(data)}
            onCancel={() => setShowForm(false)}
            isLoading={createCollegeMutation.isPending}
          />
        )}

        {/* Admission Calculator Modal */}
        {showCalculator && (
          <AdmissionCalculator
            colleges={colleges}
            onClose={() => setShowCalculator(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
