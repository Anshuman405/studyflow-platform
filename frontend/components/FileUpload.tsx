import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, File, X, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadProps {
  onUploadComplete: (fileKey: string, fileName: string, downloadUrl: string) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export default function FileUpload({ 
  onUploadComplete, 
  onUploadError, 
  accept = ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.webm",
  maxSize = 50,
  className 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const backend = useBackend();
  const { toast } = useToast();

  const generateUrlMutation = useMutation({
    mutationFn: backend.upload.generateUploadUrl,
    onError: (error) => {
      console.error("Failed to generate upload URL:", error);
      onUploadError?.("Failed to prepare file upload");
      toast({
        title: "Upload Error",
        description: "Failed to prepare file upload",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      const error = `File size exceeds ${maxSize}MB limit`;
      onUploadError?.(error);
      toast({
        title: "File Too Large",
        description: error,
        variant: "destructive",
      });
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate upload URL
      const { uploadUrl, fileKey, downloadUrl } = await generateUrlMutation.mutateAsync({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      // Upload file to signed URL
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setUploadedFile(file.name);
          onUploadComplete(fileKey, file.name, downloadUrl);
          toast({
            title: "Upload Successful! 🎉",
            description: `${file.name} has been uploaded successfully`,
          });
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
        setIsUploading(false);
      });

      xhr.addEventListener('error', () => {
        throw new Error('Upload failed');
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

    } catch (error: any) {
      console.error("Upload failed:", error);
      const errorMessage = error.message || "Upload failed";
      onUploadError?.(errorMessage);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className={`border-2 border-dashed transition-all duration-200 ${
      isDragging 
        ? "border-blue-400 bg-blue-50" 
        : uploadedFile 
        ? "border-green-400 bg-green-50"
        : "border-slate-300 hover:border-slate-400"
    } ${className}`}>
      <CardContent className="p-8">
        {uploadedFile ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800">Upload Complete!</p>
              <p className="text-sm text-green-600">{uploadedFile}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetUpload}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <X className="w-4 h-4 mr-2" />
              Upload Another File
            </Button>
          </div>
        ) : isUploading ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <div>
              <p className="font-semibold text-blue-800">Uploading...</p>
              <Progress value={uploadProgress} className="w-full mt-2" />
              <p className="text-sm text-blue-600 mt-1">{uploadProgress}% complete</p>
            </div>
          </div>
        ) : (
          <div
            className="text-center space-y-4 cursor-pointer"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-slate-600">
                Supports PDF, DOC, images, and videos up to {maxSize}MB
              </p>
            </div>
            <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
              <File className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
