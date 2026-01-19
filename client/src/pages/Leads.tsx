import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { useLeads, useCreateLead, useUpdateLead } from "@/hooks/use-leads";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, MoreHorizontal, User, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type InsertLead } from "@shared/routes";

export default function Leads() {
  const { data: leads, isLoading } = useLeads();
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const { toast } = useToast();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newLead, setNewLead] = useState<Partial<InsertLead>>({
    username: "",
    twitterProfileUrl: "",
    status: "new"
  });

  const handleCreate = async () => {
    try {
      if (!newLead.username) return;
      await createLeadMutation.mutateAsync(newLead as InsertLead);
      setIsCreateOpen(false);
      setNewLead({ username: "", twitterProfileUrl: "", status: "new" });
      toast({ title: "Success", description: "Lead added successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create lead", variant: "destructive" });
    }
  };

  const handleStatusChange = (id: number, status: string) => {
    updateLeadMutation.mutate({ id, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "contacted": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "replied": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "converted": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-white">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
        <PageHeader 
          title="Lead Management" 
          description="Track and manage your potential clients."
          action={
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <button className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 transition-all">
                  <Plus className="w-5 h-5" /> Add Lead
                </button>
              </DialogTrigger>
              <DialogContent className="bg-[#0B1121] border border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Lead</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Username</label>
                    <input 
                      value={newLead.username}
                      onChange={(e) => setNewLead({...newLead, username: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-2">Profile URL</label>
                    <input 
                      value={newLead.twitterProfileUrl || ""}
                      onChange={(e) => setNewLead({...newLead, twitterProfileUrl: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <button 
                    onClick={handleCreate}
                    disabled={createLeadMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-2 rounded-lg transition-colors mt-4 disabled:opacity-50"
                  >
                    {createLeadMutation.isPending ? "Creating..." : "Create Lead"}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white/5 border-b border-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Lead Profile</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-center">Replies</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-center">Conversions</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads?.map((lead) => (
                  <TableRow key={lead.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-bold text-white">{lead.username}</p>
                          <a href={lead.twitterProfileUrl || "#"} target="_blank" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                            <Twitter className="w-3 h-3" /> View Profile
                          </a>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={lead.status} 
                        onValueChange={(val) => handleStatusChange(lead.id, val)}
                      >
                        <SelectTrigger className={`w-[120px] h-8 text-xs font-semibold border rounded-full px-3 ${getStatusColor(lead.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0B1121] border-white/10 text-white">
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="replied">Replied</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-center font-medium text-white/80">{lead.repliesCount}</TableCell>
                    <TableCell className="text-center font-medium text-white/80">{lead.conversions}</TableCell>
                    <TableCell className="text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
