import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calculator, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import CollegeForm from "../components/CollegeForm";
import AdmissionCalculator from "../components/AdmissionCalculator";

export default function Colleges() {
  const [showForm, setShowForm] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["colleges", "search", searchQuery],
    queryFn: () => backend.colleges.search({ query: searchQuery, limit: 20 }),
    enabled: searchQuery.length > 0,
  });

  const createCollegeMutation = useMutation({
    mutationFn: backend.colleges.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      setShowForm(false);
      toast({
        title: "Success",
        description: "College added successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to create college:", error);
      toast({
        title: "Error",
        description: "Failed to add college",
        variant: "destructive",
      });
    },
  });

  const colleges = searchResults?.colleges || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">College Application Assistant</h1>
          <p className="text-gray-600">Research colleges and calculate your admission chances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCalculator(true)}>
            <Calculator className="mr-2 h-4 w-4" />
            Admission Calculator
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add College
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-4 w-4" />
            Search Colleges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search for colleges by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            {isSearching ? (
              <p className="text-gray-500">Searching...</p>
            ) : colleges.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No colleges found for "{searchQuery}"</p>
                <Button onClick={() => setShowForm(true)}>
                  Add "{searchQuery}" to database
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {colleges.map((college) => (
                  <Card key={college.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{college.name}</CardTitle>
                      {college.location && (
                        <p className="text-sm text-gray-600">📍 {college.location}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {college.acceptanceRate && (
                            <div>
                              <p className="text-gray-600">Acceptance Rate</p>
                              <p className="font-medium">{college.acceptanceRate}%</p>
                            </div>
                          )}
                          {college.avgGpa && (
                            <div>
                              <p className="text-gray-600">Avg GPA</p>
                              <p className="font-medium">{college.avgGpa}</p>
                            </div>
                          )}
                          {college.avgSat && (
                            <div>
                              <p className="text-gray-600">Avg SAT</p>
                              <p className="font-medium">{college.avgSat}</p>
                            </div>
                          )}
                          {college.avgAct && (
                            <div>
                              <p className="text-gray-600">Avg ACT</p>
                              <p className="font-medium">{college.avgAct}</p>
                            </div>
                          )}
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="w-full"
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
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border rounded-lg">
                <Search className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold mb-2">Search Colleges</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Use the search bar above to find colleges and universities. 
                  View their admission statistics and requirements.
                </p>
                <Button variant="outline" size="sm">
                  Start Searching
                </Button>
              </div>
              
              <div className="p-6 border rounded-lg">
                <Calculator className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold mb-2">Admission Calculator</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Calculate your admission chances based on your GPA, test scores, 
                  and extracurricular activities.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCalculator(true)}
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
  );
}
