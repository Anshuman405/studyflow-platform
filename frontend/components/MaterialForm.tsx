import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add Study Material</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as MaterialType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="pdf">PDF</option>
                <option value="doc">Document</option>
                <option value="link">Link</option>
                <option value="note">Note</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <Label htmlFor="fileUrl">File URL or Link</Label>
              <Input
                id="fileUrl"
                type="url"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Adding..." : "Add Material"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
