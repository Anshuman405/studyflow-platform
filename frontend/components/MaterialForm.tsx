import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import FileUpload from "./FileUpload";
import type { CreateMaterialRequest, MaterialType } from "~backend/materials/types";

interface MaterialFormProps {
  onSubmit: (data: CreateMaterialRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function MaterialForm({ onSubmit, onCancel, isLoading }: MaterialFormProps) {
  const [formData, setFormData] = useState<CreateMaterialRequest>({
    title: "",
    type: "pdf",
    fileUrl: "",
    subject: "",
  });
  const [uploadedFile, setUploadedFile] = useState<{
    fileKey: string;
    fileName: string;
    downloadUrl: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      fileUrl: uploadedFile?.downloadUrl || formData.fileUrl,
    };
    
    onSubmit(submitData);
  };

  const handleFileUpload = (fileKey: string, fileName: string, downloadUrl: string) => {
    setUploadedFile({ fileKey, fileName, downloadUrl });
    
    // Auto-fill title if empty
    if (!formData.title) {
      setFormData(prev => ({
        ...prev,
        title: fileName.replace(/\.[^/.]+$/, ""), // Remove file extension
      }));
    }
    
    // Auto-detect file type
    const extension = fileName.split('.').pop()?.toLowerCase();
    let detectedType: MaterialType = "other";
    
    if (extension === "pdf") detectedType = "pdf";
    else if (["doc", "docx"].includes(extension || "")) detectedType = "doc";
    else if (["jpg", "jpeg", "png", "gif"].includes(extension || "")) detectedType = "image";
    else if (["mp4", "webm"].includes(extension || "")) detectedType = "video";
    
    setFormData(prev => ({ ...prev, type: detectedType }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-slate-100/50">
          <CardTitle className="text-xl font-bold text-slate-800">Add Study Material</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel} className="hover:bg-slate-200/60">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Upload File</Label>
              <FileUpload
                onUploadComplete={handleFileUpload}
                onUploadError={(error) => console.error("Upload error:", error)}
                className="mb-4"
              />
              {uploadedFile && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">
                    ✅ Uploaded: {uploadedFile.fileName}
                  </p>
                </div>
              )}
            </div>

            {/* Manual URL Input (alternative to file upload) */}
            {!uploadedFile && (
              <div className="space-y-2">
                <Label htmlFor="fileUrl" className="text-sm font-semibold text-slate-700">
                  Or Enter URL
                </Label>
                <Input
                  id="fileUrl"
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-slate-700">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter material title"
                className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-semibold text-slate-700">
                Type
              </Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as MaterialType })}
                className="w-full h-12 px-3 py-2 border border-slate-300 rounded-md focus:border-blue-500 focus:ring-blue-500/20"
              >
                <option value="pdf">📄 PDF Document</option>
                <option value="doc">📝 Word Document</option>
                <option value="link">🔗 Web Link</option>
                <option value="note">📋 Text Note</option>
                <option value="image">🖼️ Image</option>
                <option value="video">🎥 Video</option>
                <option value="other">📁 Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-semibold text-slate-700">
                Subject/Course
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Mathematics, History, Chemistry"
                className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-200/60">
              <Button 
                type="submit" 
                disabled={isLoading || (!uploadedFile && !formData.fileUrl)} 
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </div>
                ) : (
                  "Add Material"
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="px-8 h-12 border-slate-300 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
