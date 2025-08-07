import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
