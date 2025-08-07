import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Calculator, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { College, AdmissionChanceRequest } from "~backend/colleges/types";

interface AdmissionCalculatorProps {
  colleges: College[];
  onClose: () => void;
}

export default function AdmissionCalculator({ colleges, onClose }: AdmissionCalculatorProps) {
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [formData, setFormData] = useState({
    gpa: "",
    sat: "",
    act: "",
    extracurriculars: "",
    essays: "",
  });
  const [result, setResult] = useState<any>(null);

  const backend = useBackend();
  const { toast } = useToast();

  const calculateMutation = useMutation({
    mutationFn: (data: AdmissionChanceRequest) => backend.colleges.calculateAdmissionChance(data),
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (error) => {
      console.error("Failed to calculate admission chance:", error);
      toast({
        title: "Error",
        description: "Failed to calculate admission chance",
        variant: "destructive",
      });
    },
  });

  const handleCalculate = () => {
    if (!selectedCollege || !formData.gpa) {
      toast({
        title: "Error",
        description: "Please select a college and enter your GPA",
        variant: "destructive",
      });
      return;
    }

    const requestData: AdmissionChanceRequest = {
      collegeId: selectedCollege.id,
      gpa: parseFloat(formData.gpa),
      sat: formData.sat ? parseInt(formData.sat) : undefined,
      act: formData.act ? parseInt(formData.act) : undefined,
      extracurriculars: formData.extracurriculars ? parseInt(formData.extracurriculars) : undefined,
      essays: formData.essays ? parseInt(formData.essays) : undefined,
    };

    calculateMutation.mutate(requestData);
  };

  const getChanceColor = (chance: number) => {
    if (chance >= 70) return "text-green-600";
    if (chance >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getChanceLabel = (chance: number) => {
    if (chance >= 70) return "Strong Chance";
    if (chance >= 40) return "Moderate Chance";
    return "Reach School";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            Admission Chance Calculator
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* College Selection */}
          <div>
            <Label>Select College</Label>
            <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto">
              {colleges.map((college) => (
                <div
                  key={college.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCollege?.id === college.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedCollege(college)}
                >
                  <div className="font-medium">{college.name}</div>
                  {college.location && (
                    <div className="text-sm text-gray-600">{college.location}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Student Stats Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gpa">GPA (Required)</Label>
              <Input
                id="gpa"
                type="number"
                min="0"
                max="4"
                step="0.1"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                placeholder="3.8"
              />
            </div>

            <div>
              <Label htmlFor="sat">SAT Score</Label>
              <Input
                id="sat"
                type="number"
                min="400"
                max="1600"
                value={formData.sat}
                onChange={(e) => setFormData({ ...formData, sat: e.target.value })}
                placeholder="1450"
              />
            </div>

            <div>
              <Label htmlFor="act">ACT Score</Label>
              <Input
                id="act"
                type="number"
                min="1"
                max="36"
                value={formData.act}
                onChange={(e) => setFormData({ ...formData, act: e.target.value })}
                placeholder="32"
              />
            </div>

            <div>
              <Label htmlFor="extracurriculars">Extracurriculars (1-10)</Label>
              <Input
                id="extracurriculars"
                type="number"
                min="1"
                max="10"
                value={formData.extracurriculars}
                onChange={(e) => setFormData({ ...formData, extracurriculars: e.target.value })}
                placeholder="7"
              />
            </div>

            <div>
              <Label htmlFor="essays">Essay Quality (1-10)</Label>
              <Input
                id="essays"
                type="number"
                min="1"
                max="10"
                value={formData.essays}
                onChange={(e) => setFormData({ ...formData, essays: e.target.value })}
                placeholder="8"
              />
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            disabled={calculateMutation.isPending || !selectedCollege || !formData.gpa}
            className="w-full"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            {calculateMutation.isPending ? "Calculating..." : "Calculate Admission Chance"}
          </Button>

          {/* Results */}
          {result && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Admission Chance Results</span>
                  <Badge className={getChanceColor(result.chance)}>
                    {getChanceLabel(result.chance)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getChanceColor(result.chance)}`}>
                    {result.chance}%
                  </div>
                  <p className="text-gray-600">Estimated admission chance</p>
                </div>

                {result.recommendations && result.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="space-y-1">
                      {result.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
