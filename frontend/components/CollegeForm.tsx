import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import type { CreateCollegeRequest } from "~backend/colleges/types";

interface CollegeFormProps {
  initialName?: string;
  onSubmit: (data: CreateCollegeRequest) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function CollegeForm({ initialName, onSubmit, onCancel, isLoading }: CollegeFormProps) {
  const [formData, setFormData] = useState<CreateCollegeRequest>({
    name: initialName || "",
    location: "",
    acceptanceRate: undefined,
    avgGpa: undefined,
    avgSat: undefined,
    avgAct: undefined,
    details: {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add College</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">College Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State"
              />
            </div>

            <div>
              <Label htmlFor="acceptanceRate">Acceptance Rate (%)</Label>
              <Input
                id="acceptanceRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.acceptanceRate || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  acceptanceRate: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="avgGpa">Average GPA</Label>
                <Input
                  id="avgGpa"
                  type="number"
                  min="0"
                  max="4"
                  step="0.1"
                  value={formData.avgGpa || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    avgGpa: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                />
              </div>

              <div>
                <Label htmlFor="avgSat">Average SAT</Label>
                <Input
                  id="avgSat"
                  type="number"
                  min="400"
                  max="1600"
                  value={formData.avgSat || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    avgSat: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="avgAct">Average ACT</Label>
              <Input
                id="avgAct"
                type="number"
                min="1"
                max="36"
                value={formData.avgAct || ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  avgAct: e.target.value ? parseInt(e.target.value) : undefined 
                })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Adding..." : "Add College"}
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
