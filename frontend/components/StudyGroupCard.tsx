import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Crown, Shield, User, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface StudyGroup {
  id: number;
  name: string;
  description?: string;
  code: string;
  isPublic: boolean;
  memberCount: number;
  userRole?: string;
  createdAt: Date;
}

interface StudyGroupCardProps {
  group: StudyGroup;
  onJoin?: (groupId: number) => void;
  onLeave?: (groupId: number) => void;
  showJoinCode?: boolean;
}

export default function StudyGroupCard({ 
  group, 
  onJoin, 
  onLeave, 
  showJoinCode = false 
}: StudyGroupCardProps) {
  const { toast } = useToast();

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case "moderator":
        return <Shield className="w-4 h-4 text-blue-600" />;
      case "member":
        return <User className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "moderator":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "member":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const copyJoinCode = () => {
    navigator.clipboard.writeText(group.code);
    toast({
      title: "Join code copied! 📋",
      description: `Share ${group.code} with others to invite them`,
    });
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg group-hover:text-blue-700 transition-colors">
              {group.name}
            </CardTitle>
            {group.description && (
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                {group.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <Users className="w-4 h-4" />
              <span>{group.memberCount}</span>
            </div>
            {group.isPublic && (
              <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                Public
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {group.userRole && (
              <Badge className={`text-xs font-semibold ${getRoleColor(group.userRole)}`}>
                <div className="flex items-center gap-1">
                  {getRoleIcon(group.userRole)}
                  <span>{group.userRole.charAt(0).toUpperCase() + group.userRole.slice(1)}</span>
                </div>
              </Badge>
            )}
            <span className="text-xs text-slate-500">
              Created {new Date(group.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {showJoinCode && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Join Code</p>
                <p className="text-lg font-mono font-bold text-slate-900">{group.code}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyJoinCode}
                className="border-slate-300 hover:bg-slate-100"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-slate-100">
          {group.userRole ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLeave?.(group.id)}
              className="flex-1 text-red-700 border-red-200 hover:bg-red-50"
            >
              Leave Group
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => onJoin?.(group.id)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Join Group
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 hover:bg-slate-50"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
