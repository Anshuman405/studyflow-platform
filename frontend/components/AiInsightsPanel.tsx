import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, TrendingUp, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "./LoadingSpinner";

interface AiInsightsPanelProps {
  type?: "weekly" | "study_breakdown" | "college_prediction";
  className?: string;
}

export default function AiInsightsPanel({ type = "weekly", className }: AiInsightsPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const generateInsightsMutation = useMutation({
    mutationFn: (insightType: string) => backend.ai.generateInsights({ type: insightType as any }),
    onSuccess: (data) => {
      setIsGenerating(false);
      toast({
        title: "AI Insights Generated! 🧠",
        description: "Your personalized study insights are ready",
      });
    },
    onError: (error) => {
      console.error("Failed to generate insights:", error);
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: "Unable to generate insights at this time",
        variant: "destructive",
      });
    },
  });

  const handleGenerateInsights = () => {
    setIsGenerating(true);
    generateInsightsMutation.mutate(type);
  };

  const getTypeIcon = () => {
    switch (type) {
      case "weekly":
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case "study_breakdown":
        return <Brain className="w-5 h-5 text-purple-600" />;
      case "college_prediction":
        return <Sparkles className="w-5 h-5 text-yellow-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case "weekly":
        return "Weekly Study Insights";
      case "study_breakdown":
        return "Study Pattern Analysis";
      case "college_prediction":
        return "College Readiness Insights";
      default:
        return "AI Insights";
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "weekly":
        return "from-blue-50 to-indigo-50 border-blue-200";
      case "study_breakdown":
        return "from-purple-50 to-violet-50 border-purple-200";
      case "college_prediction":
        return "from-yellow-50 to-orange-50 border-yellow-200";
      default:
        return "from-blue-50 to-indigo-50 border-blue-200";
    }
  };

  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-br ${getTypeColor()} ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            {getTypeTitle()}
          </div>
          <Badge variant="secondary" className="bg-white/80 text-slate-700">
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isGenerating || generateInsightsMutation.isPending ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" text="Analyzing your data..." />
            <p className="text-sm text-slate-600 mt-4">
              Our AI is reviewing your study patterns and generating personalized insights
            </p>
          </div>
        ) : generateInsightsMutation.data ? (
          <div className="space-y-4">
            {/* Insights */}
            {generateInsightsMutation.data.insights.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Key Insights
                </h4>
                <div className="space-y-2">
                  {generateInsightsMutation.data.insights.map((insight, index) => (
                    <div key={index} className="p-3 bg-white/60 rounded-lg border border-white/40">
                      <p className="text-sm text-slate-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {generateInsightsMutation.data.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {generateInsightsMutation.data.recommendations.map((rec, index) => (
                    <div key={index} className="p-3 bg-white/60 rounded-lg border border-white/40">
                      <p className="text-sm text-slate-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleGenerateInsights}
              variant="outline"
              size="sm"
              className="w-full bg-white/60 hover:bg-white/80"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Insights
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Get AI-Powered Insights</h3>
            <p className="text-sm text-slate-600 mb-4">
              Let our AI analyze your study patterns and provide personalized recommendations
            </p>
            <Button
              onClick={handleGenerateInsights}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
