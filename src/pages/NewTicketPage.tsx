import { useMutation } from "convex/react";
import { ArrowLeft, Send } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";

type Category = "bug_fix" | "feature_request" | "general_support" | "billing" | "design_change" | "hosting" | "other";
type Priority = "low" | "medium" | "high" | "urgent";

const categories: { value: Category; label: string; desc: string }[] = [
  { value: "bug_fix", label: "Bug Fix", desc: "Something isn't working correctly on your site" },
  { value: "feature_request", label: "Feature Request", desc: "Request a new feature or functionality" },
  { value: "design_change", label: "Design Change", desc: "Visual or layout modifications" },
  { value: "hosting", label: "Hosting & Domain", desc: "Domain, DNS, or hosting issues" },
  { value: "billing", label: "Billing", desc: "Invoice or payment questions" },
  { value: "general_support", label: "General Support", desc: "General questions or assistance" },
  { value: "other", label: "Other", desc: "Anything else" },
];

export function NewTicketPage() {
  const navigate = useNavigate();
  const createTicket = useMutation(api.tickets.create);
  const [submitting, setSubmitting] = useState(false);

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject || !category || !description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const ticketId = await createTicket({
        subject,
        category: category as Category,
        priority,
        description,
        projectUrl: projectUrl || undefined,
      });
      toast.success("Ticket created successfully!");
      navigate(`/tickets/${ticketId}`);
    } catch {
      toast.error("Failed to create ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#00b4ff] transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-white">Create Support Ticket</h1>
        <p className="text-sm text-[#64748b] mt-1">
          Describe your issue or request and we'll get back to you as soon as possible.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-xl glow-border bg-[#0a1628]/60 space-y-5"
      >
        {/* Subject */}
        <div>
          <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
            Subject <span className="text-[#00b4ff]">*</span>
          </label>
          <Input
            placeholder="Brief summary of your issue"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-[#111d33] border-[#1e293b] text-white placeholder:text-[#475569] focus:border-[#00b4ff]"
          />
        </div>

        {/* Category & Priority */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
              Category <span className="text-[#00b4ff]">*</span>
            </label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="bg-[#111d33] border-[#1e293b] text-white">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a1628] border-[#1e293b]">
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="text-[#e2e8f0] focus:bg-[#111d33] focus:text-white">
                    <div>
                      <div>{cat.label}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {category && (
              <p className="text-xs text-[#475569] mt-1">
                {categories.find((c) => c.value === category)?.desc}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
              Priority
            </label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger className="bg-[#111d33] border-[#1e293b] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0a1628] border-[#1e293b]">
                <SelectItem value="low" className="text-[#e2e8f0] focus:bg-[#111d33] focus:text-white">Low</SelectItem>
                <SelectItem value="medium" className="text-[#e2e8f0] focus:bg-[#111d33] focus:text-white">Medium</SelectItem>
                <SelectItem value="high" className="text-[#e2e8f0] focus:bg-[#111d33] focus:text-white">High</SelectItem>
                <SelectItem value="urgent" className="text-[#e2e8f0] focus:bg-[#111d33] focus:text-white">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Project URL */}
        <div>
          <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
            Project URL <span className="text-[#475569]">(optional)</span>
          </label>
          <Input
            type="url"
            placeholder="https://yoursite.com"
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            className="bg-[#111d33] border-[#1e293b] text-white placeholder:text-[#475569] focus:border-[#00b4ff]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
            Description <span className="text-[#00b4ff]">*</span>
          </label>
          <Textarea
            rows={6}
            placeholder="Provide as much detail as possible — what's happening, what you expected, steps to reproduce, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#111d33] border-[#1e293b] text-white placeholder:text-[#475569] focus:border-[#00b4ff] resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd] font-semibold glow-btn"
        >
          {submitting ? "Creating..." : "Submit Ticket"}
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
