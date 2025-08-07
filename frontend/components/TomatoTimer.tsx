import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Square, Timer, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TomatoTimerProps {
  taskId?: number;
  onComplete?: (actualTime: number) => void;
}

export default function TomatoTimer({ taskId, onComplete }: TomatoTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState(25);
  const [taskTitle, setTaskTitle] = useState("");
  const [complexity, setComplexity] = useState<"low" | "medium" | "high">("medium");
  const [showEstimator, setShowEstimator] = useState(false);

  const backend = useBackend();
  const { toast } = useToast();

  const estimateTimeMutation = useMutation({
    mutationFn: backend.timer.estimateTime,
    onSuccess: (data) => {
      setEstimatedTime(data.estimatedMinutes);
      setTimeLeft(data.estimatedMinutes * 60);
      toast({
        title: "Time Estimated! ⏱️",
        description: `Estimated ${data.estimatedMinutes} minutes for this task`,
      });
    },
    onError: (error) => {
      console.error("Failed to estimate time:", error);
      toast({
        title: "Estimation Failed",
        description: "Using default 25-minute session",
        variant: "destructive",
      });
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: backend.timer.createSession,
    onSuccess: (data) => {
      setSessionId(data.id);
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: backend.timer.updateSession,
    onSuccess: () => {
      toast({
        title: "Session Completed! 🎉",
        description: "Great work on your focused study session",
      });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleStart = () => {
    if (!sessionId) {
      createSessionMutation.mutate({
        taskId,
        estimatedTime: estimatedTime,
      });
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (sessionId) {
      const actualMinutes = Math.ceil((estimatedTime * 60 - timeLeft) / 60);
      updateSessionMutation.mutate({
        sessionId,
        actualTime: actualMinutes,
        completed: false,
      });
      onComplete?.(actualMinutes);
    }
    setTimeLeft(estimatedTime * 60);
    setSessionId(null);
  };

  const handleComplete = () => {
    if (sessionId) {
      updateSessionMutation.mutate({
        sessionId,
        actualTime: estimatedTime,
        completed: true,
      });
      onComplete?.(estimatedTime);
    }
    setSessionId(null);
  };

  const handleEstimate = () => {
    if (!taskTitle.trim()) {
      toast({
        title: "Task Title Required",
        description: "Please enter a task title for estimation",
        variant: "destructive",
      });
      return;
    }

    estimateTimeMutation.mutate({
      taskTitle,
      complexity,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((estimatedTime * 60 - timeLeft) / (estimatedTime * 60)) * 100;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-orange-600" />
          Tomato Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Time Estimator */}
        {!showEstimator ? (
          <Button
            variant="outline"
            onClick={() => setShowEstimator(true)}
            className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
          >
            <Zap className="w-4 h-4 mr-2" />
            Get AI Time Estimate
          </Button>
        ) : (
          <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div>
              <Label htmlFor="taskTitle">Task Title</Label>
              <Input
                id="taskTitle"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="What are you working on?"
              />
            </div>
            <div>
              <Label htmlFor="complexity">Complexity</Label>
              <Select value={complexity} onValueChange={(value: any) => setComplexity(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low - Simple task</SelectItem>
                  <SelectItem value="medium">🟡 Medium - Moderate effort</SelectItem>
                  <SelectItem value="high">🔴 High - Complex task</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleEstimate}
                disabled={estimateTimeMutation.isPending}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {estimateTimeMutation.isPending ? "Estimating..." : "Estimate Time"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowEstimator(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Timer Display */}
        <div className="text-center space-y-4">
          <div className="relative w-48 h-48 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-slate-200"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="text-orange-600 transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-800">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-slate-600">
                  {estimatedTime} min session
                </div>
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center gap-3">
            {!isRunning ? (
              <Button
                onClick={handleStart}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            )}
            <Button
              onClick={handleStop}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50 px-6"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </div>

          {/* Manual Time Adjustment */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEstimatedTime(15);
                setTimeLeft(15 * 60);
              }}
              disabled={isRunning}
            >
              15m
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEstimatedTime(25);
                setTimeLeft(25 * 60);
              }}
              disabled={isRunning}
            >
              25m
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEstimatedTime(45);
                setTimeLeft(45 * 60);
              }}
              disabled={isRunning}
            >
              45m
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
