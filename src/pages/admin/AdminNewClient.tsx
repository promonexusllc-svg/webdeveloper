import { useMutation } from "convex/react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";

export default function AdminNewClient() {
  const navigate = useNavigate();
  const createClient = useMutation(api.admin.createClient);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const result = await createClient({
        name: fd.get("name") as string,
        email: fd.get("email") as string,
        phone: (fd.get("phone") as string) || undefined,
        company: (fd.get("company") as string) || undefined,
        address: (fd.get("address") as string) || undefined,
        notes: (fd.get("notes") as string) || undefined,
        status: (fd.get("status") as any) || "active",
      });
      toast.success(`Client created — ${result.clientId}`);
      navigate(`/admin/clients/${result.clientId}`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create client");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to="/admin/clients"
        className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-white transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Clients
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white">New Client</h1>
        <p className="text-[#64748b] mt-1">
          A unique client ID will be auto-generated
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-6 rounded-xl glow-border bg-[#0a1628]/60 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#94a3b8] mb-1.5">
                Full Name *
              </label>
              <Input
                name="name"
                required
                className="bg-[#020817] border-[#1e293b] text-white"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-[#94a3b8] mb-1.5">
                Email *
              </label>
              <Input
                name="email"
                type="email"
                required
                className="bg-[#020817] border-[#1e293b] text-white"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#94a3b8] mb-1.5">
                Phone
              </label>
              <Input
                name="phone"
                className="bg-[#020817] border-[#1e293b] text-white"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm text-[#94a3b8] mb-1.5">
                Company
              </label>
              <Input
                name="company"
                className="bg-[#020817] border-[#1e293b] text-white"
                placeholder="Acme Inc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#94a3b8] mb-1.5">
              Address
            </label>
            <Input
              name="address"
              className="bg-[#020817] border-[#1e293b] text-white"
              placeholder="123 Main St, City, State"
            />
          </div>

          <div>
            <label className="block text-sm text-[#94a3b8] mb-1.5">
              Status
            </label>
            <select
              name="status"
              defaultValue="active"
              className="w-full rounded-md px-3 py-2 bg-[#020817] border border-[#1e293b] text-white text-sm"
            >
              <option value="active">Active</option>
              <option value="prospect">Prospect</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#94a3b8] mb-1.5">
              Notes
            </label>
            <Textarea
              name="notes"
              className="bg-[#020817] border-[#1e293b] text-white min-h-[80px]"
              placeholder="Any initial notes about this client..."
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd] font-semibold h-11"
        >
          <UserPlus className="size-4" />
          {loading ? "Creating..." : "Create Client"}
        </Button>
      </form>
    </div>
  );
}
