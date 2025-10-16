"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  Facebook,
  Linkedin,
  Globe2,
  Phone,
  Mail,
  MapPin,
  Pill,
  Heart,
  Shield,
  Sparkles,
} from "lucide-react";

/*************************
 * PublicNavbar (Wan Ofi Pharmacy)
 *************************/
export function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const linkClass = (href: string) => {
    const active = pathname === href;
    return `
      inline-flex items-center border-b-2 px-3 py-2 text-sm font-medium transition-colors
      ${active
        ? "text-emerald-700 border-emerald-600"
        : "text-gray-700 border-transparent hover:text-emerald-700 hover:border-emerald-500"}
    `;
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-white/95 bg-white/95 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <Pill className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">Wan Ofi</span>
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex bg-emerald-50 text-emerald-700 border-emerald-200">
              Pharmacy
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={linkClass(l.href)}
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="h-6 w-px bg-gray-200" />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hover:text-emerald-700">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              onClick={() => setIsMenuOpen((o) => !o)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div id="mobile-nav" className="md:hidden pb-4">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 border-t rounded-b-xl">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors
                      ${active
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/60"}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {l.label}
                  </Link>
                );
              })}
              <div className="flex gap-2 px-3 pt-2">
                <Link href="/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full hover:text-emerald-700">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Subtle gradient underline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
    </nav>
  );
}

/*************************
 * PublicFooter (Wan Ofi Pharmacy)
 *************************/
export function PublicFooter() {
  const year = new Date().getFullYear();

  const footerLinks = {
    "Products": [
      { name: "Prescription Management", href: "/products/prescription" },
      { name: "OTC Medications", href: "/products/otc" },
      { name: "Cosmetics & Beauty", href: "/products/cosmetics" },
      { name: "Healthcare Accessories", href: "/products/accessories" },
    ],
    "Solutions": [
      { name: "Pharmacy Management", href: "/solutions/pharmacy" },
      { name: "Chain Operations", href: "/solutions/chain" },
      { name: "Compliance & Quality", href: "/solutions/compliance" },
      { name: "Analytics & Reporting", href: "/solutions/analytics" },
    ],
    "Support": [
      { name: "Documentation", href: "/docs" },
      { name: "Training", href: "/training" },
      { name: "Support Center", href: "/support" },
      { name: "System Status", href: "/status" },
    ],
    "Company": [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Partners", href: "/partners" },
      { name: "Contact", href: "/contact" },
    ],
  };

  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand / About */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <Pill className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white">Wan Ofi</span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-4">
              Modern pharmacy and cosmetic retail management platform—prescription tracking, inventory control, and patient care.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="Website" className="text-slate-400 hover:text-white transition-colors">
                <Globe2 className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Facebook" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold tracking-wider text-white uppercase mb-3">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-slate-300 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>


        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">© {year} Wan Ofi Pharmacy. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-slate-400 hover:text-white">Privacy</Link>
            <Link href="/terms" className="text-slate-400 hover:text-white">Terms</Link>
            <Link href="/cookies" className="text-slate-400 hover:text-white">Cookies</Link>
          </div>
        </div>
      </div>

      {/* Subtle gradient underline */}
      <div className="h-[3px] w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
    </footer>
  );
}