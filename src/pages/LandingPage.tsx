import { useMutation } from "convex/react";
import {
  ArrowRight,
  Code2,

  Globe,
  HeadphonesIcon,
  Layers,
  Palette,
  Rocket,
  Search,
  Server,
  Shield,
  Sparkles,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";

/* ─── Portfolio Data ─── */
const portfolioItems = [
  {
    name: "Charity Swipes",
    type: "Community Platform",
    desc: "A community-driven platform connecting donors with causes through an innovative swipe interface.",
    image: "/portfolio/charity-swipes.jpg",
    featured: true,
  },
  {
    name: "Boonies on the Bayou",
    type: "Restaurant",
    desc: "Slow-smoked barbecue, fresh Gulf seafood & Southern sides with waterfront dining in Bay St. Louis, MS.",
    image: "/portfolio/boonies.jpg",
  },
  {
    name: "Butcher Block Steak House",
    type: "Restaurant",
    desc: "Premium hand-cut steaks, Gulf seafood & Southern comfort across four Mississippi Gulf Coast locations.",
    image: "/portfolio/butcher-block.jpg",
  },
  {
    name: "Dan B. Murphy's",
    type: "Restaurant & Bar",
    desc: "A local favorite since 1981 — three floors of great food, cold drinks & stunning harbor views.",
    image: "/portfolio/danbs.jpg",
  },
  {
    name: "Cosmos Café",
    type: "Breakfast & Lunch",
    desc: "Space-themed breakfast and lunch café at The Pearl Hotel — beignets, specialty coffee & more.",
    image: "/portfolio/cosmos.jpg",
  },
  {
    name: "Hen House",
    type: "Cocktail & Wine Bar",
    desc: "Elevated cocktails, curated wines & artisan small bites in Bay St. Louis' Depot District.",
    image: "/portfolio/hen-house.jpg",
  },
  {
    name: "Lemoine's Landing",
    type: "Tiki Bar",
    desc: "Waterfront tiki bar — open-air seating, tropical cocktails & stunning harbor views on Beach Blvd.",
    image: "/portfolio/lemoines.jpg",
  },
  {
    name: "The Ugly Pirate",
    type: "Cafe & Bar",
    desc: "Mississippi's first pirate pub & café — legendary pizza, overstuffed gyros & 16 craft beers on tap.",
    image: "/portfolio/ugly-pirate.jpg",
  },
  {
    name: "Wicked Pig Kitchen",
    type: "Restaurant & Bar",
    desc: "Southern-inspired bistro featuring sensational smoked meats, craft cocktails & much more.",
    image: "/portfolio/wickedpig.jpg",
  },
  {
    name: "Rickey's on Coleman",
    type: "Seafood & Cajun",
    desc: "Waveland's beloved seafood & Cajun restaurant — Gulf Coast classics & a 25-year legacy reborn.",
    image: "/portfolio/rickeys.jpg",
  },
  {
    name: "Sparkles Travel Group",
    type: "Travel & Tourism",
    desc: "Luxury travel agency — cruises, destination weddings, custom itineraries & all-inclusive getaways worldwide.",
    image: "/portfolio/sparkles-travel.jpg",
  },
];

/* ─── Services Data ─── */
const services = [
  {
    icon: Code2,
    title: "Custom Web Development",
    desc: "Hand-coded, performance-optimized websites built from scratch. No templates, no bloat — just clean, fast code tailored to your brand.",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    desc: "Modern, conversion-focused designs that captivate visitors and drive action. Every pixel placed with purpose.",
  },
  {
    icon: Server,
    title: "Serverless Backends",
    desc: "Real-time databases, authentication, and API integrations powered by cutting-edge serverless architecture. Scalable from day one.",
  },
  {
    icon: Globe,
    title: "Domain & Hosting",
    desc: "Full deployment management — domain configuration, SSL certificates, CDN setup, and ongoing hosting optimization.",
  },
  {
    icon: Search,
    title: "SEO Optimization",
    desc: "Technical SEO, meta optimization, and performance tuning to ensure your site ranks and converts.",
  },
  {
    icon: HeadphonesIcon,
    title: "Ongoing Support",
    desc: "Dedicated client portal with ticket system for quick updates, bug fixes, and continuous improvements.",
  },
];

/* ─── Stats ─── */
const stats = [
  { value: "10+", label: "Projects Delivered" },
  { value: "100%", label: "Client Satisfaction" },
  { value: "< 2s", label: "Avg. Load Time" },
  { value: "24/7", label: "Client Support" },
];

export function LandingPage() {
  const submitContact = useMutation(api.contacts.submit);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await submitContact({
        name: formState.name,
        email: formState.email,
        company: formState.company || undefined,
        phone: formState.phone || undefined,
        message: formState.message,
      });
      toast.success("Message sent! We'll be in touch soon.");
      setFormState({ name: "", email: "", company: "", phone: "", message: "" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden grid-bg">
        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#00b4ff] rounded-full opacity-[0.04] blur-[120px]" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-[#6366f1] rounded-full opacity-[0.04] blur-[120px]" />

        {/* Background hero image — contained to right side, blended */}
        <div
          className="absolute inset-y-0 right-0 w-[55%] hidden lg:block"
          style={{
            backgroundImage: "url(/eric-hero.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.5) 80%, transparent 100%), linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.4) 75%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.5) 80%, transparent 100%), linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.4) 75%, transparent 100%)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
            opacity: 0.75,
          }}
        />

        <div className="container relative z-10 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00b4ff20] bg-[#00b4ff08] backdrop-blur-sm text-xs text-[#00b4ff] mb-6">
              <Sparkles className="size-3" />
              Web Development for Commercial Businesses
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="text-white drop-shadow-lg">We Build Websites</span>
              <br />
              <span className="text-white drop-shadow-lg">That Drive </span>
              <span className="text-[#00b4ff] glow-text">Revenue</span>
            </h1>

            <p className="text-lg text-[#94a3b8] max-w-xl mb-8 leading-relaxed drop-shadow-md">
              PromoNexus LLC crafts high-performance, custom-coded websites for
              restaurants, bars, retail, and commercial businesses. No templates.
              No shortcuts. Just results.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd] font-semibold glow-btn"
                onClick={() =>
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Start Your Project
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#1e293b] text-[#94a3b8] hover:border-[#00b4ff40] hover:text-white hover:bg-white/5 backdrop-blur-sm"
                onClick={() =>
                  document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                View Our Work
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom fade line */}
        <div className="absolute bottom-0 left-0 right-0 neon-line" />
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="border-y border-[#1e293b] bg-[#050d1a]">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#00b4ff] glow-text mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-[#64748b] uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section id="services" className="py-24 relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00b4ff] rounded-full opacity-[0.02] blur-[100px]" />
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00b4ff20] bg-[#00b4ff08] text-xs text-[#00b4ff] mb-4">
              <Layers className="size-3" />
              What We Do
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Full-Stack Web Solutions
            </h2>
            <p className="text-[#94a3b8] max-w-2xl mx-auto">
              From concept to deployment, we handle every layer of your digital presence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc) => (
              <div
                key={svc.title}
                className="group p-6 rounded-xl glow-border glow-border-hover bg-[#0a1628]/60 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1"
              >
                <div className="size-11 rounded-lg bg-[#00b4ff10] border border-[#00b4ff20] flex items-center justify-center mb-4 group-hover:bg-[#00b4ff15] transition-colors">
                  <svc.icon className="size-5 text-[#00b4ff]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {svc.title}
                </h3>
                <p className="text-sm text-[#94a3b8] leading-relaxed">
                  {svc.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="neon-line" />

      {/* ═══ PORTFOLIO ═══ */}
      <section id="portfolio" className="py-24 relative bg-[#050d1a]/50">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#6366f1] rounded-full opacity-[0.02] blur-[150px]" />
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00b4ff20] bg-[#00b4ff08] text-xs text-[#00b4ff] mb-4">
              <Rocket className="size-3" />
              Our Work
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Projects We've Delivered
            </h2>
            <p className="text-[#94a3b8] max-w-2xl mx-auto">
              From local restaurants to community platforms — every project gets our full attention and expertise.
            </p>
          </div>

          {/* Featured project */}
          <div className="mb-8">
            {portfolioItems.filter(p => p.featured).map((item) => (
              <div
                key={item.name}
                className="group rounded-xl glow-border bg-gradient-to-br from-[#0a1628] to-[#0a1628]/60 backdrop-blur-sm relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00b4ff] rounded-full opacity-[0.03] blur-[80px] group-hover:opacity-[0.06] transition-opacity" />
                <div className="relative z-10 flex flex-col lg:flex-row gap-0">
                  <div className="lg:w-3/5 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 sm:h-64 lg:h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-700"
                    />
                  </div>
                  <div className="flex-1 p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{item.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#00b4ff15] text-[#00b4ff] text-xs font-medium border border-[#00b4ff20]">
                        Featured
                      </span>
                    </div>
                    <p className="text-xs text-[#64748b] uppercase tracking-wider mb-3">{item.type}</p>
                    <p className="text-[#94a3b8] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Portfolio grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {portfolioItems.filter(p => !p.featured).map((item) => (
              <div
                key={item.name}
                className="group rounded-xl glow-border glow-border-hover bg-[#0a1628]/60 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 overflow-hidden"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-top group-hover:scale-[1.05] transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />

                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-white mb-1">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#00b4ff80] uppercase tracking-wider mb-2">
                    {item.type}
                  </p>
                  <p className="text-sm text-[#94a3b8] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="neon-line" />

      {/* ═══ WHY US ═══ */}
      <section className="py-24 relative">
        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00b4ff20] bg-[#00b4ff08] text-xs text-[#00b4ff] mb-4">
                <Shield className="size-3" />
                Why PromoNexus
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Built Different. <span className="text-[#00b4ff]">Built Better.</span>
              </h2>
              <p className="text-[#94a3b8] leading-relaxed mb-8">
                We don't use WordPress themes or drag-and-drop builders. Every line of code is written by hand, optimized for speed, and designed to convert visitors into customers.
              </p>
              <div className="space-y-4">
                {[
                  "Hand-coded — no bloated page builders",
                  "Mobile-first responsive design",
                  "Real-time serverless backends",
                  "Dedicated support portal for every client",
                  "SEO-optimized from the ground up",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="size-6 rounded-full bg-[#00b4ff15] border border-[#00b4ff30] flex items-center justify-center shrink-0">
                      <div className="size-1.5 rounded-full bg-[#00b4ff]" />
                    </div>
                    <span className="text-sm text-[#cbd5e1]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech stack visual */}
            <div className="p-8 rounded-xl glow-border bg-[#0a1628]/40 backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-6">Our Technology Stack</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "HTML5 / CSS3", sub: "Semantic & accessible" },
                  { name: "JavaScript", sub: "Vanilla & frameworks" },
                  { name: "React", sub: "Component architecture" },
                  { name: "Convex", sub: "Serverless backend" },
                  { name: "Tailwind CSS", sub: "Utility-first styling" },
                  { name: "Vercel", sub: "Edge deployment" },
                ].map((tech) => (
                  <div
                    key={tech.name}
                    className="p-3 rounded-lg bg-[#111d33]/60 border border-[#1e293b] hover:border-[#00b4ff20] transition-colors"
                  >
                    <div className="text-sm font-medium text-white">{tech.name}</div>
                    <div className="text-xs text-[#64748b]">{tech.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="neon-line" />

      {/* ═══ CONTACT ═══ */}
      <section id="contact" className="py-24 relative bg-[#050d1a]/50">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00b4ff] rounded-full opacity-[0.02] blur-[150px]" />
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00b4ff20] bg-[#00b4ff08] text-xs text-[#00b4ff] mb-4">
                <Sparkles className="size-3" />
                Get In Touch
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Elevate Your Business?
              </h2>
              <p className="text-[#94a3b8]">
                Tell us about your project. We'll get back to you within 24 hours.
              </p>
            </div>

            <form
              onSubmit={handleContactSubmit}
              className="p-8 rounded-xl glow-border bg-[#0a1628]/60 backdrop-blur-sm space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                    Full Name <span className="text-[#00b4ff]">*</span>
                  </label>
                  <Input
                    placeholder="John Smith"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="bg-[#111d33] border-[#1e293b] text-white placeholder:text-[#475569] focus:border-[#00b4ff] focus:ring-[#00b4ff40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                    Email <span className="text-[#00b4ff]">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="john@company.com"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="bg-[#111d33] border-[#1e293b] text-white placeholder:text-[#475569] focus:border-[#00b4ff] focus:ring-[#00b4ff40]"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                    Company
                  </label>
                  <Input
                    placeholder="Your Company"
                    value={formState.company}
                    onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                    className="bg-[#111d33] border-[#1e293b] text-white placeholder:text-[#475569] focus:border-[#00b4ff] focus:ring-[#00b4ff40]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formState.phone}
                    onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                    className="bg-[#111d33] border-[#1e293b] text-white placeholder:text-[#475569] focus:border-[#00b4ff] focus:ring-[#00b4ff40]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">
                  Project Details <span className="text-[#00b4ff]">*</span>
                </label>
                <Textarea
                  rows={5}
                  placeholder="Tell us about your project — what do you need built, your timeline, and any specific features..."
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  className="bg-[#111d33] border-[#1e293b] text-white placeholder:text-[#475569] focus:border-[#00b4ff] focus:ring-[#00b4ff40] resize-none"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd] font-semibold glow-btn"
              >
                {submitting ? "Sending..." : "Send Message"}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className="py-16 border-t border-[#1e293b] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00b4ff08] via-transparent to-[#6366f108]" />
        <div className="container relative z-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Already a Client?
          </h2>
          <p className="text-[#94a3b8] mb-6 max-w-md mx-auto">
            Access your support portal to submit tickets, track progress, and get help with your projects.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd] font-semibold glow-btn"
          >
            <Link to="/login">
              Access Client Portal
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ═══ PAYMENT METHODS ═══ */}
      <section className="py-10 border-t border-[#1e293b] bg-[#050d1a]/40">
        <div className="container">
          <div className="flex flex-col items-center gap-5">
            <span className="text-[#475569] uppercase text-xs tracking-wider font-semibold">Accepted Payments</span>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-[#94a3b8]">
              <span className="flex items-center gap-2.5">
                <img src="/icons/cashapp.svg" alt="Cash App" className="h-6 w-6" />
                <span className="text-white font-medium">$promonexuswebdesign</span>
              </span>
              <span className="flex items-center gap-2.5">
                <img src="/icons/paypal.svg" alt="PayPal" className="h-6 w-6" />
                <span className="text-white font-medium">@EricTomchik</span>
              </span>
              <span className="flex items-center gap-2.5">
                <img src="/icons/venmo.svg" alt="Venmo" className="h-6 w-6" />
                <span className="text-white font-medium">@PromoNexusLLC</span>
              </span>
              <span className="flex items-center gap-2.5">
                <img src="/icons/zelle.svg" alt="Zelle" className="h-6 w-6 rounded" />
                <span className="text-white font-medium">(228) 344-5724</span>
              </span>
              <span className="flex items-center gap-2.5">
                <img src="/icons/applecash.svg" alt="Apple Cash" className="h-6 w-6 rounded" />
                <span className="text-white font-medium">(228) 344-5724</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[#1e293b] py-10 bg-[#020817]">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="PromoNexus" className="h-8 w-auto" />
              <span className="text-sm text-[#64748b]">
                © {new Date().getFullYear()} PromoNexus LLC. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#475569]">
              <button type="button" onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#00b4ff] transition-colors">Services</button>
              <button type="button" onClick={() => document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#00b4ff] transition-colors">Portfolio</button>
              <button type="button" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} className="hover:text-[#00b4ff] transition-colors">Contact</button>
              <Link to="/login" className="hover:text-[#00b4ff] transition-colors">Client Portal</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
