import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, Link, Trash2, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import MaterialForm from "../components/MaterialForm";

export default function Materials() {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterSubject, setFilterSubject] = useState<string>("all");
  
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: materialsData, isLoading } = useQuery({
    queryKey: ["materials"],
    queryFn: () => backend.materials.list(),
  });

  const createMaterialMutation = useMutation({
    mutationFn: backend.materials.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      setShowForm(false);
      toast({
        title: "Success",
        description: "Material added successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to create material:", error);
      toast({
        title: "Error",
        description: "Failed to add material",
        variant: "destructive",
      });
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: (id: number) => backend.materials.deleteMaterial({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      toast({
        title: "Success",
        description: "Material deleted successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to delete material:", error);
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      });
    },
  });

  const materials = materialsData?.materials || [];

  // Get unique subjects
  const subjects = Array.from(new Set(materials.map(m => m.subject).filter(Boolean)));

  // Filter materials
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = searchQuery === "" || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || material.type === filterType;
    const matchesSubject = filterSubject === "all" || material.subject === filterSubject;
    
    return matchesSearch && matchesType && matchesSubject;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pdf":
      case "doc":
        return <FileText className="h-5 w-5" />;
      case "link":
        return <Link className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "pdf":
        return "bg-red-100 text-red-800";
      case "doc":
        return "bg-blue-100 text-blue-800";
      case "link":
        return "bg-green-100 text-green-800";
      case "note":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading materials...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Study Materials</h1>
          <p className="text-gray-600">Organize your study resources and documents</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Material
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-4 w-4" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search materials by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium">Type:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDF</option>
                  <option value="doc">Document</option>
                  <option value="link">Link</option>
                  <option value="note">Note</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm font-medium">Subject:</span>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No materials found</p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              Add your first material
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(material.type)}
                    <CardTitle className="text-lg line-clamp-2">{material.title}</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMaterialMutation.mutate(material.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Badge className={getTypeColor(material.type)}>
                      {material.type.toUpperCase()}
                    </Badge>
                    {material.subject && (
                      <Badge variant="outline">{material.subject}</Badge>
                    )}
                  </div>
                  
                  {material.fileUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(material.fileUrl, "_blank")}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {material.type === "link" ? "Open Link" : "Download"}
                    </Button>
                  )}
                  
                  <p className="text-xs text-gray-400">
                    Added {new Date(material.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recently Added */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Added</CardTitle>
        </CardHeader>
        <CardContent>
          {materials.slice(0, 5).length === 0 ? (
            <p className="text-gray-500">No materials yet</p>
          ) : (
            <div className="space-y-3">
              {materials.slice(0, 5).map((material) => (
                <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(material.type)}
                    <div>
                      <p className="font-medium">{material.title}</p>
                      <p className="text-sm text-gray-600">
                        {material.subject && `${material.subject} • `}
                        {new Date(material.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getTypeColor(material.type)}>
                    {material.type.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Material Form Modal */}
      {showForm && (
        <MaterialForm
          onSubmit={(data) => createMaterialMutation.mutate(data)}
          onCancel={() => setShowForm(false)}
          isLoading={createMaterialMutation.isPending}
        />
      )}
    </div>
  );
}
