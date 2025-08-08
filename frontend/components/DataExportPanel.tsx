import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Database, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type DataExportType = "full" | "tasks" | "notes" | "materials" | "reflections";

export default function DataExportPanel() {
  const [exportType, setExportType] = useState<DataExportType>("full");
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: exportsData, isLoading } = useQuery({
    queryKey: ["exports"],
    queryFn: () => backend.dataexport.listExports(),
    refetchInterval: 5000, // Refetch every 5 seconds to check status
  });

  const createExportMutation = useMutation({
    mutationFn: (data: { type: DataExportType; format: "json" | "csv" }) => 
      backend.dataexport.createExport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exports"] });
      toast({
        title: "Export Started! 📦",
        description: "Your data export is being processed. You'll be notified when it's ready.",
      });
    },
    onError: (error) => {
      console.error("Failed to create export:", error);
      toast({
        title: "Export Failed",
        description: "Failed to start data export. Please try again.",
        variant: "destructive",
      });
    },
  });

  const exports = exportsData?.exports || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "processing":
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "full":
        return "Complete Data";
      case "tasks":
        return "Tasks Only";
      case "notes":
        return "Notes Only";
      case "materials":
        return "Materials Only";
      case "reflections":
        return "Reflections Only";
      default:
        return type;
    }
  };

  const handleCreateExport = () => {
    createExportMutation.mutate({
      type: exportType,
      format: exportFormat,
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Database className="w-5 h-5 text-blue-600" />
          Data Export & Backup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Export */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-4">Create New Export</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-blue-800 mb-2 block">
                Data Type
              </label>
              <Select value={exportType} onValueChange={(value: DataExportType) => setExportType(value)}>
                <SelectTrigger className="border-blue-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">📦 Complete Data Export</SelectItem>
                  <SelectItem value="tasks">✅ Tasks Only</SelectItem>
                  <SelectItem value="notes">📝 Notes Only</SelectItem>
                  <SelectItem value="materials">📚 Materials Only</SelectItem>
                  <SelectItem value="reflections">📊 Reflections Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-blue-800 mb-2 block">
                Format
              </label>
              <Select value={exportFormat} onValueChange={(value: "json" | "csv") => setExportFormat(value)}>
                <SelectTrigger className="border-blue-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">📄 JSON Format</SelectItem>
                  <SelectItem value="csv">📊 CSV Format</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleCreateExport}
            disabled={createExportMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {createExportMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                Starting Export...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Create Export
              </div>
            )}
          </Button>
        </div>

        {/* Export History */}
        <div>
          <h3 className="font-semibold text-slate-800 mb-4">Export History</h3>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">
              Loading export history...
            </div>
          ) : exports.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No exports yet</p>
              <p className="text-sm text-slate-400">Create your first data export above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exports.map((exportItem) => (
                <div
                  key={exportItem.id}
                  className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(exportItem.status)}
                        <div>
                          <p className="font-medium text-slate-800">
                            {getTypeLabel(exportItem.type)}
                          </p>
                          <p className="text-sm text-slate-600">
                            Created {new Date(exportItem.createdAt).toLocaleDateString()} at{" "}
                            {new Date(exportItem.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`${getStatusColor(exportItem.status)} font-semibold`}>
                        {exportItem.status.charAt(0).toUpperCase() + exportItem.status.slice(1)}
                      </Badge>
                      {exportItem.status === "completed" && exportItem.downloadUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(exportItem.downloadUrl, '_blank')}
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
