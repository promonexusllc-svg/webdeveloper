import { useConvexAuth } from "convex/react";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { APP_NAME } from "@/lib/constants";
import { Button } from "./ui/button";

const navLinks = [
  { href: "/#services", label: "Services" },
  { href: "/#portfolio", label: "Portfolio" },
  { href: "/#contact", label: "Contact" },
];

export function Header() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("/#")) {
      const id = href.replace("/#", "");
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-[#1e293b]">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            <img src="/logo.png" alt="PromoNexus" className="h-9 w-auto" />
            <span className="hidden sm:inline text-white">
              {APP_NAME}
              <span className="text-[#00b4ff] ml-0.5 font-light"> LLC</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => handleNavClick(link.href)}
                className="text-sm text-[#94a3b8] hover:text-[#00b4ff] transition-colors duration-300"
              >
                {link.label}
              </button>
            ))}
            <div className="w-px h-5 bg-[#1e293b]" />
            {isLoading ? null : isAuthenticated ? (
              <Button size="sm" asChild className="bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd] glow-btn">
                <Link to="/dashboard">
                  Client Portal
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              !isAuthPage && (
                <Button size="sm" asChild className="bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd] glow-btn">
                  <Link to="/login">Client Portal</Link>
                </Button>
              )
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-[#94a3b8] hover:text-white p-2"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#1e293b] py-4 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left text-sm text-[#94a3b8] hover:text-[#00b4ff] py-2 transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="neon-line my-3" />
            {isLoading ? null : isAuthenticated ? (
              <Button size="sm" asChild className="w-full bg-[#00b4ff] text-[#020817] hover:bg-[#0099dd]">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                  Client Portal
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              !isAuthPage && (
                <Button size="sm" asChild className="w-full bg-[#00b4ff] text-[#020817]">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Client Portal</Link>
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </header>
  );
}
