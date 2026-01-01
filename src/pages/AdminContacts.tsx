import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CheckCircle,
  DollarSign,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
  Star,
  Target,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  budget?: string;
  source?: string;
  message?: string;
  status?: string;
  notes?: string;
  created_at: string;
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pipeline");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [noteText, setNoteText] = useState("");

  // Stats
  const [stats, setStats] = useState({
    totalLeads: 0,
    hotLeads: 0,
    converted: 0,
    conversionRate: 0,
    revenue: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: contactsData } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      setContacts(contactsData || []);

      // Calculate stats
      const all = contactsData || [];
      const converted = all.filter((c) => c.status === "converted").length;
      const hot = all.filter((c) => c.budget && c.budget !== "Chưa xác định").length;

      setStats({
        totalLeads: all.length,
        hotLeads: hot,
        converted,
        conversionRate: all.length > 0 ? Math.round((converted / all.length) * 100) : 0,
        revenue: converted * 50000000, // Estimated revenue per deal
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from("contacts").update({ status }).eq("id", id);
      if (error) throw error;
      toast.success("Status updated");
      loadData();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const addNote = async (contactId: string) => {
    if (!noteText.trim()) return;
    try {
      const contact = contacts.find((c) => c.id === contactId);
      const newNotes = contact?.notes
        ? `${contact.notes}\n[${format(new Date(), "dd/MM HH:mm")}] ${noteText}`
        : `[${format(new Date(), "dd/MM HH:mm")}] ${noteText}`;

      await supabase.from("contacts").update({ notes: newNotes }).eq("id", contactId);
      toast.success("Note added");
      setNoteText("");
      loadData();
    } catch (error) {
      toast.error("Failed to add note");
    }
  };

  const getTimeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: vi });
    } catch {
      return dateStr;
    }
  };

  const getPriorityColor = (budget?: string) => {
    if (!budget || budget === "Chưa xác định") return "border-l-muted-foreground/30";
    if (budget.includes("100") || budget.includes("trên")) return "border-l-red-500";
    if (budget.includes("50")) return "border-l-orange-500";
    return "border-l-yellow-500";
  };

  // Group contacts by status for Kanban view
  const pipeline = {
    new: contacts.filter((c) => !c.status || c.status === "new"),
    contacted: contacts.filter((c) => c.status === "contacted"),
    negotiating: contacts.filter((c) => c.status === "negotiating"),
    converted: contacts.filter((c) => c.status === "converted"),
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM & Pipeline</h1>
          <p className="text-muted-foreground">Manage leads and track conversions</p>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Leads</p>
              <p className="text-2xl font-bold">{stats.totalLeads}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground/20" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Hot Leads 🔥</p>
              <p className="text-2xl font-bold text-orange-500">{stats.hotLeads}</p>
            </div>
            <Target className="h-8 w-8 text-orange-500/20" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Converted</p>
              <p className="text-2xl font-bold text-green-500">{stats.converted}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500/20" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Est. Revenue</p>
              <p className="text-2xl font-bold text-emerald-500">
                {(stats.revenue / 1000000).toFixed(0)}M
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-500/20" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">
            <Target className="h-4 w-4 mr-2" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="leads">
            <Users className="h-4 w-4 mr-2" />
            All Leads
          </TabsTrigger>
        </TabsList>

        {/* Pipeline View - Kanban Style */}
        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* New Leads */}
            <PipelineColumn
              title="New"
              count={pipeline.new.length}
              color="bg-blue-500"
              contacts={pipeline.new}
              onStatusChange={updateStatus}
              onViewDetails={setSelectedContact}
              getPriorityColor={getPriorityColor}
              getTimeAgo={getTimeAgo}
            />

            {/* Contacted */}
            <PipelineColumn
              title="Contacted"
              count={pipeline.contacted.length}
              color="bg-yellow-500"
              contacts={pipeline.contacted}
              onStatusChange={updateStatus}
              onViewDetails={setSelectedContact}
              getPriorityColor={getPriorityColor}
              getTimeAgo={getTimeAgo}
            />

            {/* Negotiating */}
            <PipelineColumn
              title="Negotiating"
              count={pipeline.negotiating.length}
              color="bg-orange-500"
              contacts={pipeline.negotiating}
              onStatusChange={updateStatus}
              onViewDetails={setSelectedContact}
              getPriorityColor={getPriorityColor}
              getTimeAgo={getTimeAgo}
            />

            {/* Converted */}
            <PipelineColumn
              title="Won"
              count={pipeline.converted.length}
              color="bg-green-500"
              contacts={pipeline.converted}
              onStatusChange={updateStatus}
              onViewDetails={setSelectedContact}
              getPriorityColor={getPriorityColor}
              getTimeAgo={getTimeAgo}
              isConverted
            />
          </div>
        </TabsContent>

        {/* All Leads - List View */}
        <TabsContent value="leads">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {contacts.length === 0 ? (
                  <div className="p-10 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto opacity-30 mb-3" />
                    <p>No leads found</p>
                  </div>
                ) : (
                  contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-4 hover:bg-muted/50 transition-colors border-l-4 cursor-pointer ${getPriorityColor(
                        contact.budget
                      )}`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold truncate">{contact.name}</span>
                            {contact.budget && contact.budget !== "Chưa xác định" && (
                              <Badge variant="secondary" className="text-xs">
                                {contact.budget}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </span>
                            {contact.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {contact.phone}
                              </span>
                            )}
                          </div>
                          {contact.service && (
                            <p className="text-sm text-muted-foreground mt-1">
                              🎯 {contact.service}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground hidden sm:block">
                            {getTimeAgo(contact.created_at)}
                          </span>
                          <StatusBadge status={contact.status} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Detail Modal */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              {selectedContact?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedContact.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedContact.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Service</p>
                  <p className="font-medium">{selectedContact.service || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Budget</p>
                  <p className="font-medium">{selectedContact.budget || "-"}</p>
                </div>
              </div>

              {selectedContact.message && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Message</p>
                  <p className="p-3 rounded-lg bg-muted text-sm">{selectedContact.message}</p>
                </div>
              )}

              {selectedContact.notes && (
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Notes</p>
                  <p className="p-3 rounded-lg bg-muted text-sm whitespace-pre-wrap">
                    {selectedContact.notes}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Add a note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNote(selectedContact.id)}
                />
                <Button onClick={() => addNote(selectedContact.id)}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => updateStatus(selectedContact.id, "contacted")}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Contacted
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => updateStatus(selectedContact.id, "negotiating")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Negotiating
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    updateStatus(selectedContact.id, "converted");
                    setSelectedContact(null);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Won!
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PipelineColumn({
  title,
  count,
  color,
  contacts,
  onStatusChange,
  onViewDetails,
  getPriorityColor,
  getTimeAgo,
  isConverted = false,
}: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        <h3 className="font-semibold text-sm">
          {title} ({count})
        </h3>
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {contacts.map((contact: Contact) => (
          <LeadCard
            key={contact.id}
            contact={contact}
            onStatusChange={(status) => onStatusChange(contact.id, status)}
            onViewDetails={() => onViewDetails(contact)}
            priorityColor={getPriorityColor(contact.budget)}
            timeAgo={getTimeAgo(contact.created_at)}
            isConverted={isConverted}
          />
        ))}
        {contacts.length === 0 && (
          <div className="p-4 text-center text-muted-foreground text-sm rounded-lg border border-dashed">
            Empty
          </div>
        )}
      </div>
    </div>
  );
}

function LeadCard({
  contact,
  onStatusChange,
  onViewDetails,
  priorityColor,
  timeAgo,
  isConverted = false,
}: {
  contact: Contact;
  onStatusChange: (status: string) => void;
  onViewDetails: () => void;
  priorityColor: string;
  timeAgo: string;
  isConverted?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-lg bg-card border hover:border-primary/50 transition-all cursor-pointer border-l-4 ${priorityColor}`}
      onClick={onViewDetails}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-medium text-sm truncate">{contact.name}</span>
        {isConverted && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
      </div>
      <p className="text-xs text-muted-foreground truncate mb-2">{contact.email}</p>
      {contact.service && (
        <p className="text-xs text-muted-foreground truncate mb-2">🎯 {contact.service}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
        {contact.budget && contact.budget !== "Chưa xác định" && (
          <Badge variant="secondary" className="text-[10px] px-1.5">
            {contact.budget}
          </Badge>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const config: Record<string, { label: string; className: string }> = {
    new: { label: "New", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    contacted: {
      label: "Contacted",
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    },
    negotiating: {
      label: "Negotiating",
      className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    },
    converted: { label: "Won", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  };

  const { label, className } = config[status || "new"] || config.new;

  return (
    <Badge variant="outline" className={`text-xs ${className}`}>
      {label}
    </Badge>
  );
}
