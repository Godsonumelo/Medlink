import { Link } from "react-router-dom";
import { Activity, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const QUICK_LINKS = [
  { name: "Home", path: "/" },
  { name: "Doctors", path: "/doctors" },
  { name: "Hospitals", path: "/hospitals" },
  { name: "Services", path: "/services" },
  { name: "About Us", path: "/about" },
];

const SUPPORT_LINKS = [
  { name: "Help Center", path: "/contact" },
  { name: "Privacy Policy", path: "/about" },
  { name: "Terms of Service", path: "/about" },
  { name: "FAQs", path: "/contact" },
];

const SOCIALS = [
  { icon: Facebook, href: "#" },
  { icon: Twitter, href: "#" },
  { icon: Instagram, href: "#" },
  { icon: Linkedin, href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white">
      <div className="container-medlink py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
          {/* Column 1 — Logo & Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Med<span className="text-[#22D3EE]">Link</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-6">
              Connecting patients with quality healthcare. Find doctors,
              book appointments, and manage your health journey with ease.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0F766E] transition-colors"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-white">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((l) => (
                <li key={l.name}>
                  <Link
                    to={l.path}
                    className="text-sm text-gray-400 hover:text-[#22D3EE] transition-colors"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-white">
              Support
            </h4>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((l) => (
                <li key={l.name}>
                  <Link
                    to={l.path}
                    className="text-sm text-gray-400 hover:text-[#22D3EE] transition-colors"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact Info */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-white">
              Contact Info
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#22D3EE] mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400 leading-relaxed">
                  123 Health Street, Medical City, MC 12345
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#22D3EE] shrink-0" />
                <span className="text-sm text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#22D3EE] shrink-0" />
                <span className="text-sm text-gray-400">support@medlink.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container-medlink py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} MedLink. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Sitemap"].map((t) => (
              <Link
                key={t}
                to="/about"
                className="text-xs text-gray-500 hover:text-[#22D3EE] transition-colors"
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
