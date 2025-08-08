import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBackend } from "../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Search, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import StudyGroupCard from "../components/StudyGroupCard";
import ErrorBoundary from "../components/ErrorBoundary";

export default function StudyGroups() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    isPublic: false,
  });
  
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: myGroupsData, isLoading: myGroupsLoading } = useQuery({
    queryKey: ["groups", "my"],
    queryFn: () => backend.groups.list({ myGroups: true }),
  });

  const { data: publicGroupsData, isLoading: publicGroupsLoading } = useQuery({
    queryKey: ["groups", "public"],
    queryFn: () => backend.groups.list({ myGroups: false }),
  });

  const createGroupMutation = useMutation({
    mutationFn: backend.groups.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setShowCreateForm(false);
      setCreateForm({ name: "", description: "", isPublic: false });
      toast({
        title: "Group Created! 🎉",
        description: "Your study group has been created successfully",
      });
    },
    onError: (error) => {
      console.error("Failed to create group:", error);
      toast({
        title: "Error",
        description: "Failed to create study group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: backend.groups.join,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setJoinCode("");
      toast({
        title: "Joined Group! 🎉",
        description: `You've successfully joined ${data.groupName}`,
      });
    },
    onError: (error) => {
      console.error("Failed to join group:", error);
      toast({
        title: "Error",
        description: "Failed to join group. Please check the join code.",
        variant: "destructive",
      });
    },
  });

  const myGroups = myGroupsData?.groups || [];
  const publicGroups = publicGroupsData?.groups || [];

  const handleCreateGroup = () => {
    if (!createForm.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    createGroupMutation.mutate(createForm);
  };

  const handleJoinGroup = () => {
    if (!joinCode.trim()) {
      toast({
        title: "Join Code Required",
        description: "Please enter a join code",
        variant: "destructive",
      });
      return;
    }

    joinGroupMutation.mutate({ code: joinCode.trim() });
  };

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
              Study Groups
            </h1>
            <p className="text-xl text-slate-600">Collaborate and learn together with your peers</p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Join Group */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <UserPlus className="w-5 h-5" />
                Join a Group
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="joinCode" className="text-green-800">Join Code</Label>
                <Input
                  id="joinCode"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 8-character code"
                  maxLength={8}
                  className="border-green-300 focus:border-green-500"
                />
              </div>
              <Button
                onClick={handleJoinGroup}
                disabled={joinGroupMutation.isPending || !joinCode.trim()}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
              </Button>
            </CardContent>
          </Card>

          {/* Create Group Form */}
          {showCreateForm && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Plus className="w-5 h-5" />
                  Create New Group
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="groupName" className="text-blue-800">Group Name *</Label>
                  <Input
                    id="groupName"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="Enter group name"
                    className="border-blue-300 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="groupDescription" className="text-blue-800">Description</Label>
                  <Textarea
                    id="groupDescription"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="What's this group about?"
                    rows={3}
                    className="border-blue-300 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={createForm.isPublic}
                    onChange={(e) => setCreateForm({ ...createForm, isPublic: e.target.checked })}
                    className="rounded border-blue-300"
                  />
                  <Label htmlFor="isPublic" className="text-blue-800">Make group public</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateGroup}
                    disabled={createGroupMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Groups Tabs */}
        <Tabs defaultValue="my-groups" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-groups" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              My Groups ({myGroups.length})
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Discover Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-groups" className="space-y-6">
            {myGroupsLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Loading your groups...</p>
              </div>
            ) : myGroups.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">No groups yet</h3>
                  <p className="text-slate-500 mb-6">Create or join your first study group to get started</p>
                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={() => setShowCreateForm(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Create Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myGroups.map((group) => (
                  <StudyGroupCard
                    key={group.id}
                    group={group}
                    showJoinCode={group.userRole === "admin"}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            {publicGroupsLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Loading public groups...</p>
              </div>
            ) : publicGroups.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">No public groups found</h3>
                  <p className="text-slate-500 mb-6">Be the first to create a public study group!</p>
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Create Public Group
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicGroups.map((group) => (
                  <StudyGroupCard
                    key={group.id}
                    group={group}
                    onJoin={(groupId) => {
                      // Handle join logic here
                      console.log("Join group:", groupId);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
