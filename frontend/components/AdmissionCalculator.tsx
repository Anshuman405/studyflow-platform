import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Calculator, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CollegeCombobox } from "./CollegeCombobox";
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
      toast({
        title: "Calculation Complete! 🎯",
        description: `Your admission chance has been calculated at ${data.chance}%`,
      });
    },
    onError: (error) => {
      console.error("Failed to calculate admission chance:", error);
      toast({
        title: "Calculation Failed",
        description: "Unable to calculate admission chance at this time",
        variant: "destructive",
      });
    },
  });

  const handleCalculate = () => {
    if (!selectedCollege || !formData.gpa) {
      toast({
        title: "Missing Information",
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
    if (chance >= 70) return "text-green-600 bg-green-50 border-green-200";
    if (chance >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getChanceLabel = (chance: number) => {
    if (chance >= 70) return "Strong Chance 🎯";
    if (chance >= 40) return "Moderate Chance 📈";
    return "Reach School 🚀";
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-slate-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-800">
              Admission Chance Calculator
            </CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-slate-200/60">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          {/* College Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700">Select College *</Label>
            <CollegeCombobox
              value={selectedCollege}
              onSelect={setSelectedCollege}
              placeholder="Search for a college..."
              className="h-12"
            />
            {selectedCollege && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">{selectedCollege.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {selectedCollege.acceptanceRate && (
                    <div>
                      <p className="text-blue-600 font-medium">Acceptance Rate</p>
                      <p className="text-blue-800">{selectedCollege.acceptanceRate}%</p>
                    </div>
                  )}
                  {selectedCollege.avgGpa && (
                    <div>
                      <p className="text-blue-600 font-medium">Avg GPA</p>
                      <p className="text-blue-800">{selectedCollege.avgGpa}</p>
                    </div>
                  )}
                  {selectedCollege.avgSat && (
                    <div>
                      <p className="text-blue-600 font-medium">Avg SAT</p>
                      <p className="text-blue-800">{selectedCollege.avgSat}</p>
                    </div>
                  )}
                  {selectedCollege.avgAct && (
                    <div>
                      <p className="text-blue-600 font-medium">Avg ACT</p>
                      <p className="text-blue-800">{selectedCollege.avgAct}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Student Stats Form */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">
              Your Academic Profile
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="gpa" className="text-sm font-semibold text-slate-700">
                  GPA (Required) *
                </Label>
                <Input
                  id="gpa"
                  type="number"
                  min="0"
                  max="4"
                  step="0.01"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                  placeholder="3.85"
                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <p className="text-xs text-slate-500">On a 4.0 scale</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sat" className="text-sm font-semibold text-slate-700">
                  SAT Score
                </Label>
                <Input
                  id="sat"
                  type="number"
                  min="400"
                  max="1600"
                  value={formData.sat}
                  onChange={(e) => setFormData({ ...formData, sat: e.target.value })}
                  placeholder="1450"
                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <p className="text-xs text-slate-500">Out of 1600</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="act" className="text-sm font-semibold text-slate-700">
                  ACT Score
                </Label>
                <Input
                  id="act"
                  type="number"
                  min="1"
                  max="36"
                  value={formData.act}
                  onChange={(e) => setFormData({ ...formData, act: e.target.value })}
                  placeholder="32"
                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <p className="text-xs text-slate-500">Out of 36</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="extracurriculars" className="text-sm font-semibold text-slate-700">
                  Extracurriculars
                </Label>
                <Input
                  id="extracurriculars"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.extracurriculars}
                  onChange={(e) => setFormData({ ...formData, extracurriculars: e.target.value })}
                  placeholder="7"
                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <p className="text-xs text-slate-500">Rate 1-10 (leadership, activities, etc.)</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="essays" className="text-sm font-semibold text-slate-700">
                  Essay Quality
                </Label>
                <Input
                  id="essays"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.essays}
                  onChange={(e) => setFormData({ ...formData, essays: e.target.value })}
                  placeholder="8"
                  className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <p className="text-xs text-slate-500">Rate 1-10 (writing quality, uniqueness, etc.)</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            disabled={calculateMutation.isPending || !selectedCollege || !formData.gpa}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {calculateMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Calculating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Calculate Admission Chance
              </div>
            )}
          </Button>

          {/* Results */}
          {result && (
            <Card className={`border-2 ${getChanceColor(result.chance)}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-slate-800">Admission Chance Results</span>
                  <Badge className={`${getChanceColor(result.chance)} font-semibold`}>
                    {getChanceLabel(result.chance)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className={`text-5xl font-bold mb-2 ${result.chance >= 70 ? 'text-green-600' : result.chance >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {result.chance}%
                  </div>
                  <p className="text-slate-600 font-medium">Estimated admission chance</p>
                </div>

                {result.recommendations && result.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-slate-800 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Personalized Recommendations:
                    </h4>
                    <div className="space-y-3">
                      {result.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-600 text-sm font-semibold">{index + 1}</span>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
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
